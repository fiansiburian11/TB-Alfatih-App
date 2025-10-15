"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function TambahDraftModal() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [judulTemplate, setJudulTemplate] = useState("");
  const [templateChat, setTemplateChat] = useState("");

  const produkOptions = ["Atap Spandek 3.0", "Granit 60x60", "Semen Merdeka", "Triplek 8 mm"];

  const handleSubmit = () => {
    console.log({ selectedProduct, judulTemplate, templateChat });
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
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Produk" />
                </SelectTrigger>
                <SelectContent>
                  {produkOptions.map((p, idx) => (
                    <SelectItem key={idx} value={p}>
                      {p}
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
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Kembali
            </Button>
            <Button className="bg-[#0892D8] hover:bg-[#0892D8]/90" onClick={handleSubmit}>
              Tambah Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
