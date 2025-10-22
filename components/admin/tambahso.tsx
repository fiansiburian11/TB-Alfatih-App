"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, apiRequest } from "@/lib/axios";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import FilterSearch from "../layout/filter-search";

// Import Calendar components
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectPortal } from "@radix-ui/react-select";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Types sesuai dengan contoh Anda
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
  code?: string;
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
}

type SelectedProduct = {
  product_id: string;
  jumlah: number;
  product: Product;
};

interface TambahSOProps {
  onSuccess?: () => void;
}

export default function TambahSO({ onSuccess }: TambahSOProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    alamat: "",
    tanggal_janji_antar: "",
    no_hp: "",
  });

  // Update formData ketika date berubah
  useEffect(() => {
    if (date) {
      const formattedDate = date.toUTCString();
      setFormData((prev) => ({
        ...prev,
        tanggal_janji_antar: formattedDate,
      }));
    }
  }, [date]);

  // Reset form ketika dialog ditutup
  useEffect(() => {
    if (!isDialogOpen) {
      setFormData({
        name: "",
        alamat: "",
        tanggal_janji_antar: "",
        no_hp: "",
      });
      setSelectedProducts([]);
      setDate(undefined);
      setSearchQuery("");
      setFilteredProducts(products);
    }
  }, [isDialogOpen, products]);

  // Fetch products dari API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest("/private/product");
        const productsData = Array.isArray(res?.data?.data) ? res.data.data : [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Gagal fetch produk:", error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle search dari FilterSearch
  const handleSearch = (filters: { query: string; tahap: string; kategori: string }) => {
    setSearchQuery(filters.query);

    let filtered = products;

    // Filter berdasarkan search query
    if (filters.query) {
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(filters.query.toLowerCase()) || product.spesifikasi?.toLowerCase().includes(filters.query.toLowerCase()) || product.code?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    // Filter berdasarkan tahap - gunakan kategori.tahap.id
    if (filters.tahap) {
      filtered = filtered.filter((product) => product.kategori?.tahap?.id === filters.tahap);
    }

    // Filter berdasarkan kategori - gunakan kategori.id
    if (filters.kategori) {
      filtered = filtered.filter((product) => product.kategori?.id === filters.kategori);
    }

    setFilteredProducts(filtered);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  // Fungsi untuk mendapatkan URL gambar produk
  const getProductImageUrl = (imgProducts: ProductImage[]) => {
    if (imgProducts.length > 0 && imgProducts[0].path) {
      return `https://api.rusnandapurnama.com${imgProducts[0].path}`;
    }
    return null;
  };

  // Fungsi untuk copy gambar ke clipboard
  // const copyImageToClipboard = async (imagePath: string) => {
  //   try {
  //     const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
  //     const response = await fetch(imageUrl);
  //     const blob = await response.blob();
  //     const item = new ClipboardItem({ [blob.type]: blob });
  //     await navigator.clipboard.write([item]);
  //     showSuccessToast("Gambar berhasil disalin");
  //   } catch (err) {
  //     console.error("Failed to copy image: ", err);
  //     const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
  //     await navigator.clipboard.writeText(imageUrl);
  //     showSuccessToast("URL gambar berhasil disalin");
  //   }
  // };

  // Tambah produk ke daftar
  const addProduct = (product: Product) => {
    const existingProduct = selectedProducts.find((p) => p.product_id === product.id);

    if (existingProduct) {
      setSelectedProducts((prev) => prev.map((p) => (p.product_id === product.id ? { ...p, jumlah: p.jumlah + 1 } : p)));
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          product_id: product.id,
          jumlah: 1,
          product: product,
        },
      ]);
    }
  };

  // Update jumlah produk
  const updateProductQuantity = (productId: string, newJumlah: number) => {
    if (newJumlah < 1) {
      removeProduct(productId);
      return;
    }

    setSelectedProducts((prev) => prev.map((p) => (p.product_id === productId ? { ...p, jumlah: newJumlah } : p)));
  };

  // Hapus produk dari daftar
  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.product_id !== productId));
  };

  // Handle form input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle batal - tutup dialog
  const handleBatal = () => {
    setIsDialogOpen(false);
  };

  // Submit data ke API
  const handleSubmit = async () => {
    try {
      if (selectedProducts.length === 0) {
        alert("Pilih minimal 1 produk");
        return;
      }

      if (!date) {
        alert("Pilih tanggal janji antar");
        return;
      }

      const payload = {
        name: formData.name,
        alamat: formData.alamat,
        tanggal_janji_antar: formData.tanggal_janji_antar,
        no_hp: formData.no_hp,
        product: selectedProducts.map((p) => ({
          product_id: p.product_id,
          jumlah: p.jumlah,
        })),
      };

      const response = await api.post("/private/sa/sales-order", payload);
      console.log("Response:", response.data);

      // Tutup dialog setelah berhasil
      setIsDialogOpen(false);

      showSuccessToast("Sales Order berhasil dibuat!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Gagal membuat SO:", error);
      showErrorToast("Gagal membuat Sales Order");
    }
  };

  // Hitung total harga
  const totalHarga = selectedProducts.reduce((total, item) => {
    const price = item.product?.harga_jual || 0;
    return total + price * item.jumlah;
  }, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0892D8] justify-start hover:bg-[#0892D8]/80">
          <Plus />
          Buat SO
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl w-full rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold border-b pb-2">Detail Pesanan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* FORM INPUT - TAMPILAN TETAP SAMA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nama</label>
              <Input placeholder="Masukkan Nama Pelanggan" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Alamat</label>
              <Input placeholder="Masukkan Alamat" value={formData.alamat} onChange={(e) => handleInputChange("alamat", e.target.value)} />
            </div>

            <div className="relative">
              <label className="text-sm font-medium">Tanggal Janji Antar</label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      {date ? format(date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={id} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">No. Hp</label>
              <Input placeholder="Masukkan No.HP Pelanggan" value={formData.no_hp} onChange={(e) => handleInputChange("no_hp", e.target.value)} />
            </div>
          </div>

          {/* PRODUK YANG DIPILIH - TAMPILAN TETAP SAMA */}
          {selectedProducts.length > 0 && (
            <Card className="border-none bg-[#F5F7FA]">
              <CardContent className="pt-4">
                <p className=" mb-3 border-b pb-2">Produk yang ingin dibeli</p>
                <div className="space-y-3">
                  {selectedProducts.map((item) => {
                    const imageUrl = getProductImageUrl(item.product.img_products);

                    return (
                      <div key={item.product_id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        {/* Gambar Produk */}
                        <div className="flex-shrink-0">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={item.product.name} width={70} height={70} className="rounded-md object-cover" />
                          ) : (
                            <div className="w-[70px] h-[70px] bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Detail Produk */}
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{item.product?.name || "Produk tidak ditemukan"}</p>
                          <p className="text-sm">
                            Harga : <span className="text-[#0892D8] ml-1">{formatCurrency(item.product?.harga_jual || 0)}</span>
                          </p>
                          <p className="text-sm mt-1 flex items-center gap-2">
                            Jumlah :
                            <Input type="number" value={item.jumlah} onChange={(e) => updateProductQuantity(item.product_id, Number(e.target.value))} className="w-16 h-7 text-center" min="1" />
                          </p>
                        </div>

                        {/* Tombol Hapus */}
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-medium text-[#0892D8]">{formatCurrency((item.product?.harga_jual || 0) * item.jumlah)}</p>
                          <Button variant="ghost" size="sm" onClick={() => removeProduct(item.product_id)} className="h-6 w-6 p-0 hover:bg-red-100">
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* TOTAL HARGA */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-medium">Total Harga:</span>
                    <span className="text-lg font-bold text-[#0892D8]">{formatCurrency(totalHarga)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SELECT PRODUK - TAMPILAN TETAP SAMA */}
          <Card className="border-none bg-[#F5F7FA]">
            <CardContent className="pt-4">
              <p className=" mb-3 border-b pb-2">Tambah Produk Lainnya</p>

              <Select open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                <SelectTrigger className="w-full bg-gray-100 text-gray-400 h-12">
                  <SelectValue placeholder="Cari Produk..." />
                </SelectTrigger>

                <SelectPortal>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className="w-[var(--radix-select-trigger-width)] max-h-96 p-0 ">
                    {/* FilterSearch */}
                    <div className="p-3 border-b bg-gray-50 sticky top-0 z-10" onPointerDown={(e) => e.stopPropagation()}>
                      <FilterSearch onSearch={handleSearch} onReset={handleResetFilters} />
                    </div>

                    {/* Daftar Produk */}
                    <div className="max-h-64 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Memuat produk...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Tidak ada produk ditemukan</div>
                      ) : (
                        filteredProducts.map((product) => {
                          const imageUrl = getProductImageUrl(product.img_products);

                          return (
                            <div
                              key={product.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b"
                              onClick={() => {
                                addProduct(product);
                                setIsSelectOpen(false);
                              }}
                            >
                              {/* Gambar Produk */}
                              <div className="flex-shrink-0">
                                {imageUrl ? (
                                  <Image src={imageUrl} alt={product.name} width={50} height={50} className="rounded-md object-cover" />
                                ) : (
                                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
                                )}
                              </div>

                              {/* Detail Produk */}
                              <div className="flex-grow">
                                <p className="text-sm font-medium">{product.jenis}</p>
                                <p className="text-sm text-[#0892D8] font-medium">{formatCurrency(product.harga_jual)}</p>
                              </div>

                              {/* Tombol Tambah */}
                              <Button size="sm" className="bg-[#0892D8] hover:bg-[#0892D8]/80">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-2 border-t bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        {filteredProducts.length} produk tersedia
                        {searchQuery && ` untuk "${searchQuery}"`}
                      </p>
                    </div>
                  </SelectContent>
                </SelectPortal>
              </Select>
            </CardContent>
          </Card>

          {/* BUTTONS - TAMPILAN TETAP SAMA */}
          <div className="flex justify-end gap-3">
            <Button variant="destructive" className="px-6" onClick={handleBatal}>
              Batal
            </Button>
            <Button className="bg-[#0892D8] hover:bg-[#0892D8]/80 px-6" onClick={handleSubmit} disabled={selectedProducts.length === 0 || !date}>
              Buat Sales Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
