"use client";

import PaginationBar from "@/components/admin/paginationkatalog";
import DialogTambahProduk from "@/components/admin/tambahproduk";
import DialogTambahProdukCross from "@/components/admin/tambahprodukcross";
import TambahSO from "@/components/admin/tambahso";
import DialogEditProduk from "@/components/admin/updateproduct";
import FilterSearch from "@/components/layout/filter-search";
import DraftPenawaran from "@/components/layout/tooltip-salin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, apiRequest } from "@/lib/axios";
import { ArrowRight, Eye, LayoutGrid } from "lucide-react";
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
  img_products?: { id: string; path: string }[];
  cross_selling_inti?: {
    product_cross_selling: {
      id: string;
      name: string;
      harga_jual: number;
      jenis: string;
    };
  }[];
  draft_penawaran?: DraftPenawaran[];
  spesifikasi?: string;
  type?: string;
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

export default function AdminDashboard() {
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

  //total so state
  const [totalSO, setTotalSO] = useState<number>(0);
  const [loadingSO, setLoadingSO] = useState<boolean>(false);

  //state name user
  const [name, setName] = useState("");

  //fetch total sales order
  const fetchTotalSO = async () => {
    try {
      setLoadingSO(true);
      const res = await api.get("/private/sa/sales-order");

      // Ambil total dari pagination
      const total = res?.data?.data?.pagination?.total_data ?? 0;
      setTotalSO(total);
    } catch (error) {
      // console.error("Gagal ambil total sales order:", error);
      setTotalSO(0);
    } finally {
      setLoadingSO(false);
    }
  };

  const nameUser = async () => {
    try {
      const res = await apiRequest("/private/profile", { method: "GET" });

      setName(res.data.username);
    } catch (error) {
      // console.log(error);
      throw error;
    }
  };

  useEffect(() => {
    nameUser();
    fetchTotalSO();
  }, []);

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

      const res = await api.get("/private/product?desc=true", { params });

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

      const res = await api.get("/private/product?desc=true", { params });
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

  // Fungsi untuk refresh data setelah edit
  const handleEditSuccess = () => {
    fetchInti(currentPageInti, itemsPerPageInti, filters);
    fetchCross(currentPageCross, itemsPerPageCross, filters);
  };

  return (
    <div className="mb-8 space-y-5">
      <div className=" space-y-2">
        <h1 className="text-xl">Selamat datang {name}!</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#E9F7FF] p-1 rounded-md">
                    <LayoutGrid className="text-[#0892D8] h-5 w-5" />
                  </div>
                  Total Produk
                </h1>
                <span className="font-semibold">{totalItemsInti + totalItemsCross}</span>
              </div>

              <p className="text-xs text-gray-600">Tambah produk untuk ditinjau oleh supervisor sebelum masuk katalog</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <DialogTambahProduk />
              <DialogTambahProdukCross />
            </div>
          </div>

          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div>
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#E9F7FF] p-1 rounded-md">
                    <LayoutGrid className="text-[#0892D8] h-5 w-5" />
                  </div>
                  Buat Sales Order
                </h1>
              </div>

              <p className="text-xs text-gray-600">Tawarkan produk ke pelanggan dan Buat sales order baru</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <TambahSO />
            </div>
          </div>

          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#E9F7FF] p-1 rounded-md">
                    <LayoutGrid className="text-[#0892D8] h-5 w-5" />
                  </div>
                  Total SO
                </h1>
                <span className="font-semibold">{totalSO}</span>
              </div>

              <p className="text-xs text-gray-600">Catatan SO terbaru siap untuk ditinjau</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={() => {
                  router.push("/admin/riwayat-sales-order");
                }}
                className="flex justify-between bg-accent hover:bg-slate-200 text-black"
              >
                Lihat Detail
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* FilterSearch dengan callback */}
        <div className="bg-white p-2 rounded-md shadow-sm">
          <FilterSearch onSearch={handleSearch} onReset={handleResetFilters} />
        </div>

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
                    <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                    <th className="text-center font-normal py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barangInti.map((item, index) => {
                    const tahapNum = item.kategori?.tahap?.numbers ?? "-";
                    const kategoriName = item.kategori?.name ?? "Tanpa Kategori";

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
                        <td className="py-3 px-4 text-center">
                          <DraftPenawaran productId={item.id} draftData={item.draft_penawaran} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/admin/katalog-produk/${item.id}`} prefetch={false}>
                              <Button size="icon" variant="default" className="bg-[#0892D8] hover:bg-[#0892D8]/90 text-white rounded-md">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* Dialog Edit Produk */}
                            <DialogEditProduk
                              produk={{
                                id: item.id,
                                type: "inti",
                                name: item.name,
                                jenis: item.jenis,
                                prioritas_upselling: item.prioritas_upselling || false,
                                harga_jual: item.harga_jual,
                                kondisi_peruntukan: item.kondisi_peruntukan,
                                spesifikasi: item.spesifikasi || "",
                                kategori_id: item.kategori?.id || "",
                                // PERBAIKAN: Gunakan img_products langsung dari API tanpa mapping
                                img_products: item.img_products || [],
                                kategori: {
                                  id: item.kategori?.id || "",
                                  name: item.kategori?.name || "",
                                  tahap_id: item.kategori?.tahap?.id || "",
                                  tahap: {
                                    id: item.kategori?.tahap?.id || "",
                                    title: item.kategori?.tahap?.title || "",
                                  },
                                },
                                cross_selling_products:
                                  item.cross_selling_inti?.map((cs) => ({
                                    id: cs.product_cross_selling.id,
                                    type: "cross_selling",
                                    name: cs.product_cross_selling.name,
                                    jenis: cs.product_cross_selling.jenis,
                                    prioritas_upselling: false,
                                    harga_jual: cs.product_cross_selling.harga_jual,
                                    kondisi_peruntukan: "",
                                    spesifikasi: "",
                                    kategori_id: "",
                                    img_products: [],
                                    kategori: {
                                      id: "",
                                      name: "",
                                      tahap_id: "",
                                      tahap: {
                                        id: "",
                                        title: "",
                                      },
                                    },
                                  })) || [],
                              }}
                              onSuccess={handleEditSuccess}
                            />
                          </div>
                        </td>
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
                    <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                    <th className="text-center font-normal py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {crossProducts.map((item, index) => {
                    const tahapNum = item.kategori?.tahap?.numbers ?? "-";
                    const kategoriName = item.kategori?.name ?? "Tanpa Kategori";

                    return (
                      <tr key={item.id} onClick={() => router.push(`/katalog-produk/${item.id}`)} className={`cursor-pointer hover:bg-gray-50 ${index === crossProducts.length - 1 ? "" : "border-b"}`}>
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
                        <td className="py-3 px-4 text-center">
                          <DraftPenawaran productId={item.id} draftData={item.draft_penawaran} />
                        </td>
                        <td>
                          <div className="flex justify-center gap-2">
                            <Link href={`/admin/katalog-produk/${item.id}`} prefetch={false}>
                              <Button size="icon" variant="default" className="bg-[#0892D8] hover:bg-[#0892D8]/90 text-white rounded-md" onClick={(e) => e.stopPropagation()}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>

                            {/* Dialog Edit untuk Cross Selling */}
                            <DialogEditProduk
                              produk={{
                                id: item.id,
                                type: "cross_selling",
                                name: item.name,
                                jenis: item.jenis,
                                prioritas_upselling: item.prioritas_upselling || false,
                                harga_jual: item.harga_jual,
                                kondisi_peruntukan: item.kondisi_peruntukan,
                                spesifikasi: item.spesifikasi || "",
                                kategori_id: item.kategori?.id || "",
                                // PERBAIKAN: Gunakan img_products langsung dari API tanpa mapping
                                img_products: item.img_products || [],
                                kategori: {
                                  id: item.kategori?.id || "",
                                  name: item.kategori?.name || "",
                                  tahap_id: item.kategori?.tahap?.id || "",
                                  tahap: {
                                    id: item.kategori?.tahap?.id || "",
                                    title: item.kategori?.tahap?.title || "",
                                  },
                                },
                                cross_selling_products: [],
                              }}
                              onSuccess={handleEditSuccess}
                            />
                          </div>
                        </td>
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
