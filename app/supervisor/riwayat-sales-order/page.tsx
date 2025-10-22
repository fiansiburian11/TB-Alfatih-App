"use client";

import TambahSO from "@/components/admin/tambahso";
import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/axios";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Cookies from "js-cookie";
import { ArrowUpDown, ChevronLeft, ChevronRight, Copy, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  type: string;
  name: string;
  jenis: string;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  img_products: ProductImage[];
}

interface DetailSalesOrder {
  id: string;
  sales_order_id: string;
  product_id: string;
  jumlah: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

interface User {
  id: string;
  username: string;
  img_profile: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface SalesOrder {
  id: string;
  so_numbers: string;
  pengguna_id: string;
  name: string;
  alamat: string;
  tanggal_janji_antar: string;
  no_hp: string;
  proses_hapus: boolean;
  disetuji_hapus: boolean;
  pengguna: User;
  created_at: string;
  updated_at: string;
  details_sales_order: DetailSalesOrder[];
}

interface ApiResponse {
  status: number;
  message: string;
  data: {
    data: SalesOrder[];
    pagination: {
      items_per_page: number;
      page: number;
      max_page: number;
      total_data: number;
    };
  };
  refrence: null;
  error: boolean;
}

export default function RiwayatSO() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // State untuk pagination - menggunakan struktur yang sama seperti di UserTable
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // 🔹 Ambil data sales order dengan parameter search, sort, dan pagination
  const fetchSalesOrders = async (searchQuery: string = "", desc: boolean = true, page: number = currentPage, items_per_page: number = itemsPerPage) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");

      const params: any = {
        desc,
        page,
        items_per_page,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await api.get<ApiResponse>("/private/supervisor/sales-order", { params });

      if (res.data.status === 200 && !res.data.error) {
        setSalesOrders(res.data.data.data || []);
        // Set pagination data dari response
        if (res.data.data.pagination) {
          setPagination(res.data.data.pagination);
        }
      }
    } catch (err) {
      console.error("Gagal ambil data sales order:", err);
      showErrorToast("Gagal memuat data sales order");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fungsi untuk toggle sorting
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset ke halaman 1 saat sorting
    fetchSalesOrders(search, newSortOrder === "desc", 1, itemsPerPage);
  };

  // 🔹 Fungsi untuk handle search dengan debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset ke halaman 1 saat search
    // Implementasi debounce untuk mengurangi request API
    const timeoutId = setTimeout(() => {
      fetchSalesOrders(value, sortOrder === "desc", 1, itemsPerPage);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // 🔹 Fungsi untuk handle perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      setCurrentPage(page);
      fetchSalesOrders(search, sortOrder === "desc", page, itemsPerPage);
    }
  };

  // 🔹 Fungsi untuk handle perubahan items per page
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
    fetchSalesOrders(search, sortOrder === "desc", 1, newItemsPerPage);
  };

  // 🔹 Fungsi untuk generate nomor halaman
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

