"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { apiRequest } from "@/lib/axios";

type Tahapan = {
  id: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
};

type Kategori = {
  id: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
};

export default function ManagementTahapanKategori() {
  // State untuk data
  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);

  // State untuk modal
  const [tahapanDialogOpen, setTahapanDialogOpen] = useState(false);
  const [kategoriDialogOpen, setKategoriDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tahapan | Kategori | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State untuk form
  const [nama, setNama] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data tahapan
  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahapan"); // Ganti dengan endpoint yang sesuai
      if (response && Array.isArray(response.data)) {
        setTahapan(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data tahapan:", error);
    }
  };

  // Fetch data kategori
  const fetchKategori = async () => {
    try {
      const response = await apiRequest("/private/kategori"); // Ganti dengan endpoint yang sesuai
      if (response && Array.isArray(response.data)) {
        setKategori(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data kategori:", error);
    }
  };

  // Load data saat komponen mount
  useEffect(() => {
    fetchTahapan();
    fetchKategori();
  }, []);

  // Reset form
  const resetForm = () => {
    setNama("");
    setEditingItem(null);
    setIsEditing(false);
  };

  // Handle create tahapan
  const handleCreateTahapan = async () => {
    if (!nama.trim()) return;

    setIsLoading(true);
    try {
      await apiRequest("/private/tahapan", {
        method: "POST",
        data: { nama },
      });
      await fetchTahapan();
      setTahapanDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Gagal membuat tahapan:", error);
      alert("Gagal membuat tahapan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update tahapan
  const handleUpdateTahapan = async () => {
    if (!nama.trim() || !editingItem) return;

    setIsLoading(true);
    try {
      await apiRequest(`/private/tahapan/${editingItem.id}`, {
        method: "PUT",
        data: { nama },
      });
      await fetchTahapan();
      setTahapanDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Gagal mengupdate tahapan:", error);
      alert("Gagal mengupdate tahapan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create kategori
  const handleCreateKategori = async () => {
    if (!nama.trim()) return;

    setIsLoading(true);
    try {
      await apiRequest("/private/kategori", {
        method: "POST",
        data: { nama },
      });
      await fetchKategori();
      setKategoriDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Gagal membuat kategori:", error);
      alert("Gagal membuat kategori");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update kategori
  const handleUpdateKategori = async () => {
    if (!nama.trim() || !editingItem) return;

    setIsLoading(true);
    try {
      await apiRequest(`/private/kategori/${editingItem.id}`, {
        method: "PUT",
        data: { nama },
      });
      await fetchKategori();
      setKategoriDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Gagal mengupdate kategori:", error);
      alert("Gagal mengupdate kategori");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit handler untuk tahapan
  const handleEditTahapan = (item: Tahapan) => {
    setEditingItem(item);
    setNama(item.nama);
    setIsEditing(true);
    setTahapanDialogOpen(true);
  };

  // Edit handler untuk kategori
  const handleEditKategori = (item: Kategori) => {
    setEditingItem(item);
    setNama(item.nama);
    setIsEditing(true);
    setKategoriDialogOpen(true);
  };

  // Open create modal untuk tahapan
  const openCreateTahapan = () => {
    resetForm();
    setTahapanDialogOpen(true);
  };

  // Open create modal untuk kategori
  const openCreateKategori = () => {
    resetForm();
    setKategoriDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section Tahapan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0892D8]">Management Tahapan</h2>
            <Button onClick={openCreateTahapan} className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex gap-2">
              <Plus size={18} /> Tambah Tahapan
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E9F7FF] hover:bg-[#E9F7FF]">
                <TableHead className="text-[#0892D8] font-semibold">No</TableHead>
                <TableHead className="text-[#0892D8] font-semibold">Nama Tahapan</TableHead>
                <TableHead className="text-[#0892D8] font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tahapan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    Tidak ada data tahapan
                  </TableCell>
                </TableRow>
              ) : (
                tahapan.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <Button size="icon" variant="outline" onClick={() => handleEditTahapan(item)} className="bg-[#F9A825] hover:bg-[#d48f1d] text-white border-[#F9A825]">
                        <Pencil size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Section Kategori */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0892D8]">Management Kategori</h2>
            <Button onClick={openCreateKategori} className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex gap-2">
              <Plus size={18} /> Tambah Kategori
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E9F7FF] hover:bg-[#E9F7FF]">
                <TableHead className="text-[#0892D8] font-semibold">No</TableHead>
                <TableHead className="text-[#0892D8] font-semibold">Nama Kategori</TableHead>
                <TableHead className="text-[#0892D8] font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategori.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    Tidak ada data kategori
                  </TableCell>
                </TableRow>
              ) : (
                kategori.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <Button size="icon" variant="outline" onClick={() => handleEditKategori(item)} className="bg-[#F9A825] hover:bg-[#d48f1d] text-white border-[#F9A825]">
                        <Pencil size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal untuk Tahapan */}
      <Dialog open={tahapanDialogOpen} onOpenChange={setTahapanDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{isEditing ? "Edit Tahapan" : "Tambah Tahapan"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Tahapan</label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama tahapan" className="w-full" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setTahapanDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button onClick={isEditing ? handleUpdateTahapan : handleCreateTahapan} disabled={isLoading || !nama.trim()} className="bg-[#0892D8] hover:bg-[#067ab1] text-white">
              {isLoading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal untuk Kategori */}
      <Dialog open={kategoriDialogOpen} onOpenChange={setKategoriDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Kategori</label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama kategori" className="w-full" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setKategoriDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button onClick={isEditing ? handleUpdateKategori : handleCreateKategori} disabled={isLoading || !nama.trim()} className="bg-[#0892D8] hover:bg-[#067ab1] text-white">
              {isLoading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
