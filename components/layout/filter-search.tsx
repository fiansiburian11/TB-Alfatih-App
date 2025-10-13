"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/axios";

type Tahapan = {
  id: string;
  title: string;
  numbers?: number;
  details?: string;
};

type Kategori = {
  id: string;
  name: string;
  tahap_id?: string;
  tahap_title?: string;
};

interface FilterSearchProps {
  onSearch?: (filters: { query: string; tahap: string; kategori: string }) => void;
  onReset?: () => void;
}

export default function FilterSearch({ onSearch, onReset }: FilterSearchProps) {
  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
  const [selectedTahap, setSelectedTahap] = useState<string>("");
  const [selectedKategori, setSelectedKategori] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch tahapan
  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      console.log("📋 Data tahapan:", data);
      setTahapan(data);
    } catch (error) {
      console.error("Gagal fetch tahapan:", error);
      setTahapan([]);
    }
  };

  // Fetch semua kategori
  const fetchAllKategori = async () => {
    try {
      const response = await apiRequest("/private/kategori");

      let kategoriData = [];

      if (Array.isArray(response?.data?.data)) {
        kategoriData = response.data.data;
      } else if (Array.isArray(response?.data?.data?.data)) {
        kategoriData = response.data.data.data;
      } else if (Array.isArray(response?.data)) {
        kategoriData = response.data;
      }

      const mapped = kategoriData.map((item: any) => ({
        id: item.id,
        name: item.name,
        tahap_id: item.tahap_id || item.tahap?.id || null,
        tahap_title: item.tahap?.title || "-",
      }));

      console.log("📋 Data kategori:", mapped);
      setKategori(mapped);
    } catch (error) {
      console.error("Gagal fetch kategori:", error);
      setKategori([]);
    }
  };

  // Filter kategori berdasarkan tahap yang dipilih
  const filterKategoriByTahap = (tahapId: string) => {
    if (!tahapId) {
      setFilteredKategori([]);
      return;
    }

    const filtered = kategori.filter((item) => item.tahap_id === tahapId);
    console.log(`🔍 Filter kategori untuk tahap ${tahapId}:`, filtered);
    setFilteredKategori(filtered);
  };

  // Handle search
  const handleSearch = () => {
    const filters = {
      query: searchQuery,
      tahap: selectedTahap,
      kategori: selectedKategori,
    };

    console.log("🔍 Mengirim filter ke parent:", filters);
    onSearch?.(filters);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    console.log("🔄 Reset filter lokal");
    setSelectedTahap("");
    setSelectedKategori("");
    setSearchQuery("");
    setFilteredKategori([]);
    onReset?.();
  };

  // Auto search ketika tahap atau kategori berubah
  useEffect(() => {
    if (selectedTahap || selectedKategori) {
      const filters = {
        query: searchQuery,
        tahap: selectedTahap,
        kategori: selectedKategori,
      };
      console.log("🔄 Auto search karena filter berubah:", filters);
      onSearch?.(filters);
    }
  }, [selectedTahap, selectedKategori]);

  useEffect(() => {
    fetchTahapan();
    fetchAllKategori();
  }, []);

  useEffect(() => {
    if (selectedTahap) {
      filterKategoriByTahap(selectedTahap);
    } else {
      setFilteredKategori([]);
      setSelectedKategori("");
    }
  }, [selectedTahap, kategori]);

  // Get selected tahap name for display
  const getSelectedTahapName = () => {
    if (!selectedTahap) return "Semua Tahap";
    const tahap = tahapan.find((t) => t.id === selectedTahap);
    return tahap ? `Tahap ${tahap.numbers} : ${tahap.title}` : "Semua Tahap";
  };

  // Get selected kategori name for display
  const getSelectedKategoriName = () => {
    if (!selectedKategori) return "Semua Kategori";
    const kat = kategori.find((k) => k.id === selectedKategori);
    return kat ? kat.name : "Semua Kategori";
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-full">
        {/* Tombol Filter Tahap */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-48 justify-start">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm truncate">{getSelectedTahapName()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedTahap("")}>
              Semua Tahap
            </DropdownMenuItem>
            {tahapan.map((tahap) => (
              <DropdownMenuItem key={tahap.id} className="cursor-pointer" onClick={() => setSelectedTahap(tahap.id)}>
                Tahap {tahap.numbers} : {tahap.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tombol Filter Kategori */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-48 justify-start" disabled={!selectedTahap}>
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm truncate">{getSelectedKategoriName()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedKategori("")}>
              Semua Kategori
            </DropdownMenuItem>
            {filteredKategori.map((kategori) => (
              <DropdownMenuItem key={kategori.id} className="cursor-pointer" onClick={() => setSelectedKategori(kategori.id)}>
                {kategori.name}
              </DropdownMenuItem>
            ))}
            {selectedTahap && filteredKategori.length === 0 && <DropdownMenuItem disabled>Tidak ada kategori untuk tahap ini</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Cari produk (nama, jenis, atau kategori)..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleKeyPress} />
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="bg-[#0892D8] hover:bg-[#0892D8]/90">
          Cari
        </Button>

        {/* Reset Button - hanya tampil jika ada filter aktif */}
        {(selectedTahap || selectedKategori || searchQuery) && (
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        )}
      </div>

      {/* Filter Status Display */}
      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
        <span>Filter aktif:</span>

        {selectedTahap && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Tahap: {getSelectedTahapName()}</span>}

        {selectedKategori && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Kategori: {getSelectedKategoriName()}</span>}

        {searchQuery && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs">Pencarian: "{searchQuery}"</span>}

        {!selectedTahap && !selectedKategori && !searchQuery && <span className="text-gray-400">Tidak ada filter aktif</span>}
      </div>
    </div>
  );
}
