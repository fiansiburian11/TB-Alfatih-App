"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/axios";
import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Tahapan = {
  id: string;
  title: string;
  numbers?: number;
  details?: string;
  created_at?: string;
  updated_at?: string;
};

type Kategori = {
  id: string;
  name: string;
  tahap_id?: string;
  tahap_title?: string;
  created_at?: string;
  updated_at?: string;
};

type PaginationInfo = {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
};

export default function ManagementKategori() {
  // ─────────────── STATE ───────────────
  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [tahapanLoading, setTahapanLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query params state
  const [search, setSearch] = useState("");
  const [desc, setDesc] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pagination, setPagination] = useState<PaginationInfo>({
    items_per_page: 5,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // Modal & form
  const [kategoriDialogOpen, setKategoriDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Kategori | null>(null);
  const [name, setName] = useState("");
  const [selectedTahapanId, setSelectedTahapanId] = useState<string>("");
  const [selectedTahapanTitle, setSelectedTahapanTitle] = useState<string>("Pilih Tahapan");
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Ref untuk menyimpan data asli sebelum search
  const originalKategoriRef = useRef<Kategori[]>([]);
  const originalPaginationRef = useRef<PaginationInfo>({
    items_per_page: 5,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // ─────────────── FETCH DATA ───────────────
  const fetchTahapan = async () => {
    try {
      setTahapanLoading(true);
      const response = await apiRequest("/private/tahap");

      const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];

      setTahapan(data);
    } catch {
      setTahapan([]);
    } finally {
      setTahapanLoading(false);
    }
  };

  const fetchKategori = async (page: number = currentPage, searchQuery: string = search, showLoading: boolean = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("items_per_page", itemsPerPage.toString());
      if (searchQuery) queryParams.append("search", searchQuery);
      queryParams.append("desc", desc ? "true" : "false");

      const response = await apiRequest(`/private/kategori?${queryParams.toString()}`);

      let kategoriData: any[] = [];

      if (Array.isArray(response)) {
        kategoriData = response;
      } else if (Array.isArray(response?.data)) {
        kategoriData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        kategoriData = response.data.data;
      } else if (Array.isArray(response?.data?.data?.data)) {
        kategoriData = response.data.data.data;
      }

      const mapped = kategoriData.map((item: any) => ({
        id: item.id,
        name: item.name,
        tahap_title: item.tahap?.title || item.tahap_title || "-",
        tahap_id: item.tahap_id || item.tahap?.id,
      }));

      setKategori(mapped);

      // 🟢 Deklarasikan total di awal
      const total = response?.data?.pagination?.total_data || response?.data?.total || response?.total || kategoriData.length;

      // Update pagination
      if (response?.data?.pagination) {
        setPagination(response.data.pagination);
      } else {
        setPagination({
          items_per_page: itemsPerPage,
          page: page,
          max_page: Math.ceil(total / itemsPerPage) || 1,
          total_data: total,
        });
      }

      // Simpan data asli jika ini adalah load tanpa search
      if (!searchQuery) {
        originalKategoriRef.current = mapped;

        if (response?.data?.pagination) {
          originalPaginationRef.current = response.data.pagination;
        } else {
          originalPaginationRef.current = {
            items_per_page: itemsPerPage,
            page: page,
            max_page: Math.ceil(total / itemsPerPage) || 1,
            total_data: total,
          };
        }
      }
    } catch (error) {
      // console.error("Gagal mengambil data kategori:", error);
      setError("Gagal mengambil data kategori");
      setKategori([]);
      setPagination({
        items_per_page: itemsPerPage,
        page: 1,
        max_page: 1,
        total_data: 0,
      });
    } finally {
      if (showLoading) setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchTahapan();
    fetchKategori(1, ""); // Reset ke page 1 tanpa search
  }, []);

  useEffect(() => {
    fetchKategori(1, "", false); // Reset ke page 1 ketika itemsPerPage berubah
  }, [itemsPerPage]);

  // Debounce search untuk menghindari terlalu banyak request
  useEffect(() => {
    // Jika search kosong, kembalikan ke data asli tanpa API call
    if (search.trim() === "") {
      setIsSearching(false);
      if (originalKategoriRef.current.length > 0) {
        setKategori(originalKategoriRef.current);
        setPagination(originalPaginationRef.current);
        setCurrentPage(1);
      }
      return;
    }

    // Jika ada search query, lakukan API call dengan debounce
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchKategori(1, search, false);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      setCurrentPage(page);
      fetchKategori(page, search, false);
    }
  };

  // Handler untuk items per page
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // ─────────────── HANDLERS ───────────────
  const resetForm = () => {
    setName("");
    setSelectedTahapanId("");
    setSelectedTahapanTitle("Pilih Tahapan");
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleSelectTahapan = (tahap: Tahapan) => {
    setSelectedTahapanId(tahap.id);
    setSelectedTahapanTitle(tahap.title);
  };

  const handleCreateKategori = async () => {
    if (!name.trim() || !selectedTahapanId) {
      showErrorToast("Nama kategori dan tahapan harus diisi");
      return;
    }

    setIsFormLoading(true);
    try {
      const payload = { tahap_id: selectedTahapanId, name: name.trim() };
      await apiRequest("/private/admin/kategori", { method: "POST", data: payload });

      await fetchKategori(currentPage, search, false);
      setKategoriDialogOpen(false);
      resetForm();
      showSuccessToast("Kategori berhasil dibuat!");
    } catch (error: any) {
      showErrorToast(`Gagal membuat kategori: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateKategori = async () => {
    if (!name.trim() || !editingItem || !selectedTahapanId) {
      showErrorToast("Nama kategori dan tahapan harus diisi");
      return;
    }

    setIsFormLoading(true);
    try {
      const payload = { id: editingItem.id, tahap_id: selectedTahapanId, name: name.trim() };
      await apiRequest("/private/admin/kategori", { method: "PUT", data: payload });

      await fetchKategori(currentPage, search, false);
      setKategoriDialogOpen(false);
      resetForm();
      showSuccessToast("Kategori berhasil diupdate!");
    } catch (error: any) {
      showErrorToast(`Gagal mengupdate kategori: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditKategori = (item: Kategori) => {
    setEditingItem(item);
    setName(item.name);
    const selectedTahap = tahapan.find((t) => t.id === item.tahap_id);
    if (selectedTahap) {
      setSelectedTahapanId(selectedTahap.id);
      setSelectedTahapanTitle(selectedTahap.title);
    }
    setIsEditing(true);
    setKategoriDialogOpen(true);
  };

  // Generate page numbers untuk pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.max_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading)
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm flex justify-center items-center h-40">
        <p>Loading data kategori...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => fetchKategori(1, "", true)} className="mt-2 bg-[#0892D8] hover:bg-[#067ab1] text-white">
          Coba Lagi
        </Button>
      </div>
    );

  // ─────────────── RENDER ───────────────
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="p-6  border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tombol Tambah */}
          <Button
            onClick={() => {
              resetForm();
              setKategoriDialogOpen(true);
            }}
            className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex gap-2 w-fit"
          >
            <Plus size={18} /> Tambah Kategori
          </Button>

          {/* Input Search — full width */}
          <div className="relative flex-1 w-full ">
            <Input placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-full" />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0892D8]" />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden ">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E9F7FF] hover:bg-[#E9F7FF]">
                <TableHead className="text-[#0892D8] font-semibold">No</TableHead>
                <TableHead className="text-[#0892D8] font-semibold">Nama Kategori</TableHead>
                <TableHead className="text-[#0892D8] font-semibold">Tahapan</TableHead>
                <TableHead className="text-[#0892D8] font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategori.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-12 w-12 text-gray-300 mb-2" />
                      <p>{search ? "Kategori tidak ditemukan" : "Tidak ada data kategori"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                kategori.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.tahap_title}</TableCell>
                    <TableCell className="text-center">
                      <Button size="icon"  onClick={() => handleEditKategori(item)} className="bg-[#FEB941] text-white hover:bg-[#FEB941]/80">
                        <Pencil size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 mt-4 mb-4">
          {/* Baris utama: pakai grid agar tengahnya benar-benar center */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 items-center">
            {/* Kiri: Info data */}
            <div className="flex items-center sm:justify-start justify-center">
              {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total_data)} dari {pagination.total_data} kategori
              {search && <span className="ml-2 text-[#0892D8]">(Hasil pencarian: "{search}")</span>}
            </div>

            {/* Tengah: Pagination */}
            {pagination.max_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-2 sm:mt-0">
                {/* Previous Button */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16} />
                </Button>

                {/* Page Numbers */}
                {generatePageNumbers().map((page) => (
                  <Button key={page} variant={currentPage === page ? "default" : "outline"} className={currentPage === page ? "bg-[#0892D8] text-white" : "border-[#0892D8] text-[#0892D8]"} onClick={() => handlePageChange(page)}>
                    {page}
                  </Button>
                ))}

                {/* Next Button */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.max_page}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Kanan: Dropdown */}
            <div className="flex justify-center sm:justify-end items-center gap-2 mt-2 sm:mt-0">
              <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#0892D8]">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>per halaman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Form */}
      <Dialog open={kategoriDialogOpen} onOpenChange={setKategoriDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Kategori</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama kategori" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tahapan</label>
              {tahapanLoading ? (
                <p className="text-gray-500 text-sm">Memuat tahapan...</p>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTahapanTitle}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                    <DropdownMenuLabel>Pilih Tahapan</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tahapan.length === 0 ? (
                      <DropdownMenuItem disabled>Tidak ada tahapan</DropdownMenuItem>
                    ) : (
                      tahapan.map((tahap) => (
                        <DropdownMenuItem key={tahap.id} onClick={() => handleSelectTahapan(tahap)}>
                          {tahap.title}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setKategoriDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={isEditing ? handleUpdateKategori : handleCreateKategori} disabled={isFormLoading || !name.trim() || !selectedTahapanId} className="bg-[#0892D8] hover:bg-[#067ab1] text-white">
              {isFormLoading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
