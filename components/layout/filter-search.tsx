"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/axios";
import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

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

  // === Fetch Data ===
  useEffect(() => {
    const fetchTahapan = async () => {
      try {
        const res = await apiRequest("/private/tahap");
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        setTahapan(data);
      } catch (err) {
        // console.error("Gagal fetch tahapan:", err);
        setTahapan([]);
      }
    };

    const fetchKategori = async () => {
      try {
        const res = await apiRequest("/private/kategori");
        let kategoriData = [];

        if (Array.isArray(res?.data?.data)) kategoriData = res.data.data;
        else if (Array.isArray(res?.data?.data?.data)) kategoriData = res.data.data.data;
        else if (Array.isArray(res?.data)) kategoriData = res.data;

        const mapped = kategoriData.map((item: any) => ({
          id: item.id,
          name: item.name,
          tahap_id: item.tahap_id || item.tahap?.id || null,
          tahap_title: item.tahap?.title || "-",
        }));

        setKategori(mapped);
      } catch (err) {
        // console.error("Gagal fetch kategori:", err);
        setKategori([]);
      }
    };

    fetchTahapan();
    fetchKategori();
  }, []);

  // === Filter kategori berdasarkan tahap ===
  useEffect(() => {
    if (!selectedTahap) {
      setFilteredKategori([]);
      setSelectedKategori("");
      return;
    }
    const filtered = kategori.filter((k) => k.tahap_id === selectedTahap);
    setFilteredKategori(filtered);
  }, [selectedTahap, kategori]);

  // === Auto-search (debounced) ===
  useEffect(() => {
    const timeout = setTimeout(() => {
      const filters = {
        query: searchQuery,
        tahap: selectedTahap,
        kategori: selectedKategori,
      };
      // console.log("🔍 Auto search:", filters);
      onSearch?.(filters);
    }, 400); // delay 400ms biar gak terlalu sering

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedTahap, selectedKategori]);

  // === UI helper ===
  const getSelectedTahapName = () => {
    if (!selectedTahap) return "Semua Tahap";
    const tahap = tahapan.find((t) => t.id === selectedTahap);
    return tahap ? `Tahap ${tahap.numbers} : ${tahap.title}` : "Semua Tahap";
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Baris utama */}
      <div className="flex items-center gap-3 w-full">
        {/* Filter Tahap */}
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

        {/* Input Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Cari produk..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Tombol kategori horizontal */}
      {selectedTahap && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            onClick={() => setSelectedKategori("")}
            className={`px-4 py-2 rounded-md text-sm transition-all ${selectedKategori === "" ? "bg-[#FEB941] text-white hover:bg-[#FEB941]/90" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Semua
          </Button>

          {filteredKategori.map((k) => (
            <Button
              key={k.id}
              onClick={() => setSelectedKategori(k.id)}
              className={`px-4 py-2 rounded-md text-sm transition-all ${selectedKategori === k.id ? "bg-[#FEB941] text-white hover:bg-[#FEB941]/90" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {k.name}
            </Button>
          ))}

          {filteredKategori.length === 0 && <p className="text-sm text-gray-400 italic">Tidak ada kategori untuk tahap ini</p>}
        </div>
      )}
    </div>
  );
}
