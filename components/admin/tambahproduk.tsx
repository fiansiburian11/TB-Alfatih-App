"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api, apiRequest } from "@/lib/axios";
import { ChevronDown, Plus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

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

type ProdukCrossSelling = {
  id: string;
  type: string;
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  kategori_id: string;
  img_products: Array<{
    id: string;
    path: string;
  }>;
  kategori: {
    id: string;
    name: string;
    tahap_id: string;
    tahap: {
      id: string;
      title: string;
    };
  };
};

type ImagePreview = {
  file: File;
  previewUrl: string;
  uploadedPath?: string;
  isUploading?: boolean;
};

export default function DialogTambahProduk() {
  const [open, setOpen] = useState(false);
  const [isPrioritas, setIsPrioritas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCrossSelling, setLoadingCrossSelling] = useState(false);

  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
  const [produkCrossSelling, setProdukCrossSelling] = useState<ProdukCrossSelling[]>([]);

  const [selectedTahapanId, setSelectedTahapanId] = useState<string>("");
  const [selectedTahapanTitle, setSelectedTahapanTitle] = useState("Pilih Tahapan");
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>("");
  const [selectedKategoriTitle, setSelectedKategoriTitle] = useState("Pilih Kategori");
  const [selectedCrossSellingIds, setSelectedCrossSellingIds] = useState<string[]>([]);
  const [availableCrossSelling, setAvailableCrossSelling] = useState<ProdukCrossSelling[]>([]);

  // State untuk form data
  const [formData, setFormData] = useState({
    namaProduk: "",
    jenisProduk: "",
    hargaJual: "",
    kondisiPeruntukan: "",
    spesifikasi: "",
  });

  // State untuk multiple images dengan preview
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Fetch tahapan
  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      setTahapan(data);
    } catch (error) {
      // console.error("Gagal fetch tahapan:", error);
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

      setKategori(mapped);

      if (selectedTahapanId) {
        const filtered = mapped.filter((item: Kategori) => item.tahap_id === selectedTahapanId);
        setFilteredKategori(filtered);
      }
    } catch (error) {
      // console.error("Gagal fetch kategori:", error);
      setKategori([]);
      setFilteredKategori([]);
    }
  };

  // Fetch produk cross-selling berdasarkan tahap_id
  const fetchProdukCrossSellingByTahap = async (tahapId: string) => {
    if (!tahapId) {
      setProdukCrossSelling([]);
      setAvailableCrossSelling([]);
      return;
    }

    setLoadingCrossSelling(true);
    try {
      const response = await apiRequest(`/private/product?type=cross_selling&tahap_id=${tahapId}`);

      let data = [];
      if (Array.isArray(response?.data?.data?.data)) {
        data = response.data.data.data;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }

      const crossSellingData = data.filter((produk: ProdukCrossSelling) => produk.type === "cross_selling");
      setProdukCrossSelling(crossSellingData);
      setAvailableCrossSelling(crossSellingData);
    } catch (error) {
      // console.error("Gagal fetch produk cross-selling:", error);
      setProdukCrossSelling([]);
      setAvailableCrossSelling([]);
    } finally {
      setLoadingCrossSelling(false);
    }
  };

  // Filter kategori berdasarkan tahapan yang dipilih
  const filterKategoriByTahapan = (tahapId: string) => {
    if (!tahapId) {
      setFilteredKategori([]);
      return;
    }

    const filtered = kategori.filter((item) => item.tahap_id === tahapId);
    setFilteredKategori(filtered);
  };

  // ===== Upload Multiple Gambar dengan Preview =====
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: ImagePreview[] = [];

      // Convert FileList to array and create previews
      Array.from(e.target.files).forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          previewUrl,
          isUploading: false,
        });
      });

      setImages((prev) => [...prev, ...newImages]);
      e.target.value = ""; // Reset input
    }
  };

  // Hapus satu gambar dari preview
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  // Upload images ke server
  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setIsUploadingImages(true);
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        // Update status uploading untuk gambar ini
        setImages((prev) => prev.map((img, index) => (index === i ? { ...img, isUploading: true } : img)));

        const formData = new FormData();
        formData.append("img_product", images[i].file);

        const response = await api.post("/private/as/product/img", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.error) {
          throw new Error(response.data.message || `Gagal upload gambar ${images[i].file.name}`);
        }

        const uploadedPath = response.data.data.img_product;
        uploadedPaths.push(uploadedPath);

        // Update status uploaded untuk gambar ini
        setImages((prev) => prev.map((img, index) => (index === i ? { ...img, isUploading: false, uploadedPath } : img)));
      }

      return uploadedPaths;
    } catch (error: any) {
      // console.error("Upload error:", error);
      showErrorToast(error.message || "Gagal upload beberapa gambar");
      throw error;
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Tambah produk cross-selling
  const handleAddCrossSelling = (produkId: string) => {
    if (selectedCrossSellingIds.length >= 3) {
      showErrorToast("Maksimal 3 produk cross-selling yang dapat dipilih");
      return;
    }

    if (selectedCrossSellingIds.includes(produkId)) {
      showErrorToast("Produk ini sudah dipilih");
      return;
    }

    setSelectedCrossSellingIds([...selectedCrossSellingIds, produkId]);
    setAvailableCrossSelling(availableCrossSelling.filter((produk) => produk.id !== produkId));
  };

  // Hapus produk cross-selling
  const handleRemoveCrossSelling = (produkId: string) => {
    const produk = produkCrossSelling.find((p) => p.id === produkId);
    if (produk) {
      setAvailableCrossSelling([...availableCrossSelling, produk]);
    }
    setSelectedCrossSellingIds(selectedCrossSellingIds.filter((id) => id !== produkId));
  };

  // Submit produk inti dengan data lengkap
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi form
      if (!formData.namaProduk || !formData.jenisProduk || !selectedKategoriId || !formData.hargaJual || !formData.kondisiPeruntukan || !formData.spesifikasi) {
        showErrorToast("Harap isi semua field yang wajib!");
        setLoading(false);
        return;
      }

      // Validasi cross-selling - wajib 3 produk
      if (selectedCrossSellingIds.length !== 3) {
        showErrorToast("Harus memilih tepat 3 produk cross-selling!");
        setLoading(false);
        return;
      }

      // Validasi gambar
      if (images.length === 0) {
        showErrorToast("Harap upload minimal 1 gambar produk!");
        setLoading(false);
        return;
      }

      let imagePaths: string[] = [];

      // Upload gambar jika ada
      if (images.length > 0) {
        try {
          imagePaths = await uploadImages();
          if (imagePaths.length === 0) {
            showErrorToast("Gagal upload gambar. Silakan coba lagi.");
            setLoading(false);
            return;
          }
        } catch (error) {
          showErrorToast("Gagal upload gambar. Silakan coba lagi.");
          setLoading(false);
          return;
        }
      }

      // PERBAIKAN: cross_selling_id harus berupa array, bukan string
      const productData = {
        type: "inti",
        kategori_id: selectedKategoriId,
        name: formData.namaProduk,
        jenis: formData.jenisProduk,
        prioritas_upselling: isPrioritas ? "true" : "false",
        harga_jual: parseInt(formData.hargaJual),
        kondisi_peruntukan: formData.kondisiPeruntukan,
        spesifikasi: formData.spesifikasi,
        img_product: imagePaths, // Array of image paths
        cross_selling_id: selectedCrossSellingIds, // PERBAIKAN: Tetap sebagai array, bukan string
      };

      // console.log("📤 Mengirim data produk inti:", productData);
      // console.log("🔍 cross_selling_id format:", Array.isArray(productData.cross_selling_id) ? "Array ✓" : "Bukan array ✗");

      // Kirim data produk inti
      const response = await api.post("/private/as/product", productData);

      if (response.data.error) {
        throw new Error(response.data.message || "Gagal menambah produk inti");
      }

      // Success
      showSuccessToast("Produk inti berhasil ditambahkan!");
      resetForm();
      setOpen(false);
    } catch (error: any) {
      // console.error("Error adding product:", error);
      if (error.response) {
        // console.error("Error response:", error.response.data);
        showErrorToast(error.response.data?.message || error.message || "Terjadi kesalahan saat menambah produk inti");
      } else {
        showErrorToast(error.message || "Terjadi kesalahan saat menambah produk inti");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      namaProduk: "",
      jenisProduk: "",
      hargaJual: "",
      kondisiPeruntukan: "",
      spesifikasi: "",
    });
    // Clean up image previews
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setIsPrioritas(false);
    setSelectedTahapanId("");
    setSelectedTahapanTitle("Pilih Tahapan");
    setSelectedKategoriId("");
    setSelectedKategoriTitle("Pilih Kategori");
    setSelectedCrossSellingIds([]);
    setAvailableCrossSelling([]);
  };

  useEffect(() => {
    if (open) {
      fetchTahapan();
      fetchAllKategori();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTahapanId) {
      filterKategoriByTahapan(selectedTahapanId);
      fetchProdukCrossSellingByTahap(selectedTahapanId);
    } else {
      setFilteredKategori([]);
      setProdukCrossSelling([]);
      setAvailableCrossSelling([]);
      setSelectedCrossSellingIds([]);
    }
  }, [selectedTahapanId]);

  useEffect(() => {
    setSelectedCrossSellingIds([]);
    setAvailableCrossSelling(produkCrossSelling);
  }, [produkCrossSelling]);

  // Ganti tahapan
  const handleSelectTahapan = (tahap: Tahapan) => {
    setSelectedTahapanId(tahap.id);
    setSelectedTahapanTitle(tahap.title);
    setSelectedKategoriId("");
    setSelectedKategoriTitle("Pilih Kategori");
    setSelectedCrossSellingIds([]);
    filterKategoriByTahapan(tahap.id);
    fetchProdukCrossSellingByTahap(tahap.id);
  };

  // Ganti kategori
  const handleSelectKategori = (kategori: Kategori) => {
    setSelectedKategoriId(kategori.id);
    setSelectedKategoriTitle(kategori.name);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0892D8] hover:bg-[#0892D8]/90">
          <Plus size={18} />
          Tambah Produk Inti
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Tambah Produk Inti Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="namaProduk">
                Nama Produk<span className="text-red-500">*</span>
              </Label>
              <Input id="namaProduk" name="namaProduk" value={formData.namaProduk} onChange={handleInputChange} placeholder="Masukkan Nama Produk" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="jenisProduk">
                Jenis Produk<span className="text-red-500">*</span>
              </Label>
              <Input id="jenisProduk" name="jenisProduk" value={formData.jenisProduk} onChange={handleInputChange} placeholder="Masukkan Jenis Produk" required />
            </div>

            {/* tahapan */}
            <div className="space-y-1">
              <Label>
                Tahapan<span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedTahapanTitle}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                  <DropdownMenuLabel>Pilih Tahapan</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tahapan.length === 0 ? (
                    <DropdownMenuItem disabled>Tidak ada tahapan</DropdownMenuItem>
                  ) : (
                    tahapan.map((tahap) => (
                      <DropdownMenuItem key={tahap.id} onClick={() => handleSelectTahapan(tahap)} className="cursor-pointer">
                        {tahap.title}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* kategori */}
            <div className="space-y-1">
              <Label>
                Kategori<span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={!selectedTahapanId}>
                    {selectedKategoriTitle}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                  <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!selectedTahapanId ? (
                    <DropdownMenuItem disabled>Pilih tahapan terlebih dahulu</DropdownMenuItem>
                  ) : filteredKategori.length === 0 ? (
                    <DropdownMenuItem disabled>Tidak ada kategori untuk tahapan ini</DropdownMenuItem>
                  ) : (
                    filteredKategori.map((item) => (
                      <DropdownMenuItem key={item.id} onClick={() => handleSelectKategori(item)} className="cursor-pointer">
                        {item.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <div>
                <Label>Prioritas</Label>
              </div>
              <Switch checked={isPrioritas} onCheckedChange={setIsPrioritas} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="hargaJual">
                Harga Jual<span className="text-red-500">*</span>
              </Label>
              <Input id="hargaJual" name="hargaJual" type="number" value={formData.hargaJual} onChange={handleInputChange} placeholder="Masukkan Harga Jual" required />
            </div>

            {/* Upload Multiple Gambar dengan Preview */}
            <div className="space-y-2">
              <Label>
                Foto Produk<span className="text-red-500">*</span>
              </Label>

              {/* Preview gambar */}
              {images.length > 0 && (
                <div className="mb-4">
                  <Label>Preview Gambar ({images.length} gambar dipilih):</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={image.previewUrl} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                        {/* Overlay status */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.isUploading ? <div className="text-white text-sm">Uploading...</div> : image.uploadedPath ? <div className="text-green-400 text-sm">✓ Uploaded</div> : <div className="text-yellow-400 text-sm">Pending</div>}
                        </div>
                        {/* Tombol hapus */}
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                          disabled={image.isUploading}
                        >
                          <X size={14} />
                        </button>
                        {/* Info file */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">{image.file.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Area upload */}
              <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition">
                <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" id="upload" onChange={handleImageChange} disabled={isUploadingImages} />
                <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-gray-500" />
                  <p className="text-sm text-gray-500">{isUploadingImages ? "Mengupload gambar..." : "Upload Foto (bisa banyak, jpg/png, max 10 MB per file)"}</p>
                  <span className="text-xs text-gray-400">Bisa pilih banyak gambar sekaligus</span>
                </label>
              </div>

              {isUploadingImages && <p className="text-xs text-blue-600 mt-2">Sedang mengupload {images.filter((img) => img.isUploading).length} gambar...</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="kondisiPeruntukan">
                Kondisi Peruntukan<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="kondisiPeruntukan"
                name="kondisiPeruntukan"
                value={formData.kondisiPeruntukan}
                onChange={handleInputChange}
                placeholder="Masukkan Kondisi Peruntukan Barang"
                required
                className="resize-y"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "hidden",
                }}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="spesifikasi">
                Spesifikasi<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="spesifikasi"
                name="spesifikasi"
                value={formData.spesifikasi}
                onChange={handleInputChange}
                placeholder="Masukkan Spesifikasi Barang"
                required
                className="resize-y"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "hidden",
                }}
              />
            </div>

            {/* Produk Cross Selling - WAJIB 3 PRODUK */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                Produk Cross Selling
                <span className="text-red-500">*</span>
                <Badge variant={selectedCrossSellingIds.length === 3 ? "secondary" : "destructive"}>{selectedCrossSellingIds.length}/3</Badge>
              </Label>

              {/* Daftar produk yang sudah dipilih */}
              {selectedCrossSellingIds.length > 0 && (
                <div className="mb-4 space-y-2">
                  {selectedCrossSellingIds.map((produkId) => {
                    const produk = produkCrossSelling.find((p) => p.id === produkId);
                    return (
                      <div key={produkId} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm">
                          {produk?.name} - Rp {produk?.harga_jual.toLocaleString("id-ID")}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCrossSelling(produkId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dropdown untuk memilih produk cross-selling */}
              <div className="w-full">
                <Select onValueChange={handleAddCrossSelling} disabled={!selectedTahapanId || loadingCrossSelling || selectedCrossSellingIds.length >= 3}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingCrossSelling
                          ? "Loading..."
                          : !selectedTahapanId
                          ? "Pilih tahapan terlebih dahulu"
                          : availableCrossSelling.length === 0
                          ? selectedCrossSellingIds.length >= 3
                            ? "Sudah memilih 3 produk"
                            : "Tidak ada produk cross-selling tersisa"
                          : selectedCrossSellingIds.length >= 3
                          ? "Sudah memilih 3 produk"
                          : "Pilih produk cross-selling"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto">
                    {loadingCrossSelling ? (
                      <SelectItem value="loading" disabled>
                        Loading produk cross-selling...
                      </SelectItem>
                    ) : !selectedTahapanId ? (
                      <SelectItem value="no-tahap" disabled>
                        Pilih tahapan terlebih dahulu
                      </SelectItem>
                    ) : availableCrossSelling.length === 0 ? (
                      <SelectItem value="no-available" disabled>
                        {selectedCrossSellingIds.length >= 3 ? "Sudah memilih 3 produk" : "Tidak ada produk cross-selling"}
                      </SelectItem>
                    ) : (
                      availableCrossSelling.map((produk) => (
                        <SelectItem key={produk.id} value={produk.id}>
                          {produk.name} - Rp {produk.harga_jual.toLocaleString("id-ID")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={() => setOpen(false)} disabled={loading || isUploadingImages}>
              Kembali
            </Button>
            <Button type="submit" className="bg-[#0892D8] hover:bg-[#0892D8]/90" disabled={loading || selectedCrossSellingIds.length !== 3 || isUploadingImages || images.length === 0}>
              {loading ? "Menambahkan..." : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
