"use client";

import DialogEditProduk from "@/components/admin/updateproduct";
import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import DialogViewProduk from "@/components/supervisor/dialogviewproduk";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/axios";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Interface untuk Produk (sesuai dengan struktur API)
interface Product {
  id: string;
  type: string;
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  kategori_id: string;
  ditolak: boolean;
  diproses: boolean;
  diterima: boolean;
  created_at: string;
  updated_at: string;
  img_products: {
    id: string;
    product_id: string;
    path: string;
    created_at: string;
    updated_at: string;
  }[];
  cross_selling_inti: {
    id: string;
    product_inti_id: string;
    product_cross_selling_id: string;
    created_at: string;
    updated_at: string;
    product_cross_selling: {
      id: string;
      type: string;
      name: string;
      jenis: string;
      prioritas_upselling: boolean;
      harga_jual: number;
      kondisi_peruntukan: string;
      spesifikasi: string;
      kategori_id: string;
      ditolak: boolean;
      diproses: boolean;
      diterima: boolean;
      created_at: string;
      updated_at: string;
      img_products: {
        id: string;
        product_id: string;
        path: string;
        created_at: string;
        updated_at: string;
      }[];
      kategori: {
        id: string;
        name: string;
        tahap: {
          id: string;
          numbers: number;
          title: string;
          details: string;
        };
      };
    };
  }[];
  kategori: {
    id: string;
    name: string;
    tahap: {
      id: string;
      numbers: number;
      title: string;
      details: string;
    };
  };
  draft_penawaran: {
    id: string;
    product_id: string;
    judul: string;
    chat: string;
    created_at: string;
    updated_at: string;
  }[];
}

// Interface untuk Pagination
interface Pagination {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
}

// Interface untuk Data Response
interface ProductData {
  data: Product[];
  pagination: Pagination;
}

// Interface untuk Response API
interface ApiResponse {
  status: number;
  message: string;
  data: ProductData;
  refrence: null | any;
  error: boolean;
}

// Interface untuk Request Status
interface StatusRequest {
  id: string;
  status: boolean;
}

