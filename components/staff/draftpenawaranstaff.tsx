"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Files } from "lucide-react";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";

interface DraftPenawaran {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

interface DraftPenawaranProps {
  productId: string;
  draftData?: DraftPenawaran[];
  loading?: boolean;
}

export default function DraftPenawaranStaff({ productId, draftData = [], loading = false }: DraftPenawaranProps) {
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

  if (draftData.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-[#0892D8]">
        {draftData.map((draft) => (
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
                <p className="mt-1 whitespace-pre-wrap">{draft.chat}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
