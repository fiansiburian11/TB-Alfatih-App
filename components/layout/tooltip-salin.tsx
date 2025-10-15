"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/axios";
import { Files } from "lucide-react";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "./snackbar";

interface DraftPenawaran {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  jenis: string;
  harga_jual: number;
  draft_penawaran: DraftPenawaran[];
}

interface DraftPenawaranProps {
  productId: string;
}

export default function DraftPenawaran({ productId }: DraftPenawaranProps) {
  const [drafts, setDrafts] = useState<DraftPenawaran[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDraftPenawaran = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest("/private/product");
      const products = Array.isArray(res?.data?.data) ? res.data.data : [];

      // Cari produk berdasarkan productId dan ambil draft_penawarannya
      const product = products.find((p: Product) => p.id === productId);
      const productDrafts = product?.draft_penawaran || [];

      setDrafts(productDrafts);
    } catch (error) {
      // console.error("Gagal fetch data draft penawaran:", error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftPenawaran();
  }, [productId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast("Pesan berhasil disalin ke clipboard");
    } catch (err) {
      showErrorToast("Gagal menyalin pesan");
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-20 rounded-[4px]"></div>;
  }

  // Jika tidak ada draft, return null (kosong)
  if (drafts.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 text-[#0892D8]">
        {drafts.map((draft) => (
          <Tooltip key={draft.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(draft.chat);
                }}
              >
                <Files className="mr-1 h-4 w-4" />
                {draft.judul}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-gray-600 text-white text-sm p-2 rounded-md shadow-md">
              <div>
                <p className="mt-1">{draft.chat}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