export default function PengajuanProduk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // State untuk konfirmasi approve
  const [openApprove, setOpenApprove] = useState(false);
  const [stepApprove, setStepApprove] = useState<"confirm" | "success">("confirm");
  const [productToApprove, setProductToApprove] = useState<Product | null>(null);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);

  // State untuk konfirmasi reject
  const [openReject, setOpenReject] = useState(false);
  const [stepReject, setStepReject] = useState<"confirm" | "success">("confirm");
  const [productToReject, setProductToReject] = useState<Product | null>(null);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const fetchProducts = async (page: number = currentPage, limit: number = itemsPerPage): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/private/product?desc=true", {
        params: {
          page,
          items_per_page: limit,
        },
      });

      const data: ApiResponse = res.data;

      if (data.status === 200) {
        setProducts(data.data.data || []);
        setTotalItems(data.data.pagination.total_data);
        setCurrentPage(data.data.pagination.page);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400) {
        if (message?.toLowerCase().includes("akses token tidak valid")) {
          // Biarkan interceptor handle token invalid
        } else {
          setError(`Error: ${message || "Parameter tidak valid"}`);
        }
      } else if (status === 500) {
        setError("Server error, silakan coba lagi");
      } else {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data produk";
        setError(errorMessage);
      }
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk update status produk (approve/reject) - OPTIMISTIC UPDATE
  const updateProductStatus = async (productId: string, status: boolean): Promise<boolean> => {
    try {
      const requestData: StatusRequest = {
        id: productId,
        status: status,
      };

      const response = await api.put("/private/supervisor/product/status", requestData);

      if (response.data.status === 200) {
        return true;
      } else {
        throw new Error(response.data.message || "Gagal mengupdate status produk");
      }
    } catch (err: any) {
      console.error("Error updating product status:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat mengupdate status produk";
      showErrorToast(errorMessage);
      return false;
    }
  };

  // OPTIMISTIC UPDATE: Langsung update state lokal tanpa menunggu server
  const updateLocalProductStatus = (productId: string, status: boolean): void => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              diterima: status,
              ditolak: !status,
              diproses: false,
            }
          : product
      )
    );
  };

  // Handle approve produk
  const handleApproveClick = (product: Product): void => {
    if (product.diterima) {
      showErrorToast("Produk ini sudah disetujui");
      return;
    }
    setProductToApprove(product);
    setOpenApprove(true);
    setStepApprove("confirm");
  };

  // Handle confirm approve - OPTIMISTIC UPDATE
  const handleApproveConfirm = async (): Promise<void> => {
    if (!productToApprove) return;

    setIsLoadingApprove(true);

    // OPTIMISTIC UPDATE: Langsung update UI tanpa menunggu server
    updateLocalProductStatus(productToApprove.id, true);

    // Tampilkan dialog success segera
    setStepApprove("success");
    // showSuccessToast("Produk berhasil disetujui");

    // Kirim request ke server di background (tanpa menunggu)
    updateProductStatus(productToApprove.id, true)
      .then((success) => {
        if (!success) {
          // Jika gagal, rollback perubahan
          updateLocalProductStatus(productToApprove.id, false);
          showErrorToast("Gagal menyetujui produk, perubahan dibatalkan");
        }
      })
      .catch((err) => {
        // Jika error, rollback perubahan
        updateLocalProductStatus(productToApprove.id, false);
        showErrorToast("Gagal menyetujui produk, perubahan dibatalkan");
      });

    setIsLoadingApprove(false);
  };

  // Handle reject produk
  const handleRejectClick = (product: Product): void => {
    if (product.ditolak) {
      showErrorToast("Produk ini sudah ditolak");
      return;
    }
    setProductToReject(product);
    setOpenReject(true);
    setStepReject("confirm");
  };

  // Handle confirm reject - OPTIMISTIC UPDATE
  const handleRejectConfirm = async (): Promise<void> => {
    if (!productToReject) return;

    setIsLoadingReject(true);

    // OPTIMISTIC UPDATE: Langsung update UI tanpa menunggu server
    updateLocalProductStatus(productToReject.id, false);

    // Tampilkan dialog success segera
    setStepReject("success");
    // showSuccessToast("Produk berhasil ditolak");

    // Kirim request ke server di background (tanpa menunggu)
    updateProductStatus(productToReject.id, false)
      .then((success) => {
        if (!success) {
          // Jika gagal, rollback perubahan
          updateLocalProductStatus(productToReject.id, true);
          showErrorToast("Gagal menolak produk, perubahan dibatalkan");
        }
      })
      .catch((err) => {
        // Jika error, rollback perubahan
        updateLocalProductStatus(productToReject.id, true);
        showErrorToast("Gagal menolak produk, perubahan dibatalkan");
      });

    setIsLoadingReject(false);
  };

  // Effect untuk pagination
  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Tutup otomatis setelah sukses
  useEffect(() => {
    if (stepApprove === "success") {
      const timer = setTimeout(() => {
        setOpenApprove(false);
        setTimeout(() => setStepApprove("confirm"), 300);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stepApprove]);

  useEffect(() => {
    if (stepReject === "success") {
      const timer = setTimeout(() => {
        setOpenReject(false);
        setTimeout(() => setStepReject("confirm"), 300);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stepReject]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Format tanggal dari ISO string ke DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Get status badge berdasarkan status produk
  const getStatusBadge = (product: Product) => {
    if (product.diterima) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Diterima</Badge>;
    } else if (product.ditolak) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
    } else if (product.diproses) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Diproses</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Menunggu</Badge>;
  };

  // Handle success edit
  const handleEditSuccess = () => {
    fetchProducts(currentPage, itemsPerPage);
  };

  // Calculate range for display
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error: {error}</div>
        <Button onClick={() => fetchProducts()} className="ml-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card className="p-4 rounded-xl shadow-sm">
        <div className="overflow-hidden">
          {/* Header */}
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="w-[60px] text-center font-semibold text-gray-700">No</TableHead>
                <TableHead className="font-semibold text-gray-700">Tanggal Diajukan</TableHead>
                <TableHead className="font-semibold text-gray-700">Jenis Produk</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-medium">{startItem + index}</TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.jenis}</span>
                      {product.prioritas_upselling && <Star className="text-yellow-400 fill-yellow-400 w-4 h-4" />}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="bg-[#FFF8E0] text-[#F9B919] text-xs font-medium">
                        {product.kategori?.tahap?.title || "Tahap Tidak Diketahui"}
                      </Badge>
                      <Badge variant="secondary" className="bg-[#E9F7FF] text-[#0892D8] text-xs font-medium">
                        {product.kategori?.name || "Kategori Tidak Diketahui"}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(product)}</TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {/* Dialog View Produk */}
                      <DialogViewProduk product={product} />

                      {/* Dialog Edit Produk */}
                      <DialogEditProduk
                        produk={{
                          id: product.id,
                          type: product.type as "inti" | "cross_selling",
                          name: product.name,
                          jenis: product.jenis,
                          prioritas_upselling: product.prioritas_upselling,
                          harga_jual: product.harga_jual,
                          kondisi_peruntukan: product.kondisi_peruntukan,
                          spesifikasi: product.spesifikasi,
                          kategori_id: product.kategori_id,
                          img_products: product.img_products,
                          kategori: {
                            id: product.kategori?.id || "",
                            name: product.kategori?.name || "",
                            tahap_id: product.kategori?.tahap?.id || "",
                            tahap: {
                              id: product.kategori?.tahap?.id || "",
                              title: product.kategori?.tahap?.title || "",
                            },
                          },
                          cross_selling_products:
                            product.cross_selling_inti?.map((cs) => ({
                              id: cs.product_cross_selling.id,
                              type: cs.product_cross_selling.type as "inti" | "cross_selling",
                              name: cs.product_cross_selling.name,
                              jenis: cs.product_cross_selling.jenis,
                              prioritas_upselling: cs.product_cross_selling.prioritas_upselling,
                              harga_jual: cs.product_cross_selling.harga_jual,
                              kondisi_peruntukan: cs.product_cross_selling.kondisi_peruntukan,
                              spesifikasi: cs.product_cross_selling.spesifikasi,
                              kategori_id: cs.product_cross_selling.kategori_id,
                              img_products: cs.product_cross_selling.img_products,
                              kategori: {
                                id: cs.product_cross_selling.kategori?.id || "",
                                name: cs.product_cross_selling.kategori?.name || "",
                                tahap_id: cs.product_cross_selling.kategori?.tahap?.id || "",
                                tahap: {
                                  id: cs.product_cross_selling.kategori?.tahap?.id || "",
                                  title: cs.product_cross_selling.kategori?.tahap?.title || "",
                                },
                              },
                            })) || [],
                        }}
                        onSuccess={handleEditSuccess}
                      />

                      {/* Tombol Tolak */}
                      <Button size="icon" className="bg-[#DD3737] hover:bg-[#DD3737]/90 text-white" onClick={() => handleRejectClick(product)} disabled={product.ditolak} title={product.ditolak ? "Sudah ditolak" : "Tolak produk"}>
                        <Image src="/assets/tolak.png" width={20} height={20} alt="tolak" />
                      </Button>

                      {/* Tombol Approve */}
                      <Button size="icon" className="bg-[#5FD074] hover:bg-[#5FD074]/90 text-white" onClick={() => handleApproveClick(product)} disabled={product.diterima} title={product.diterima ? "Sudah disetujui" : "Setujui produk"}>
                        <Image src="/assets/approve.png" width={20} height={20} alt="approve" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {products.length === 0 && <div className="text-center py-8 text-gray-500">Tidak ada data produk</div>}
        </div>

        {/* Footer pagination */}
        <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
          <p>
            {startItem}–{endItem} of {totalItems} produk
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="rounded-md p-2 text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {generatePageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "secondary" : "outline"}
                  className={currentPage === page ? "bg-[#0892D8] text-white hover:bg-[#0892D8]/90" : "text-[#0892D8] border-[#0892D8]"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}

              <Button size="icon" variant="outline" className="rounded-md p-2 text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>per halaman</span>
          </div>
        </div>
      </Card>

      {/* AlertDialog untuk Approve */}
      <AlertDialog open={openApprove} onOpenChange={setOpenApprove}>
        <AlertDialogContent className="max-w-sm text-center">
          {stepApprove === "confirm" ? (
            <>
              <AlertDialogHeader>
                <Image src="/assets/notifikasisurat.png" width={100} height={100} alt="confirmation" className="mx-auto" />
                <AlertDialogTitle className="text-center">
                  Ingin menyetujui produk <span className="text-green-600">{productToApprove?.jenis}</span>?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="bg-gray-100 -mx-6 p-2 -mb-6 rounded-b-md justify-center space-x-2">
                <Button variant="outline" onClick={() => setOpenApprove(false)}>
                  Batal
                </Button>
                <Button className="bg-[#5FD074] hover:bg-[#5FD074]/90" onClick={handleApproveConfirm} disabled={isLoadingApprove}>
                  {isLoadingApprove ? "Memproses..." : "Setujui"}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <div className="flex justify-center my-3">
                  <Image src="/assets/check.png" alt="Success" width={80} height={80} />
                </div>
                <AlertDialogTitle className="text-center">
                  Berhasil menyetujui produk <span className="text-green-600">{productToApprove?.jenis}</span>
                </AlertDialogTitle>
              </AlertDialogHeader>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog untuk Reject */}
      <AlertDialog open={openReject} onOpenChange={setOpenReject}>
        <AlertDialogContent className="max-w-sm text-center">
          {stepReject === "confirm" ? (
            <>
              <AlertDialogHeader>
                <Image src="/assets/notifikasisurat.png" width={100} height={100} alt="confirmation" className="mx-auto" />
                <AlertDialogTitle className="text-center">
                  Ingin menolak produk <span className="text-red-600">{productToReject?.jenis}</span>?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="bg-gray-100 -mx-6 p-2 -mb-6 rounded-b-md justify-center space-x-2">
                <Button variant="outline" onClick={() => setOpenReject(false)}>
                  Batal
                </Button>
                <Button className="bg-[#DD3737] hover:bg-[#DD3737]/90" onClick={handleRejectConfirm} disabled={isLoadingReject}>
                  {isLoadingReject ? "Memproses..." : "Tolak"}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <div className="flex justify-center my-3">
                  <Image src="/assets/check.png" alt="Success" width={80} height={80} />
                </div>
                <AlertDialogTitle className="text-center">
                  Berhasil menolak produk <span className="text-red-600">{productToReject?.jenis}</span>
                </AlertDialogTitle>
              </AlertDialogHeader>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}