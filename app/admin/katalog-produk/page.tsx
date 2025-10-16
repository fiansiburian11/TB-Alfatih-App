"use client";

import ChangeKatalog from "@/components/admin/changekatalog";
import PaginationBar from "@/components/admin/paginationkatalog";
import DialogTambahProduk from "@/components/admin/tambahproduk";
import DialogTambahProdukCross from "@/components/admin/tambahprodukcross";
import FilterSearch from "@/components/layout/filter-search";
import DraftPenawaran from "@/components/layout/tooltip-salin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Produk = {
  id: string;
  name: string;
  jenis: string;
  kondisi_peruntukan: string;
  harga_jual: number;
  prioritas_upselling?: boolean;
  ditolak: boolean;
  diproses: boolean;
  diterima: boolean;
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
  img_products?: { path: string }[];
  cross_selling_inti?: {
    product_cross_selling: {
      id: string;
      name: string;
      harga_jual: number;
      jenis: string;
    };
  }[];
  draft_penawaran?: DraftPenawaran[]; // Data draft sudah termasuk di sini
};

type FilterState = {
  query: string;
  tahap: string;
  kategori: string;
};

interface DraftPenawaran {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

export default function KatalogProduk() {
  const router = useRouter();

  // State Barang Inti
  const [barangInti, setBarangInti] = useState<Produk[]>([]);
  const [intiLoading, setIntiLoading] = useState(false);
  const [currentPageInti, setCurrentPageInti] = useState(1);
  const [itemsPerPageInti, setItemsPerPageInti] = useState(3);
  const [totalItemsInti, setTotalItemsInti] = useState(0);

  // State Cross Selling
  const [crossProducts, setCrossProducts] = useState<Produk[]>([]);
  const [crossLoading, setCrossLoading] = useState(false);
  const [currentPageCross, setCurrentPageCross] = useState(1);
  const [itemsPerPageCross, setItemsPerPageCross] = useState(3);
  const [totalItemsCross, setTotalItemsCross] = useState(0);

  // State Change Katalog
  const [isStatusMode, setIsStatusMode] = useState(false);

  // Fungsi untuk toggle mode
  const toggleStatusMode = () => {
    setIsStatusMode((prev) => !prev);
  };

  const getStatusPengajuan = (item: Produk) => {
    if (item.ditolak) return "Ditolak";
    if (item.diterima) return "Diterima";
    if (item.diproses) return "Diproses";
    return "Menunggu";
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diterima":
        return "bg-green-100 text-green-800 border-green-200";
      case "Ditolak":
        return "bg-red-100 text-red-800 border-red-200";
      case "Diproses":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // State Filter
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    tahap: "",
    kategori: "",
  });

  // State Error
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fmtRp = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  // Validasi ID
  const isValidId = (id: string) => {
    return id && id.length > 0 && id !== "undefined" && id !== "null";
  };

