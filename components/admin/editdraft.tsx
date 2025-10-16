"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { PencilLine } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";

interface Produk {
  id: string;
  name: string;
  jenis: string;
  type: "inti" | "cross_selling";
}

interface DraftPenawaranType {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

interface EditDraftModalProps {
  draft: DraftPenawaranType;
  onSuccess?: () => void;
}

export default function EditDraftModal({ draft, onSuccess }: EditDraftModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(draft.product_id);
  const [judulTemplate, setJudulTemplate] = useState(draft.judul);
  const [templateChat, setTemplateChat] = useState(draft.chat);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch data produk saat modal dibuka
  useEffect(() => {
    if (open) {
      fetchProduk();
    }
  }, [open]);

  // Update form ketika draft prop berubah
  useEffect(() => {
    if (draft) {
      setSelectedProduct(draft.product_id);
      setJudulTemplate(draft.judul);
      setTemplateChat(draft.chat);
    }
  }, [draft]);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await api.get("/private/product");

      if (res.data?.data?.data) {
        setProdukList(res.data.data.data);
      }
    } catch (err) {
      //   console.error("Gagal fetch data produk:", err);
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
      await api.put("/private/admin/draft-penawaran", {
        id: draft.id,
        product_id: selectedProduct,
        judul: judulTemplate,
        chat: templateChat,
      });

      // Tutup modal
      setOpen(false);

      // Panggil callback jika ada
      if (onSuccess) {
        onSuccess();
      }

      showSuccessToast("Draft penawaran berhasil diupdate!");
    } catch (error) {
      //   console.error("Gagal mengupdate draft penawaran:", error);
      showErrorToast("Gagal mengupdate draft penawaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/private/admin/draft-penawaran`, {
        data: {
          id: draft.id,
        },
      });

      setShowDeleteDialog(false);
      setOpen(false);

      // Panggil callback jika ada
      if (onSuccess) {
        onSuccess();
      }

      showSuccessToast("Draft penawaran berhasil dihapus!");
    } catch (error) {
      //   console.error("Gagal menghapus draft penawaran:", error);
      showErrorToast("Gagal menghapus draft penawaran. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    // Reset ke nilai awal
    setSelectedProduct(draft.product_id);
    setJudulTemplate(draft.judul);
    setTemplateChat(draft.chat);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="px-2 py-1 border rounded font-normal border-[#0892D8] bg-white text-[#0892D8] hover:bg-accent">
            <PencilLine className="w-4 h-4 mr-1" />
            {draft.judul}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg w-full border border-dashed border-gray-300">
          {/* Header dengan tombol close dan delete */}
          <div className="flex justify-between items-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Ubah Draft Penawaran</DialogTitle>
            </DialogHeader>
            <div className="mr-5">
              {/* Tombol Delete */}
              <Button variant="ghost" size="icon" className="h-8 w-8  bg-red-500 hover:bg-red-600" onClick={() => setShowDeleteDialog(true)}>
                <Image src="/assets/delete.png" alt="delete" width={24} height={24} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {/* Nama Produk */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nama Produk</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{produkList.find((p) => p.id === selectedProduct) ? getNamaProduk(produkList.find((p) => p.id === selectedProduct)!) : "Memuat..."}</div>
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
                rows={6}
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
              Batal
            </Button>
            <Button className="bg-[#0892D8] hover:bg-[#0892D8]/90" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Mengupdate..." : "Update Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog untuk konfirmasi hapus */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Draft penawaran akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
