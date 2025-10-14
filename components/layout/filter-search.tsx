// "use client";

// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { apiRequest } from "@/lib/axios";
// import { Filter, Search } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Input } from "../ui/input";

// type Tahapan = {
//   id: string;
//   title: string;
//   numbers?: number;
//   details?: string;
// };

// type Kategori = {
//   id: string;
//   name: string;
//   tahap_id?: string;
//   tahap_title?: string;
// };

// interface FilterSearchProps {
//   onSearch?: (filters: { query: string; tahap: string; kategori: string }) => void;
//   onReset?: () => void;
// }

// export default function FilterSearch({ onSearch, onReset }: FilterSearchProps) {
//   const [tahapan, setTahapan] = useState<Tahapan[]>([]);
//   const [kategori, setKategori] = useState<Kategori[]>([]);
//   const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
//   const [selectedTahap, setSelectedTahap] = useState<string>("");
//   const [selectedKategori, setSelectedKategori] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [loading, setLoading] = useState(false);

//   // Fetch tahapan
//   const fetchTahapan = async () => {
//     try {
//       const response = await apiRequest("/private/tahap");
//       const data = Array.isArray(response?.data?.data) ? response.data.data : [];
//       console.log("📋 Data tahapan:", data);
//       setTahapan(data);
//     } catch (error) {
//       console.error("Gagal fetch tahapan:", error);
//       setTahapan([]);
//     }
//   };

//   // Fetch semua kategori
//   const fetchAllKategori = async () => {
//     try {
//       const response = await apiRequest("/private/kategori");

//       let kategoriData = [];

//       if (Array.isArray(response?.data?.data)) {
//         kategoriData = response.data.data;
//       } else if (Array.isArray(response?.data?.data?.data)) {
//         kategoriData = response.data.data.data;
//       } else if (Array.isArray(response?.data)) {
//         kategoriData = response.data;
//       }

//       const mapped = kategoriData.map((item: any) => ({
//         id: item.id,
//         name: item.name,
//         tahap_id: item.tahap_id || item.tahap?.id || null,
//         tahap_title: item.tahap?.title || "-",
//       }));

//       console.log("📋 Data kategori:", mapped);
//       setKategori(mapped);
//     } catch (error) {
//       console.error("Gagal fetch kategori:", error);
//       setKategori([]);
//     }
//   };

//   // Filter kategori berdasarkan tahap yang dipilih
//   const filterKategoriByTahap = (tahapId: string) => {
//     if (!tahapId) {
//       setFilteredKategori([]);
//       return;
//     }

//     const filtered = kategori.filter((item) => item.tahap_id === tahapId);
//     console.log(`🔍 Filter kategori untuk tahap ${tahapId}:`, filtered);
//     setFilteredKategori(filtered);
//   };

//   // Handle search
//   const handleSearch = () => {
//     const filters = {
//       query: searchQuery,
//       tahap: selectedTahap,
//       kategori: selectedKategori,
//     };

//     console.log("🔍 Mengirim filter ke parent:", filters);
//     onSearch?.(filters);
//   };

//   // Handle Enter key press
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   // Reset filters
//   const handleResetFilters = () => {
//     console.log("🔄 Reset filter lokal");
//     setSelectedTahap("");
//     setSelectedKategori("");
//     setSearchQuery("");
//     setFilteredKategori([]);
//     onReset?.();
//   };

//   // Auto search ketika tahap atau kategori berubah
//   useEffect(() => {
//     if (selectedTahap || selectedKategori) {
//       const filters = {
//         query: searchQuery,
//         tahap: selectedTahap,
//         kategori: selectedKategori,
//       };
//       console.log("🔄 Auto search karena filter berubah:", filters);
//       onSearch?.(filters);
//     }
//   }, [selectedTahap, selectedKategori]);

//   useEffect(() => {
//     fetchTahapan();
//     fetchAllKategori();
//   }, []);

//   useEffect(() => {
//     if (selectedTahap) {
//       filterKategoriByTahap(selectedTahap);
//     } else {
//       setFilteredKategori([]);
//       setSelectedKategori("");
//     }
//   }, [selectedTahap, kategori]);

//   // Get selected tahap name for display
//   const getSelectedTahapName = () => {
//     if (!selectedTahap) return "Semua Tahap";
//     const tahap = tahapan.find((t) => t.id === selectedTahap);
//     return tahap ? `Tahap ${tahap.numbers} : ${tahap.title}` : "Semua Tahap";
//   };

//   // Get selected kategori name for display
//   const getSelectedKategoriName = () => {
//     if (!selectedKategori) return "Semua Kategori";
//     const kat = kategori.find((k) => k.id === selectedKategori);
//     return kat ? kat.name : "Semua Kategori";
//   };

//   return (
//     <div className="flex flex-col gap-3 w-full">
//       {/* Search Bar */}
//       <div className="flex items-center gap-3 w-full">
//         {/* Tombol Filter Tahap */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="flex items-center gap-2 w-48 justify-start">
//               <Filter className="h-4 w-4 text-gray-500" />
//               <span className="text-sm truncate">{getSelectedTahapName()}</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
//             <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedTahap("")}>
//               Semua Tahap
//             </DropdownMenuItem>
//             {tahapan.map((tahap) => (
//               <DropdownMenuItem key={tahap.id} className="cursor-pointer" onClick={() => setSelectedTahap(tahap.id)}>
//                 Tahap {tahap.numbers} : {tahap.title}
//               </DropdownMenuItem>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>

//         {/* Search Input */}
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input type="text" placeholder="Cari produk" className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleKeyPress} />
//         </div>

//         {/* Search Button */}
//         <Button onClick={handleSearch} className="bg-[#0892D8] hover:bg-[#0892D8]/90">
//           Cari
//         </Button>

//         {/* Reset Button - hanya tampil jika ada filter aktif */}
//         {(selectedTahap || selectedKategori || searchQuery) && (
//           <Button variant="outline" onClick={handleResetFilters}>
//             Reset
//           </Button>
//         )}
//       </div>
//       {/* Tombol Filter Kategori - versi tombol flex, bukan dropdown */}
//       {selectedTahap && (
//         <div className="flex gap-2 overflow-x-auto pb-1">
//           <Button
//             onClick={() => setSelectedKategori("")}
//             className={`px-4 py-2 rounded-md text-sm transition-all ${selectedKategori === "" ? "bg-[#FEB941] text-white hover:bg-[#FEB941]/90" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
//           >
//             Semua
//           </Button>

//           {filteredKategori.map((kategori) => (
//             <Button
//               key={kategori.id}
//               onClick={() => setSelectedKategori(kategori.id)}
//               className={`px-4 py-2 rounded-md text-sm transition-all ${selectedKategori === kategori.id ? "bg-[#FEB941] text-white hover:bg-[#FEB941]/90" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
//             >
//               {kategori.name}
//             </Button>
//           ))}

//           {filteredKategori.length === 0 && <p className="text-sm text-gray-400 italic">Tidak ada kategori untuk tahap ini</p>}
//         </div>
//       )}
//     </div>
//   );
// }

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
        console.error("Gagal fetch tahapan:", err);
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
        console.error("Gagal fetch kategori:", err);
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
      console.log("🔍 Auto search:", filters);
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