  // Fetch Barang Inti dengan filter
  const fetchInti = async (page = currentPageInti, limit = itemsPerPageInti, filterParams = filters) => {
    try {
      setIntiLoading(true);
      setErrorMessage("");

      // Siapkan parameter API
      const params: any = {
        type: "inti",
        page,
        items_per_page: limit,
      };

      // Validasi dan tambahkan parameter
      if (filterParams.query) {
        params.search = filterParams.query;
      }
      if (filterParams.tahap && isValidId(filterParams.tahap)) {
        params.tahap_id = filterParams.tahap;
      }
      if (filterParams.kategori && isValidId(filterParams.kategori)) {
        params.kategori_id = filterParams.kategori;
      }

      const res = await api.get("/private/product", { params });

      // Validasi response
      if (!res.data) {
        throw new Error("Response data kosong");
      }

      const data = res.data?.data?.data || [];
      const total = res.data?.data?.pagination?.total_data ?? data.length;

      setBarangInti(data);
      setTotalItemsInti(total);
    } catch (err: any) {
      // Handle error berdasarkan type
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400) {
        if (message?.toLowerCase().includes("akses token tidak valid")) {
          // Biarkan interceptor handle token invalid
        } else {
          // Error 400 lainnya (mungkin parameter filter salah)
          setErrorMessage(`Error filter: ${message || "Parameter tidak valid"}`);
          setBarangInti([]);
          setTotalItemsInti(0);
        }
      } else if (status === 500) {
        setErrorMessage("Server error, silakan coba lagi");
        setBarangInti([]);
        setTotalItemsInti(0);
      } else {
        setErrorMessage("Gagal memuat data produk");
        setBarangInti([]);
        setTotalItemsInti(0);
      }
    } finally {
      setIntiLoading(false);
    }
  };

  // Fetch Cross Selling dengan filter
  const fetchCross = async (page = currentPageCross, limit = itemsPerPageCross, filterParams = filters) => {
    try {
      setCrossLoading(true);

      // Siapkan parameter API
      const params: any = {
        type: "cross_selling",
        page,
        items_per_page: limit,
      };

      // Validasi dan tambahkan parameter
      if (filterParams.query) {
        params.search = filterParams.query;
      }
      if (filterParams.tahap && isValidId(filterParams.tahap)) {
        params.tahap_id = filterParams.tahap;
      }
      if (filterParams.kategori && isValidId(filterParams.kategori)) {
        params.kategori_id = filterParams.kategori;
      }

      const res = await api.get("/private/product", { params });
      const data = res.data?.data?.data || [];
      const total = res.data?.data?.pagination?.total_data ?? data.length;

      setCrossProducts(data);
      setTotalItemsCross(total);
    } catch (err: any) {
      // Handle error - lebih sederhana untuk cross selling
      setCrossProducts([]);
      setTotalItemsCross(0);
    } finally {
      setCrossLoading(false);
    }
  };

  // Handle search dari FilterSearch
  const handleSearch = (searchFilters: FilterState) => {
    // Validasi filter sebelum kirim
    if (searchFilters.kategori && !isValidId(searchFilters.kategori)) {
      setErrorMessage("Kategori tidak valid");
      return;
    }

    if (searchFilters.tahap && !isValidId(searchFilters.tahap)) {
      setErrorMessage("Tahap tidak valid");
      return;
    }

    // Update state filter
    setFilters(searchFilters);
    setErrorMessage("");

    // Reset ke halaman 1 ketika filter berubah
    setCurrentPageInti(1);
    setCurrentPageCross(1);

    // Fetch data dengan filter baru
    fetchInti(1, itemsPerPageInti, searchFilters);
    fetchCross(1, itemsPerPageCross, searchFilters);
  };

  // Handle reset filter
  const handleResetFilters = () => {
    const resetFilters = {
      query: "",
      tahap: "",
      kategori: "",
    };
    setFilters(resetFilters);
    setErrorMessage("");
    setCurrentPageInti(1);
    setCurrentPageCross(1);
    fetchInti(1, itemsPerPageInti, resetFilters);
    fetchCross(1, itemsPerPageCross, resetFilters);
  };

  // Effect untuk pagination Barang Inti
  useEffect(() => {
    fetchInti(currentPageInti, itemsPerPageInti, filters);
  }, [currentPageInti, itemsPerPageInti]);

  // Effect untuk pagination Cross Selling
  useEffect(() => {
    fetchCross(currentPageCross, itemsPerPageCross, filters);
  }, [currentPageCross, itemsPerPageCross]);

  return (
    <div className="mb-8 space-y-5">
      <div className="bg-white rounded-md p-2 space-y-2">
        <div className="flex gap-2">
          <DialogTambahProduk />
          <DialogTambahProdukCross />
          <ChangeKatalog isStatusMode={isStatusMode} onToggle={toggleStatusMode} />
        </div>

        {/* FilterSearch dengan callback */}
        <FilterSearch onSearch={handleSearch} onReset={handleResetFilters} />

        {/* Error Message */}
        {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{errorMessage}</div>}
      </div>

      {/* Barang Inti */}
      <Card className="mb-5">
        <CardHeader className="-mt-3 px-3">
          <CardTitle>
            <Button variant="outline" className="items-center border-[#E9F7FF]">
              <span className="text-sm">Barang Inti</span>
              {filters.query || filters.tahap || filters.kategori ? <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{barangInti.length}</span> : null}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 -mt-4">
          <div className="overflow-x-auto">
            {intiLoading ? (
              <div className="p-5 text-center text-gray-500">Memuat data...</div>
            ) : errorMessage ? (
              <div className="p-5 text-center text-red-500">{errorMessage}</div>
            ) : barangInti.length === 0 ? (
              <div className="p-5 text-center text-gray-500">{filters.query || filters.tahap || filters.kategori ? "Tidak ada data produk yang sesuai dengan filter." : "Tidak ada data produk."}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-[#E9F7FF]">
                    <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
                    <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
                    <th className="text-center font-normal py-3 px-4">Harga Jual</th>
                    {isStatusMode ? (
                      <th className="text-center font-normal py-3 px-4">Status Pengajuan</th>
                    ) : (
                      <>
                        <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                        <th className="text-center font-normal py-3 px-4">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {barangInti.map((item, index) => {
                    const tahapNum = item.kategori?.tahap?.numbers ?? "-";
                    const kategoriName = item.kategori?.name ?? "Tanpa Kategori";
                    const status = getStatusPengajuan(item);

                    return (
                      <tr key={item.id} className={`cursor-pointer hover:bg-gray-50 ${index === barangInti.length - 1 ? "" : "border-b"}`}>
                        <td className="py-3 px-4 font-medium">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span>{item.jenis}</span>
                              {item.prioritas_upselling && <span className="text-yellow-500 text-sm font-medium">⭐</span>}
                            </div>
                            <div className="flex gap-2">
                              <div className="p-1 rounded-sm text-xs bg-[#FFF8E0] text-[#FEB941]">Tahap {tahapNum}</div>
                              <div className="bg-[#E9F7FF] p-1 rounded-sm text-xs text-[#0892D8] capitalize">{kategoriName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{item.kondisi_peruntukan || "-"}</td>
                        <td className="py-3 px-4 text-sm">{fmtRp.format(item.harga_jual || 0)}</td>

                        {isStatusMode ? (
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>{status}</span>
                          </td>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-center">
                              {/* PERBAIKAN: Gunakan draft_penawaran langsung dari item */}
                              <DraftPenawaran productId={item.id} draftData={item.draft_penawaran || []} />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/admin/katalog-produk/${item.id}`} prefetch={false}>
                                <Button size="icon" variant="default" className="bg-[#0892D8] hover:bg-[#0892D8]/90 text-white rounded-md">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <PaginationBar currentPage={currentPageInti} itemsPerPage={itemsPerPageInti} totalItems={totalItemsInti} onPageChange={setCurrentPageInti} onItemsPerPageChange={setItemsPerPageInti} />
        </CardContent>
      </Card>

      {/* Cross Selling */}
      <Card className="mb-5">
        <CardHeader className="-mt-3 px-3">
          <CardTitle>
            <Button variant="outline" className="items-center border-[#E9F7FF]">
              <span className="text-sm">Cross Selling</span>
              {filters.query || filters.tahap || filters.kategori ? <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{crossProducts.length}</span> : null}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 -mt-4">
          <div className="overflow-x-auto">
            {crossLoading ? (
              <div className="p-5 text-center text-gray-500">Memuat data...</div>
            ) : crossProducts.length === 0 ? (
              <div className="p-5 text-center text-gray-500">{filters.query || filters.tahap || filters.kategori ? "Tidak ada data produk yang sesuai dengan filter." : "Tidak ada data produk."}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-[#E9F7FF]">
                    <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
                    <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
                    <th className="text-center font-normal py-3 px-4">Harga Jual</th>
                    {isStatusMode ? (
                      <th className="text-center font-normal py-3 px-4">Status Pengajuan</th>
                    ) : (
                      <>
                        <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                        <th className="text-center font-normal py-3 px-4">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {crossProducts.map((item, index) => {
                    const tahapNum = item.kategori?.tahap?.numbers ?? "-";
                    const kategoriName = item.kategori?.name ?? "Tanpa Kategori";
                    const status = getStatusPengajuan(item);

                    return (
                      <tr key={item.id} onClick={() => !isStatusMode && router.push(`/katalog-produk/${item.id}`)} className={`cursor-pointer hover:bg-gray-50 ${index === crossProducts.length - 1 ? "" : "border-b"}`}>
                        <td className="py-3 px-4 font-medium">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.prioritas_upselling && <span className="text-yellow-500 text-sm font-medium">⭐</span>}
                            </div>
                            <div className="flex gap-2">
                              <div className="p-1 rounded-sm text-xs bg-[#FFF8E0] text-[#FEB941]">Tahap {tahapNum}</div>
                              <div className="bg-[#E9F7FF] p-1 rounded-sm text-xs text-[#0892D8] capitalize">{kategoriName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{item.kondisi_peruntukan || "-"}</td>
                        <td className="py-3 px-4 text-sm">{fmtRp.format(item.harga_jual || 0)}</td>

                        {isStatusMode ? (
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>{status}</span>
                          </td>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-center">
                              {/* PERBAIKAN: Gunakan draft_penawaran langsung dari item */}
                              <DraftPenawaran productId={item.id} draftData={item.draft_penawaran || []} />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/admin/katalog-produk/${item.id}`} prefetch={false}>
                                <Button size="icon" variant="default" className="bg-[#0892D8] hover:bg-[#0892D8]/90 text-white rounded-md" onClick={(e) => e.stopPropagation()}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <PaginationBar currentPage={currentPageCross} itemsPerPage={itemsPerPageCross} totalItems={totalItemsCross} onPageChange={setCurrentPageCross} onItemsPerPageChange={setItemsPerPageCross} />
        </CardContent>
      </Card>
    </div>
  );
}