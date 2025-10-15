"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import DraftPenawaran from "@/components/layout/tooltip-salin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { ArrowLeft, Copy, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Produk = {
  id: string;
  name: string;
  jenis: string;
  kondisi_peruntukan: string;
  spesifikasi: string;
  harga_jual: number;
  type: "inti" | "cross_selling";
  prioritas_upselling?: boolean;
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
  img_products?: {
    id: string;
    path: string;
  }[];
  cross_selling_inti?: {
    product_cross_selling: {
      id: string;
      name: string;
      harga_jual: number;
      jenis: string;
      kondisi_peruntukan: string;
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
      img_products?: {
        id: string;
        path: string;
      }[];
    };
  }[];
  draft_penawaran?: {
    id: string;
    judul: string;
    chat: string;
  }[];
};

export default function DetailProduk() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const fmtRp = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchProdukDetail = async () => {
      try {
        setLoading(true);
        // Gunakan endpoint yang sama seperti di katalog produk
        const res = await api.get(`/private/product?id=${productId}`);

        if (res.data?.data) {
          setProduk(res.data.data);
        }
      } catch (err: any) {
        // console.error("Gagal fetch detail produk:", err);
        showErrorToast("Gagal memuat detail produk");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProdukDetail();
    }
  }, [productId]);

  const copyToClipboard = async (text: string, judul: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`Pesan "${judul}" berhasil disalin`);
    } catch (err) {
    //   console.error("Failed to copy text: ", err);
      showErrorToast("Gagal menyalin pesan");
    }
  };

  const copyImageToClipboard = async () => {
    if (!produk?.img_products?.[selectedImage]) return;

    try {
      const imageUrl = `https://api.rusnandapurnama.com${produk.img_products[selectedImage].path}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      showSuccessToast("gambar berhasil disalin");
    } catch (err) {
    //   console.error("Failed to copy image: ", err);
      // Fallback: copy image URL
      const imageUrl = `https://api.rusnandapurnama.com${produk.img_products[selectedImage].path}`;
      await navigator.clipboard.writeText(imageUrl);
      showSuccessToast("URL gambar berhasil disalin");
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Produk tidak ditemukan</h1>
          <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white px-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = produk.img_products?.[selectedImage]?.path || "/placeholder-image.jpg";
  const tahapNum = produk.kategori?.tahap?.numbers ?? "-";
  const kategoriName = produk.kategori?.name ?? "Tanpa Kategori";

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-md shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Detail Produk</h2>
          <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white px-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gambar utama */}
          <div>
            <div className="relative w-full h-[320px] rounded-lg overflow-hidden border border-gray-200">
              <Image src={`https://api.rusnandapurnama.com${mainImage}`} alt={produk.name} fill className="object-cover" />
              <button onClick={copyImageToClipboard} className="absolute inset-x-0 bottom-4 mx-auto bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-md hover:bg-green-600 transition max-w-[180px]">
                <span className="flex items-center gap-2 justify-center">
                  <Copy className="w-4 h-4" />
                  Salin Gambar
                </span>
              </button>
            </div>

            {/* Thumbnail */}
            {produk.img_products && produk.img_products.length > 1 && (
              <div className="flex gap-3 mt-4">
                {produk.img_products.map((img, index) => (
                  <div
                    key={img.id}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-all ${selectedImage === index ? "border-blue-500 border-2" : "border-gray-200"}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image src={`https://api.rusnandapurnama.com${img.path}`} alt={`${produk.name} ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail produk dalam tabel */}
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{produk.name}</h3>
              {produk.prioritas_upselling && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
            </div>

            <table className="w-full">
              <tbody>
                {/* Nama Barang */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-600 w-1/3">Nama Barang</td>
                  <td className="py-3">: {produk.jenis}</td>
                </tr>

                {/* Tahap */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-600">Tahap</td>
                  <td className="py-3">
                    : <Badge className="bg-yellow-100 text-[#FEB941] font-medium rounded-md ml-1">Tahap {tahapNum}</Badge>
                  </td>
                </tr>

                {/* Kategori */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-600">Kategori</td>
                  <td className="py-3">
                    : <Badge className="bg-blue-100 text-[#0892D8] font-medium rounded-md ml-1">{kategoriName}</Badge>
                  </td>
                </tr>

                {/* Harga Jual */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-600">Harga Jual</td>
                  <td className="py-3">: {fmtRp.format(produk.harga_jual)}</td>
                </tr>

                {/* Kondisi Peruntukan */}
                <tr className="border-b border-gray-100 align-top">
                  <td className="py-3 font-medium text-gray-600 align-top">Kondisi Peruntukan</td>
                  <td className="py-3 align-top flex gap-1">
                    : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{produk.kondisi_peruntukan}</div>
                  </td>
                </tr>

                {/* Spesifikasi */}
                <tr className="border-b border-gray-100 align-top">
                  <td className="py-3 font-medium text-gray-600 align-top">Spesifikasi</td>
                  <td className="py-3 align-top flex gap-1">
                    : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{produk.spesifikasi}</div>
                  </td>
                </tr>

                {/* Draft Penawaran */}
                <tr>
                  <td className="py-3 font-medium text-gray-600 align-top">Draft Penawaran</td>
                  <td className="py-3 flex gap-1">
                    : <DraftPenawaran productId={produk.id} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cross Selling Section */}
      {produk.cross_selling_inti && produk.cross_selling_inti.length > 0 && (
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Cross Selling</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produk.cross_selling_inti.map((cross) => {
              // Ambil gambar pertama dari produk cross selling
              const crossImage = cross.product_cross_selling.img_products?.[0]?.path || "/placeholder-image.jpg";

              return (
                <div key={cross.product_cross_selling.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Gambar Cross Selling */}
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <Image src={`https://api.rusnandapurnama.com${crossImage}`} alt={cross.product_cross_selling.name} fill className="object-cover" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex gap-1 mt-1">
                        <Badge className="bg-yellow-100 text-[#FEB941] text-xs">Tahap {tahapNum}</Badge>
                        <Badge className="bg-blue-100 text-[#0892D8] text-xs">{kategoriName}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-800">{cross.product_cross_selling.name}</h4>
                    </div>
                    <span className="text-[#0892D8] font-semibold">{fmtRp.format(cross.product_cross_selling.harga_jual)}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cross.product_cross_selling.kondisi_peruntukan}</p>

                  <div className="flex gap-2">
                    <DraftPenawaran productId={cross.product_cross_selling.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
