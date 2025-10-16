"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { api } from "@/lib/axios";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";

interface Produk {
  id: string;
  name: string;
  jenis: string;
  type: "inti" | "cross_selling";
}

interface TambahDraftModalProps {
  onSuccess?: () => void;
}

export default function TambahDraftModal({ onSuccess }: TambahDraftModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [judulTemplate, setJudulTemplate] = useState("");
  const [templateChat, setTemplateChat] = useState("");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data produk saat modal dibuka
  useEffect(() => {
    if (open) {
      fetchProduk();
    }
  }, [open]);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await api.get("/private/product");

      if (res.data?.data?.data) {
        setProdukList(res.data.data.data);
      }
    } catch (err) {
      console.error("Gagal fetch data produk:", err);
      setProdukList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan nama produk berdasarkan type
  const getNamaProduk = (produk: Produk) => {
    return produk.type === "inti" ? produk.jenis : produk.name;
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !judulTemplate || !templateChat) {
      showErrorToast("Harap isi semua field");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/private/admin/draft-penawaran", {
        product_id: selectedProduct,
        judul: judulTemplate,
        chat: templateChat,
      });

      // Reset form
      setSelectedProduct("");
      setJudulTemplate("");
      setTemplateChat("");
      setOpen(false);

      // Panggil callback jika ada
      if (onSuccess) {
        onSuccess();
      }

      showSuccessToast("Draft penawaran berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal menambah draft penawaran:", error);
      showErrorToast("Gagal menambah draft penawaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct("");
    setJudulTemplate("");
    setTemplateChat("");
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 px-4 py-2 bg-[#0892D8] text-white rounded-md hover:bg-[#0892D8]/90">
            <Plus />
            Tambah Template Baru
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg w-full border border-dashed border-gray-300">
          <DialogHeader>
            <DialogTitle>Tambah Draft Penawaran</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Nama Produk */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nama Produk</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Memuat produk..." : "Pilih Produk"} />
                </SelectTrigger>
                <SelectContent>
                  {produkList.map((produk) => (
                    <SelectItem key={produk.id} value={produk.id}>
                      {getNamaProduk(produk)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul Template */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Judul Template</label>
              <Input placeholder="Masukkan Judul Template" value={judulTemplate} onChange={(e) => setJudulTemplate(e.target.value)} />
            </div>

            {/* Template Chat */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Template Chat</label>
              <Textarea
                placeholder="Masukkan Template Chat"
                value={templateChat}
                onChange={(e) => setTemplateChat(e.target.value)}
                rows={4}
                className="resize-y"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "hidden",
                }}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="destructive" onClick={handleClose} disabled={submitting}>
              Kembali
            </Button>
            <Button className="bg-[#0892D8] hover:bg-[#0892D8]/90" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menambah..." : "Tambah Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
