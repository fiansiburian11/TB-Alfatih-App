"use client";

import FilterSearch from "@/components/layout/filter-search";
import DraftPenawaranStaff from "@/components/layout/tooltip-salin";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface DraftPenawaranType {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

interface Produk {
  id: string;
  name: string;
  jenis: string;
  harga_jual: number;
  type: "inti" | "cross_selling";
  kategori?: {
    id: string;
    name: string;
    tahap?: {
      id: string;
      numbers: number;
      title: string;
      details: string;
    };
  };
  draft_penawaran?: DraftPenawaranType[];
}

interface SearchFilters {
  query: string;
  tahap: string;
  kategori: string;
}

export default function DraftPenawaranPage() {
  const [allProduk, setAllProduk] = useState<Produk[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    tahap: "",
    kategori: "",
  });

  // Fungsi untuk mendapatkan nama produk berdasarkan type
  const getNamaProduk = (item: Produk) => {
    return item.type === "inti" ? item.jenis : item.name;
  };

  // Fetch data dari API - TANPA PAGINATION
  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await api.get("/private/product");

      if (res.data?.data?.data) {
        const data = res.data.data.data;

        // Filter hanya produk yang memiliki draft penawaran
        const produkDenganDraft = data.filter((item: Produk) => item.draft_penawaran && item.draft_penawaran.length > 0);

        setAllProduk(produkDenganDraft);
        setFilteredProduk(produkDenganDraft);
      }
    } catch (err) {
      console.error("Gagal fetch data produk:", err);
      setAllProduk([]);
      setFilteredProduk([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  // Handle search dari FilterSearch
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentPage(1); // Reset ke halaman 1 ketika search

    let filtered = allProduk;

    // Filter berdasarkan query (nama produk)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter((item) => getNamaProduk(item).toLowerCase().includes(query));
    }

    // Filter berdasarkan tahap
    if (filters.tahap) {
      filtered = filtered.filter((item) => item.kategori?.tahap?.id === filters.tahap);
    }

    // Filter berdasarkan kategori
    if (filters.kategori) {
      filtered = filtered.filter((item) => item.kategori?.id === filters.kategori);
    }

    setFilteredProduk(filtered);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchFilters({
      query: "",
      tahap: "",
      kategori: "",
    });
    setFilteredProduk(allProduk);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = filteredProduk.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure currentPage is valid
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredProduk.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers with limits
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the beginning
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="p-6 bg-white rounded-md shadow">
      {loading ? (
        <div className="text-center py-8">
          <p>Memuat data...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <FilterSearch onSearch={handleSearch} onReset={handleResetFilters} />
          </div>

          {filteredProduk.length === 0 ? (
            <div className="text-center py-8">
              <p>{searchFilters.query || searchFilters.tahap || searchFilters.kategori ? "Tidak ada produk dengan draft penawaran yang sesuai dengan filter." : "Tidak ada produk dengan draft penawaran."}</p>
            </div>
          ) : (
            <>
              <table className="min-w-full border-collapse">
                <thead className="bg-[#E9F7FF]">
                  <tr>
                    <th className="py-2 px-4 border-b font-normal text-left">NO</th>
                    <th className="text-left py-2 px-4 border-b font-normal">Nama Produk</th>
                    <th className="text-left py-2 px-4 border-b font-normal">Draft Penawaran</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => {
                    const itemNumber = startIndex + index + 1;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{itemNumber}</td>
                        <td className="py-2 px-4 border-b font-medium">
                          <div>
                            <div>{getNamaProduk(item)}</div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b space-x-2">
                          <DraftPenawaranStaff productId={item.id} draftData={item.draft_penawaran} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> items
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Previous Button */}
                    <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(validCurrentPage - 1)} disabled={validCurrentPage === 1}>
                      <ChevronLeft size={16} />
                    </Button>

                    {/* Page Numbers */}
                    {pageNumbers.map((num) => (
                      <Button key={num} className={`font-normal border border-[#0892D8] px-3 py-1 ${validCurrentPage === num ? "bg-[#0892D8] text-white" : "bg-white text-[#0892D8] hover:bg-accent"}`} onClick={() => handlePageChange(num)}>
                        {num}
                      </Button>
                    ))}

                    {/* Next Button */}
                    <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(validCurrentPage + 1)} disabled={validCurrentPage === totalPages}>
                      <ChevronRight size={16} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="border rounded px-2 py-1 text-sm">
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per halaman</span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