  // Calculate display range untuk teks "X-Y of Z sales order"
  const startItem = pagination.total_data === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination.total_data);

  useEffect(() => {
    fetchSalesOrders("", true, 1, 10);
  }, []);

  // Format tanggal untuk table
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency untuk table
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hitung total per sales order
  const calculateTotal = (details: DetailSalesOrder[]) => {
    return details.reduce((total, detail) => {
      return total + detail.jumlah * detail.product.harga_jual;
    }, 0);
  };

  // Hitung subtotal per produk
  const calculateSubtotal = (detail: DetailSalesOrder) => {
    return detail.jumlah * detail.product.harga_jual;
  };

  // Handle buka dialog detail ketika baris di-klik
  const handleRowClick = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Handle tutup dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  // Format tanggal panjang untuk dialog
  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Salin informasi pesanan
  const copyOrderInfo = () => {
    if (!selectedOrder) return;

    const totalHarga = calculateTotal(selectedOrder.details_sales_order);
    const orderInfo = `
Sales Order: ${selectedOrder.so_numbers}
Tanggal Pemesanan: ${formatLongDate(selectedOrder.created_at)}
Customer: ${selectedOrder.name}
No HP: ${selectedOrder.no_hp}
Alamat: ${selectedOrder.alamat}
Tanggal Janji Antar: ${formatLongDate(selectedOrder.tanggal_janji_antar)}

Detail Produk:
${selectedOrder.details_sales_order
  .map(
    (detail, idx) =>
      `${idx + 1}. ${detail.product.name}
   Harga: ${formatCurrency(detail.product.harga_jual)}
   Jumlah: ${detail.jumlah}`
  )
  .join("\n")}

Total Harga: ${formatCurrency(totalHarga)}
    `.trim();

    navigator.clipboard.writeText(orderInfo);
    showSuccessToast("Informasi pesanan berhasil disalin!");
  };

  // Fungsi untuk mendapatkan URL gambar produk
  const getProductImageUrl = (imgProducts: ProductImage[]) => {
    if (imgProducts.length > 0 && imgProducts[0].path) {
      return `https://api.rusnandapurnama.com${imgProducts[0].path}`;
    }
    return null;
  };

  // Fungsi untuk copy gambar ke clipboard
  const copyImageToClipboard = async (imagePath: string) => {
    try {
      const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      showSuccessToast("Gambar berhasil disalin");
    } catch (err) {
      console.error("Failed to copy image: ", err);
      // Fallback: copy image URL
      const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
      await navigator.clipboard.writeText(imageUrl);
      showSuccessToast("URL gambar berhasil disalin");
    }
  };

  return (
    <>
      <div className="p-4 bg-white rounded-xl shadow-md w-full">
        {/* Header */}
        <div className="flex items-center w-full gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari sales order..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-[#0094FF] focus:border-[#0094FF] placeholder:text-gray-400"
            />
          </div>

          <Button variant="outline" onClick={toggleSortOrder} className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 whitespace-nowrap">
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "desc" ? "Terlama" : "Terbaru"}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border-collapse text-sm w-full">
            <thead>
              <tr className="bg-[#E8F6FF] text-[#333]">
                <th className="text-left py-3 px-3 w-[15%]">Nomor SO</th>
                <th className="text-left py-3 px-3 w-[15%]">Username</th>
                <th className="text-left py-3 px-3 w-[15%]">Tanggal Pesanan Dibuat</th>
                <th className="text-left py-3 px-3 w-[15%]">Tanggal Janji Antar</th>
                <th className="text-left py-3 px-3 w-[15%]">Produk</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : salesOrders.length > 0 ? (
                salesOrders.map((order, i) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer" onClick={() => handleRowClick(order)}>
                    <td className="py-3 px-3 text-gray-700 font-mono text-xs">{order.so_numbers}</td>
                    <td className="py-3 px-3 text-gray-700 font-mono text-xs flex items-center gap-1">
                      <Image src={order.pengguna.img_profile ? `https://api.rusnandapurnama.com${order.pengguna.img_profile}` : "/assets/user.png"} alt={order.pengguna.username} width={20} height={20} className="w-5 h-5 rounded-full" />
                      <span>{order.pengguna.username}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-3 text-gray-700">{formatDate(order.tanggal_janji_antar)}</td>
                    <td className="py-3 px-3 text-gray-700">
                      <div className="space-y-1">
                        {order.details_sales_order.map((detail, idx) => (
                          <div key={detail.id} className="text-xs">
                            {detail.product.name}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Tidak ada sales order ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-gray-600">
            {/* Keterangan jumlah data */}
            <div className="text-center md:text-left">
              <span className="font-medium">
                {startItem} - {endItem}
              </span>{" "}
              dari <span className="font-medium">{pagination.total_data}</span> sales order
            </div>

            {/* Navigasi pagination */}
            {pagination.max_page > 1 && (
              <div className="flex justify-center md:justify-end items-center gap-2">
                {/* Tombol Sebelumnya */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8] hover:bg-[#0892D8]/10" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16} />
                </Button>

                {/* Nomor halaman */}
                <div className="flex gap-1">
                  {generatePageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-[#0892D8] text-white hover:bg-[#067ab1]" : "border-[#0892D8] text-[#0892D8] hover:bg-[#0892D8]/10"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                {/* Tombol Selanjutnya */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8] hover:bg-[#0892D8]/10" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.max_page}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Items per page */}
            <div className="flex items-center justify-center md:justify-end gap-2">
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
              <span className="text-gray-600">per halaman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Hidden title for accessibility</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-6">
              {/* Tanggal Pemesanan */}
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Tanggal Pemesanan</h3>
                <p className="text-md mr-6">{selectedOrder && formatLongDate(selectedOrder.created_at)}</p>
              </div>

              {/* Detail Produk */}
              <div className="bg-[#F5F7FA] px-4 py-3 rounded-lg">
                <h1 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Detail Produk</h1>

                <div className="space-y-4">
                  {selectedOrder?.details_sales_order.map((detail, index) => {
                    const imageUrl = getProductImageUrl(detail.product.img_products);

                    return (
                      <Card key={detail.id} className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                          <div className="flex items-start">
                            {/* Gambar Produk */}
                            <div className="flex-shrink-0">
                              {imageUrl ? (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                  <Image
                                    src={imageUrl}
                                    alt={detail.product.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const parent = e.currentTarget.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span class="text-xs text-gray-500 text-center">Gambar Produk</span>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                  {/* Tombol Salin Gambar */}
                                  <button
                                    onClick={() => copyImageToClipboard(detail.product.img_products[0].path)}
                                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
                                  >
                                    <Copy className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500 text-center">Gambar Produk</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 ml-4">
                              <h4 className="font-medium text-base mb-2">{detail.product.name}</h4>

                              <div className="space-y-1 text-sm">
                                <div className="flex">
                                  <span className="w-1/3 ">Harga</span>
                                  <span>: {formatCurrency(detail.product.harga_jual)}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-1/3 ">Jumlah</span>
                                  <span>: {detail.jumlah}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Total Harga Barang */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
                  <span className="font-medium ">Total Harga Barang</span>
                  <span className="font-semibold text-gray-900 text-lg">{selectedOrder && formatCurrency(calculateTotal(selectedOrder.details_sales_order))}</span>
                </div>
              </div>

              {/* Informasi Pelanggan */}
              <div>
                <Card className="shadow-none border-none">
                  <h3 className="text-lg font-semibold border-b px-4 pt-3 pb-2">Informasi Pelanggan</h3>
                  <CardContent className="space-y-3 px-4 pt-2 pb-4">
                    {/* Baris 1 */}
                    <div className="flex">
                      <span className="w-1/3 text-gray-700">Nama</span>
                      <span className="w-[10px]">:</span>
                      <span className="flex-1">{selectedOrder?.name}</span>
                    </div>

                    {/* Baris 2 */}
                    <div className="flex items-center">
                      <span className="w-1/3 text-gray-700">Tanggal Janji Antar</span>
                      <span className="w-[10px]">:</span>
                      <span className="bg-[#F8D7D7] text-[#DD3737] rounded px-1 inline-block">{selectedOrder && formatDate(selectedOrder.tanggal_janji_antar)}</span>
                    </div>

                    {/* Baris 3 */}
                    <div className="flex">
                      <span className="w-1/3 text-gray-700">No Hp</span>
                      <span className="w-[10px]">:</span>
                      <span className="flex-1">{selectedOrder?.no_hp}</span>
                    </div>

                    {/* Baris 4 */}
                    <div className="flex">
                      <span className="w-1/3 text-gray-700">Alamat</span>
                      <span className="w-[10px]">:</span>
                      <span className="flex-1">{selectedOrder?.alamat}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 ">
            <Button variant="destructive" onClick={handleCloseDialog} className="flex-1 py-3">
              Kembali
            </Button>
            <Button onClick={copyOrderInfo} className="flex-1 py-3 bg-[#0892D8] hover:bg-[#0892D8]/90 text-white font-medium">
              <Copy className="w-4 h-4 mr-2" />
              Salin Informasi Pesanan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}