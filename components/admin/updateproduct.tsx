"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api, apiRequest } from "@/lib/axios"; // ✅ GUNAKAN apiRequest
import { ChevronDown, Loader2, Pencil, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../layout/snackbar";

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
  name: string;
  jenis: string;
  harga_jual: number;
};

interface ImageProduct {
  id: string;
  path: string;
}

interface CrossSellingProduct {
  id: string;
  type: string;
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  kategori_id: string;
  img_products: ImageProduct[];
  kategori: {
    id: string;
    name: string;
    tahap_id: string;
    tahap: {
      id: string;
      title: string;
    };
  };
}

interface Produk {
  id: string;
  type: "inti" | "cross_selling";
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  kategori_id: string;
  img_products: ImageProduct[];
  kategori: {
    id: string;
    name: string;
    tahap_id: string;
    tahap: {
      id: string;
      title: string;
    };
  };
  cross_selling_products?: CrossSellingProduct[];
}

interface DialogEditProdukProps {
  produk: Produk;
  onSuccess?: () => void;
}

export default function DialogEditProduk({ produk, onSuccess }: DialogEditProdukProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);

  // State untuk tahapan dan kategori
  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
  const [produkCrossSelling, setProdukCrossSelling] = useState<ProdukCrossSelling[]>([]);

  // State untuk seleksi
  const [selectedTahapanId, setSelectedTahapanId] = useState<string>(produk.kategori?.tahap_id || "");
  const [selectedTahapanTitle, setSelectedTahapanTitle] = useState<string>(produk.kategori?.tahap?.title || "Pilih Tahapan");
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>(produk.kategori_id || "");
  const [selectedKategoriTitle, setSelectedKategoriTitle] = useState<string>(produk.kategori?.name || "Pilih Kategori");
  const [selectedCrossSellingIds, setSelectedCrossSellingIds] = useState<string[]>(produk.cross_selling_products?.map((cs) => cs.id) || []);
  const [availableCrossSelling, setAvailableCrossSelling] = useState<ProdukCrossSelling[]>([]);

  const [formData, setFormData] = useState({
    name: produk.name || "",
    jenis: produk.jenis || "",
    prioritas_upselling: produk.prioritas_upselling || false,
    harga_jual: produk.harga_jual || 0,
    kondisi_peruntukan: produk.kondisi_peruntukan || "",
    spesifikasi: produk.spesifikasi || "",
  });

  const [images, setImages] = useState<ImageProduct[]>(produk.img_products || []);
  const [newImages, setNewImages] = useState<File[]>([]);

  // ✅ PERBAIKAN: Gunakan apiRequest seperti di kode berhasil
  // Fetch tahapan
  const fetchTahapan = async () => {
    try {
      // console.log("🔄 Fetching tahapan...");
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      // console.log("📦 Tahapan data:", data);
      setTahapan(data);
    } catch (error) {
      // console.error("❌ Gagal fetch tahapan:", error);
      setTahapan([]);
    }
  };

  // ✅ PERBAIKAN: Gunakan apiRequest
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

      // Filter kategori berdasarkan tahapan yang dipilih
      if (selectedTahapanId) {
        const filtered = mapped.filter((item: Kategori) => item.tahap_id === selectedTahapanId);
        setFilteredKategori(filtered);
      }
    } catch (error) {
      // console.error("❌ Gagal fetch kategori:", error);
      setKategori([]);
      setFilteredKategori([]);
    }
  };

  // ✅ PERBAIKAN: Gunakan apiRequest
  // Fetch produk cross-selling berdasarkan tahap_id
  const fetchProdukCrossSellingByTahap = async (tahapId: string) => {
    if (!tahapId) {
      setProdukCrossSelling([]);
      setAvailableCrossSelling([]);
      return;
    }

    try {
      // console.log("🔄 Fetching cross selling for tahap:", tahapId);
      const response = await apiRequest(`/private/product?type=cross_selling&tahap_id=${tahapId}`);

      let data = [];
      if (Array.isArray(response?.data?.data?.data)) {
        data = response.data.data.data;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }

      const crossSellingData = data
        .filter((produk: any) => produk.type === "cross_selling")
        .map((produk: any) => ({
          id: produk.id,
          name: produk.name,
          jenis: produk.jenis,
          harga_jual: produk.harga_jual,
        }));

      // console.log("📦 Cross selling data:", crossSellingData);
      setProdukCrossSelling(crossSellingData);

      // Filter out already selected cross selling products
      const available = crossSellingData.filter((produk: ProdukCrossSelling) => !selectedCrossSellingIds.includes(produk.id));
      setAvailableCrossSelling(available);
    } catch (error) {
      // console.error("❌ Gagal fetch produk cross-selling:", error);
      setProdukCrossSelling([]);
      setAvailableCrossSelling([]);
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

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image upload - satu per satu
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);

    for (const file of filesArray) {
      // Validasi ukuran file (max 1MB)
      if (file.size > 1024 * 1024) {
        showErrorToast(`File ${file.name} melebihi 1MB`);
        continue;
      }

      // Validasi tipe file
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showErrorToast(`File ${file.name} harus format JPEG, PNG, atau WebP`);
        continue;
      }

      try {
        setUploadingImages((prev) => [...prev, file.name]);

        const formData = new FormData();
        formData.append("img_product", file);

        const response = await api.post("/private/as/product/img", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data?.data?.img_product) {
          const newImage: ImageProduct = {
            id: `temp-${Date.now()}`,
            path: response.data.data.img_product,
          };
          setImages((prev) => [...prev, newImage]);
          showSuccessToast(`Gambar ${file.name} berhasil diupload`);
        } else {
          throw new Error("Path gambar tidak ditemukan di response");
        }
      } catch (error: any) {
        // console.error("Upload error:", error);
        showErrorToast(`Gagal upload gambar ${file.name}: ${error.response?.data?.message || "Server error"}`);
      } finally {
        setUploadingImages((prev) => prev.filter((name) => name !== file.name));
      }
    }

    e.target.value = "";
  };

  // Delete existing image
  const deleteImage = async (imageId: string, imagePath: string) => {
    try {
      // Jika gambar baru (temp ID), cukup hapus dari state
      if (imageId.startsWith("temp-")) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        showSuccessToast("Gambar berhasil dihapus");
        return;
      }

      // Jika gambar existing, call API delete
      setUploadingImages((prev) => [...prev, imagePath]);

      await api.delete("/private/as/product/img", {
        data: { id: imageId },
      });

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showSuccessToast("Gambar berhasil dihapus");
    } catch (error: any) {
      // console.error("Delete error:", error);
      showErrorToast("Gagal menghapus gambar");
    } finally {
      setUploadingImages((prev) => prev.filter((path) => path !== imagePath));
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

    const newSelectedIds = [...selectedCrossSellingIds, produkId];
    setSelectedCrossSellingIds(newSelectedIds);

    // Update available cross selling
    const available = availableCrossSelling.filter((produk) => produk.id !== produkId);
    setAvailableCrossSelling(available);
  };

  // Hapus produk cross-selling
  const handleRemoveCrossSelling = (produkId: string) => {
    const produk = produkCrossSelling.find((p) => p.id === produkId);
    if (produk) {
      setAvailableCrossSelling([...availableCrossSelling, produk]);
    }
    setSelectedCrossSellingIds(selectedCrossSellingIds.filter((id) => id !== produkId));
  };

  // Ganti tahapan
  const handleSelectTahapan = (tahap: Tahapan) => {
    setSelectedTahapanId(tahap.id);
    setSelectedTahapanTitle(tahap.title);
    setSelectedKategoriId("");
    setSelectedKategoriTitle("Pilih Kategori");
    filterKategoriByTahapan(tahap.id);
    fetchProdukCrossSellingByTahap(tahap.id);
  };

  // Ganti kategori
  const handleSelectKategori = (kategori: Kategori) => {
    setSelectedKategoriId(kategori.id);
    setSelectedKategoriTitle(kategori.name);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi form
      if (!formData.name || !formData.jenis || !selectedKategoriId || !formData.harga_jual || !formData.kondisi_peruntukan || !formData.spesifikasi) {
        showErrorToast("Harap isi semua field yang wajib!");
        setLoading(false);
        return;
      }

      // Validasi cross-selling - wajib 3 produk untuk produk inti
      if (produk.type === "inti" && selectedCrossSellingIds.length !== 3) {
        showErrorToast("Harus memilih tepat 3 produk cross-selling!");
        setLoading(false);
        return;
      }

      // Siapkan data untuk update
      const updateData: any = {
        id: produk.id,
        name: formData.name,
        jenis: formData.jenis,
        prioritas_upselling: formData.prioritas_upselling.toString(),
        harga_jual: formData.harga_jual.toString(),
        kondisi_peruntukan: formData.kondisi_peruntukan,
        spesifikasi: formData.spesifikasi,
      };

      // Tambahkan kategori_id jika dipilih
      if (selectedKategoriId) {
        updateData.kategori_id = selectedKategoriId;
      }

      // Tambahkan array path gambar
      if (images.length > 0) {
        updateData.img_product = images.map((img) => img.path);
      }

      // Tambahkan cross_selling_id untuk produk inti
      if (produk.type === "inti" && selectedCrossSellingIds.length > 0) {
        updateData.cross_selling_id = selectedCrossSellingIds;
      }

      const endpoint = "/private/as/product";
      const response = await api.put(endpoint, updateData);

      if (response.data) {
        showSuccessToast("Produk berhasil diperbarui");
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: any) {
      // console.error("Error updating product:", error);
      showErrorToast(error.response?.data?.message || "Gagal memperbarui produk");
    } finally {
      setLoading(false);
    }
  };

  // Load data ketika dialog dibuka
  useEffect(() => {
    if (open) {
      // console.log("🔴 Dialog opened, fetching data...");
      fetchTahapan();
      fetchAllKategori();

      // Load cross selling products jika produk adalah inti dan ada tahap_id
      if (produk.type === "inti" && produk.kategori?.tahap_id) {
        // console.log("🔴 Fetching cross selling for existing tahap:", produk.kategori.tahap_id);
        fetchProdukCrossSellingByTahap(produk.kategori.tahap_id);
      }
    }
  }, [open]);

  // Filter kategori ketika tahapan berubah
  useEffect(() => {
    if (selectedTahapanId && kategori.length > 0) {
      // console.log("🟡 Filtering kategori for tahap:", selectedTahapanId);
      filterKategoriByTahapan(selectedTahapanId);
    }
  }, [selectedTahapanId, kategori]);

  // Update available cross selling ketika produkCrossSelling berubah
  useEffect(() => {
    if (produkCrossSelling.length > 0) {
      // console.log("🟢 Updating available cross selling, total:", produkCrossSelling.length);
      const available = produkCrossSelling.filter((p) => !selectedCrossSellingIds.includes(p.id));
      setAvailableCrossSelling(available);
      // console.log("🟢 Available cross selling:", available.length);
    }
  }, [produkCrossSelling, selectedCrossSellingIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-[#FEB941] text-white hover:bg-[#FEB941]/80  rounded-md">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Produk {produk.type === "inti" ? "Barang Inti" : "Cross Selling"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="jenis" value={formData.jenis} onChange={(e) => handleInputChange("jenis", e.target.value)} placeholder="Masukkan jenis produk" required />
          </div>

          {/* Jenis Produk */}
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis Produk</Label>

            <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Masukkan nama produk" required />
          </div>

          {/* Tahapan */}
          <div className="space-y-2">
            <Label>Tahapan</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedTahapanTitle}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuLabel>Pilih Tahapan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tahapan.length === 0 ? (
                  <DropdownMenuItem disabled>{tahapan.length === 0 ? "Loading tahapan..." : "Tidak ada tahapan"}</DropdownMenuItem>
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

          {/* Kategori */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={!selectedTahapanId}>
                  {selectedKategoriTitle}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!selectedTahapanId ? (
                  <DropdownMenuItem disabled>Pilih tahapan terlebih dahulu</DropdownMenuItem>
                ) : filteredKategori.length === 0 ? (
                  <DropdownMenuItem disabled>{kategori.length === 0 ? "Loading kategori..." : "Tidak ada kategori untuk tahapan ini"}</DropdownMenuItem>
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

          {/* Harga Jual */}
          <div className="space-y-2">
            <Label htmlFor="harga_jual">Harga Jual</Label>
            <Input id="harga_jual" type="number" value={formData.harga_jual} onChange={(e) => handleInputChange("harga_jual", parseInt(e.target.value) || 0)} placeholder="Masukkan harga jual" required />
          </div>

          {/* Prioritas Upselling */}
          <div className="flex items-center space-x-2">
            <Switch id="prioritas_upselling" checked={formData.prioritas_upselling} onCheckedChange={(checked) => handleInputChange("prioritas_upselling", checked)} />
            <Label htmlFor="prioritas_upselling">Prioritas Upselling</Label>
          </div>

          {/* Gambar Produk */}
          <div className="space-y-2">
            <Label>Gambar Produk</Label>

            {/* Existing Images */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img src={`https://api.rusnandapurnama.com${image.path}`} alt="Product" className="w-full h-20 object-cover rounded border" crossOrigin="anonymous" />
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id, image.path)}
                    disabled={uploadingImages.includes(image.path)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {uploadingImages.includes(image.path) ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Upload New Image */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={uploadingImages.length > 0} />
              <Label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingImages.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                {uploadingImages.length > 0 ? <Loader2 className="w-6 h-6 text-gray-400 animate-spin" /> : <Upload className="w-6 h-6 text-gray-400" />}
                <span className="text-sm text-gray-500">{uploadingImages.length > 0 ? `Uploading ${uploadingImages.length} gambar...` : "Upload Gambar Baru (Max 1MB per file)"}</span>
              </Label>
            </div>
          </div>

          {/* Kondisi Peruntukan */}
          <div className="space-y-2">
            <Label htmlFor="kondisi_peruntukan">Kondisi Peruntukan</Label>
            <Textarea id="kondisi_peruntukan" value={formData.kondisi_peruntukan} onChange={(e) => handleInputChange("kondisi_peruntukan", e.target.value)} placeholder="Deskripsi kondisi dan peruntukan produk" rows={3} required />
          </div>

          {/* Spesifikasi */}
          <div className="space-y-2">
            <Label htmlFor="spesifikasi">Spesifikasi</Label>
            <Textarea id="spesifikasi" value={formData.spesifikasi} onChange={(e) => handleInputChange("spesifikasi", e.target.value)} placeholder="Spesifikasi lengkap produk" rows={4} required />
          </div>

          {/* Produk Cross Selling (hanya untuk produk inti) */}
          {produk.type === "inti" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Produk Cross Selling
                <Badge variant={selectedCrossSellingIds.length === 3 ? "secondary" : "destructive"}>{selectedCrossSellingIds.length}/3</Badge>
              </Label>

              {/* Daftar produk yang sudah dipilih */}
              {selectedCrossSellingIds.length > 0 && (
                <div className="space-y-2">
                  {selectedCrossSellingIds.map((produkId) => {
                    const produk = produkCrossSelling.find((p) => p.id === produkId);
                    return (
                      <div key={produkId} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm">
                          {produk?.name || "Loading..."} {produk && `- Rp ${produk.harga_jual.toLocaleString("id-ID")}`}
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
              <Select onValueChange={handleAddCrossSelling} disabled={!selectedTahapanId || selectedCrossSellingIds.length >= 3} value="">
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedTahapanId
                        ? "Pilih tahapan terlebih dahulu"
                        : selectedCrossSellingIds.length >= 3
                        ? "Sudah memilih 3 produk"
                        : availableCrossSelling.length === 0
                        ? "Tidak ada produk cross-selling tersedia"
                        : "Pilih produk cross-selling"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {!selectedTahapanId ? (
                    <SelectItem value="no-tahap" disabled>
                      Pilih tahapan terlebih dahulu
                    </SelectItem>
                  ) : availableCrossSelling.length === 0 ? (
                    <SelectItem value="no-available" disabled>
                      {produkCrossSelling.length === 0 ? "Loading..." : "Tidak ada produk cross-selling tersedia"}
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
          )}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => setOpen(false)} disabled={loading || uploadingImages.length > 0}>
              Batal
            </Button>
            <Button type="submit" className="bg-[#0892D8] hover:bg-[#0892D8]/90" disabled={loading || uploadingImages.length > 0 || (produk.type === "inti" && selectedCrossSellingIds.length !== 3)}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
