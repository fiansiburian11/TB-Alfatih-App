"use client";

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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

export default function DialogTambahProduk() {
  const [open, setOpen] = useState(false);
  const [isPrioritas, setIsPrioritas] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCrossSelling, setLoadingCrossSelling] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>("");

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

  // Fetch tahapan
  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      setTahapan(data);
    } catch (error) {
      console.error("Gagal fetch tahapan:", error);
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
      console.error("Gagal fetch kategori:", error);
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

      console.log("🔍 Data cross-selling:", crossSellingData);
      setProdukCrossSelling(crossSellingData);
      setAvailableCrossSelling(crossSellingData);
    } catch (error) {
      console.error("Gagal fetch produk cross-selling:", error);
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

  // Upload image handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setUploadedImagePath(""); // Reset uploaded path ketika gambar diganti
    }
  };

  // STEP 1: Upload gambar ke endpoint
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("img_product", file);

    try {
      const response = await api.post("/private/as/product/img", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        throw new Error(response.data.message || "Gagal upload gambar");
      }

      return response.data.data.img_product;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Gagal upload gambar");
    }
  };

  // Tambah produk cross-selling
  const handleAddCrossSelling = (produkId: string) => {
    if (selectedCrossSellingIds.length >= 3) {
      alert("Maksimal 3 produk cross-selling yang dapat dipilih");
      return;
    }

    if (selectedCrossSellingIds.includes(produkId)) {
      alert("Produk ini sudah dipilih");
      return;
    }

    setSelectedCrossSellingIds([...selectedCrossSellingIds, produkId]);

    // Hapus dari available list
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

  // STEP 2: Submit produk inti dengan data lengkap
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi form
      if (!formData.namaProduk || !formData.jenisProduk || !selectedKategoriId || !formData.hargaJual || !formData.kondisiPeruntukan || !formData.spesifikasi) {
        alert("Harap isi semua field yang wajib!");
        setLoading(false);
        return;
      }

      // Validasi cross-selling - wajib 3 produk
      if (selectedCrossSellingIds.length !== 3) {
        alert("Harus memilih tepat 3 produk cross-selling!");
        setLoading(false);
        return;
      }

      let imagePaths: string[] = [];

      // Upload gambar jika ada
      if (image) {
        try {
          const uploadedPath = await uploadImage(image);
          imagePaths = [uploadedPath];
          setUploadedImagePath(uploadedPath);
        } catch (error) {
          alert("Gagal upload gambar. Silakan coba lagi.");
          setLoading(false);
          return;
        }
      }

      // Siapkan data untuk produk inti
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
        cross_selling_id: selectedCrossSellingIds, // ✅ Array of 3 cross-selling IDs
      };

      console.log("📤 Mengirim data produk inti:", productData);

      // Kirim data produk inti ke endpoint yang sama
      const response = await api.post("/private/as/product", productData);

      if (response.data.error) {
        throw new Error(response.data.message || "Gagal menambah produk inti");
      }

      // Success
      alert("Produk inti berhasil ditambahkan!");

      // Reset form
      setFormData({
        namaProduk: "",
        jenisProduk: "",
        hargaJual: "",
        kondisiPeruntukan: "",
        spesifikasi: "",
      });
      setImage(null);
      setUploadedImagePath("");
      setIsPrioritas(false);
      setSelectedTahapanId("");
      setSelectedTahapanTitle("Pilih Tahapan");
      setSelectedKategoriId("");
      setSelectedKategoriTitle("Pilih Kategori");
      setSelectedCrossSellingIds([]);
      setAvailableCrossSelling([]);

      setOpen(false);
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert(error.message || "Terjadi kesalahan saat menambah produk inti");
    } finally {
      setLoading(false);
    }
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

  // Reset cross-selling ketika tahapan berubah
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
          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="namaProduk">
                Nama Produk<span className="text-red-500">*</span>
              </Label>
              <Input id="namaProduk" name="namaProduk" value={formData.namaProduk} onChange={handleInputChange} placeholder="Masukkan Nama Produk" required />
            </div>

            <div>
              <Label htmlFor="jenisProduk">
                Jenis Produk<span className="text-red-500">*</span>
              </Label>
              <Input id="jenisProduk" name="jenisProduk" value={formData.jenisProduk} onChange={handleInputChange} placeholder="Masukkan Jenis Produk" required />
            </div>

            {/* tahapan */}
            <div>
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
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
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
            <div>
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
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
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

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label>Prioritas</Label>
              </div>
              <Switch checked={isPrioritas} onCheckedChange={setIsPrioritas} />
            </div>

            <div>
              <Label htmlFor="hargaJual">
                Harga Jual<span className="text-red-500">*</span>
              </Label>
              <Input id="hargaJual" name="hargaJual" type="number" value={formData.hargaJual} onChange={handleInputChange} placeholder="Masukkan Harga Jual" required />
            </div>

            {/* Upload Gambar */}
            <div>
              <Label>Foto Produk</Label>
              <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition">
                <input type="file" accept=".jpg,.png" className="hidden" id="upload" onChange={handleImageChange} />
                <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-gray-500" />
                  {image ? (
                    <p className="text-sm text-gray-700">{image.name}</p>
                  ) : uploadedImagePath ? (
                    <p className="text-sm text-green-600">Gambar berhasil diupload!</p>
                  ) : (
                    <p className="text-sm text-gray-500">Upload Foto (jpg/png, max 10 MB)</p>
                  )}
                </label>
              </div>
              {uploadedImagePath && <p className="text-xs text-green-600 mt-2">Gambar siap digunakan: {uploadedImagePath}</p>}
            </div>

            <div>
              <Label htmlFor="kondisiPeruntukan">
                Kondisi Peruntukan<span className="text-red-500">*</span>
              </Label>
              <Textarea id="kondisiPeruntukan" name="kondisiPeruntukan" value={formData.kondisiPeruntukan} onChange={handleInputChange} placeholder="Masukkan Kondisi Peruntukan Barang" required />
            </div>

            <div>
              <Label htmlFor="spesifikasi">
                Spesifikasi<span className="text-red-500">*</span>
              </Label>
              <Textarea id="spesifikasi" name="spesifikasi" value={formData.spesifikasi} onChange={handleInputChange} placeholder="Masukkan Spesifikasi Barang" required />
            </div>

            {/* Produk Cross Selling - WAJIB 3 PRODUK */}
            <div>
              <Label className="flex items-center gap-2">
                Produk Cross Selling
                <span className="text-red-500">*</span>
                <Badge variant={selectedCrossSellingIds.length === 3 ? "default" : "destructive"}>{selectedCrossSellingIds.length}/3</Badge>
              </Label>

              <p className="text-sm text-gray-500 mb-2">Pilih tepat 3 produk cross-selling untuk produk inti ini</p>

              {/* Daftar produk yang sudah dipilih */}
              {selectedCrossSellingIds.length > 0 && (
                <div className="mb-4 space-y-2">
                  <Label>Produk Terpilih:</Label>
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
              <Select onValueChange={handleAddCrossSelling} disabled={!selectedTahapanId || loadingCrossSelling || selectedCrossSellingIds.length >= 3}>
                <SelectTrigger>
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
                <SelectContent>
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
                      {selectedCrossSellingIds.length >= 3 ? "Sudah memilih 3 produk" : "Tidak ada produk cross-selling tersisa"}
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

              {/* Info jumlah produk tersedia */}
              {selectedTahapanId && availableCrossSelling.length > 0 && <p className="text-xs text-gray-500 mt-1">Tersedia: {availableCrossSelling.length} produk cross-selling</p>}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={() => setOpen(false)} disabled={loading}>
              Kembali
            </Button>
            <Button type="submit" disabled={loading || selectedCrossSellingIds.length !== 3}>
              {loading ? "Menambahkan..." : "Tambah Produk Inti"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
