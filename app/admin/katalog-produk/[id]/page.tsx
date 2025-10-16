// "use client";

// import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
// import DraftPenawaran from "@/components/layout/tooltip-salin";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/axios";
// import { ArrowLeft, Copy, Star } from "lucide-react";
// import Image from "next/image";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// // Sesuaikan type dengan response API
// interface DraftPenawaranType {
//   id: string;
//   product_id: string;
//   judul: string;
//   chat: string;
//   created_at: string;
//   updated_at: string;
// }

// type Produk = {
//   id: string;
//   name: string;
//   jenis: string;
//   kondisi_peruntukan: string;
//   spesifikasi: string;
//   harga_jual: number;
//   type: "inti" | "cross_selling";
//   prioritas_upselling?: boolean;
//   kategori?: {
//     id: string;
//     name: string;
//     tahap?: {
//       id: string;
//       numbers: number;
//       title: string;
//       details: string;
//     };
//   };
//   img_products?: {
//     id: string;
//     path: string;
//   }[];
//   cross_selling_inti?: {
//     id: string;
//     product_inti_id: string;
//     product_cross_selling_id: string;
//     product_cross_selling: {
//       id: string;
//       name: string;
//       harga_jual: number;
//       jenis: string;
//       kondisi_peruntukan: string;
//       type: string;
//       img_products?: {
//         id: string;
//         path: string;
//       }[];
//       kategori?: {
//         id: string;
//         name: string;
//         tahap?: {
//           id: string;
//           numbers: number;
//           title: string;
//           details: string;
//         };
//       };
//     };
//   }[];
//   draft_penawaran?: DraftPenawaranType[];
// };

// // Type untuk cross selling dengan draft
// type CrossSellingWithDraft = {
//   id: string;
//   name: string;
//   harga_jual: number;
//   jenis: string;
//   kondisi_peruntukan: string;
//   type: string;
//   img_products?: {
//     id: string;
//     path: string;
//   }[];
//   kategori?: {
//     id: string;
//     name: string;
//     tahap?: {
//       id: string;
//       numbers: number;
//       title: string;
//       details: string;
//     };
//   };
//   draft_penawaran?: DraftPenawaranType[];
// };

// export default function DetailProduk() {
//   const router = useRouter();
//   const params = useParams();
//   const productId = params.id as string;

//   const [produk, setProduk] = useState<Produk | null>(null);
//   const [crossSellingData, setCrossSellingData] = useState<{ [key: string]: CrossSellingWithDraft }>({});
//   const [loading, setLoading] = useState(true);
//   const [selectedImage, setSelectedImage] = useState(0);

//   const fmtRp = new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     maximumFractionDigits: 0,
//   });

//   // Fetch data cross selling dengan draft penawaran
//   const fetchCrossSellingData = async (crossSellingIds: string[]) => {
//     if (crossSellingIds.length === 0) return;

//     try {
//       // Fetch semua data cross selling
//       const res = await api.get("/private/product?type=cross_selling");

//       if (res.data?.data?.data) {
//         const crossProducts = res.data.data.data as CrossSellingWithDraft[];
//         const crossDataMap: { [key: string]: CrossSellingWithDraft } = {};

//         // Map data cross selling berdasarkan ID
//         crossSellingIds.forEach((id) => {
//           const crossProduct = crossProducts.find((p: CrossSellingWithDraft) => p.id === id);
//           if (crossProduct) {
//             crossDataMap[id] = crossProduct;
//           }
//         });

//         setCrossSellingData(crossDataMap);
//         console.log("✅ Data cross selling dengan draft:", crossDataMap);
//       }
//     } catch (err) {
//       console.error("❌ Gagal fetch data cross selling:", err);
//     }
//   };

//   useEffect(() => {
//     const fetchProdukDetail = async () => {
//       try {
//         setLoading(true);
//         // API mengembalikan array of products, jadi kita fetch semua dan filter
//         const res = await api.get("/private/product");

//         console.log("📦 Response detail produk:", res.data);

//         if (res.data?.data?.data) {
//           // Cari produk yang sesuai dengan ID dari array
//           const products = res.data.data.data as Produk[];
//           const productData = products.find((p: Produk) => p.id === productId);

//           if (productData) {
//             setProduk(productData);
//             console.log("✅ Produk ditemukan:", productData.name);

//             // Jika produk memiliki cross selling, fetch data cross selling dengan draft
//             if (productData.cross_selling_inti && productData.cross_selling_inti.length > 0) {
//               const crossIds = productData.cross_selling_inti.map((cross: any) => cross.product_cross_selling.id);
//               fetchCrossSellingData(crossIds);
//             }
//           } else {
//             console.error("❌ Produk tidak ditemukan dengan ID:", productId);
//             setProduk(null);
//           }
//         } else {
//           console.error("❌ Data tidak valid:", res.data);
//           setProduk(null);
//         }
//       } catch (err: any) {
//         console.error("Gagal fetch detail produk:", err);
//         showErrorToast("Gagal memuat detail produk");
//         setProduk(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (productId) {
//       fetchProdukDetail();
//     }
//   }, [productId]);

//   const copyToClipboard = async (text: string, judul: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       showSuccessToast(`Pesan "${judul}" berhasil disalin`);
//     } catch (err) {
//       console.error("Failed to copy text: ", err);
//       showErrorToast("Gagal menyalin pesan");
//     }
//   };

//   const copyImageToClipboard = async () => {
//     if (!produk?.img_products?.[selectedImage]) return;

//     try {
//       const imageUrl = `https://api.rusnandapurnama.com${produk.img_products[selectedImage].path}`;
//       const response = await fetch(imageUrl);
//       const blob = await response.blob();
//       const item = new ClipboardItem({ [blob.type]: blob });
//       await navigator.clipboard.write([item]);
//       showSuccessToast("gambar berhasil disalin");
//     } catch (err) {
//       console.error("Failed to copy image: ", err);
//       // Fallback: copy image URL
//       const imageUrl = `https://api.rusnandapurnama.com${produk.img_products[selectedImage].path}`;
//       await navigator.clipboard.writeText(imageUrl);
//       showSuccessToast("URL gambar berhasil disalin");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
//         <div className="animate-pulse">
//           <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="h-64 bg-gray-200 rounded"></div>
//             <div className="space-y-4">
//               <div className="h-4 bg-gray-200 rounded"></div>
//               <div className="h-4 bg-gray-200 rounded"></div>
//               <div className="h-4 bg-gray-200 rounded"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!produk) {
//     return (
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
//         <div className="text-center">
//           <h1 className="text-xl font-semibold text-gray-800 mb-4">Produk tidak ditemukan</h1>
//           <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white px-5">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Kembali
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const mainImage = produk.img_products?.[selectedImage]?.path || "/placeholder-image.jpg";
//   const tahapNum = produk.kategori?.tahap?.numbers ?? "-";
//   const kategoriName = produk.kategori?.name ?? "Tanpa Kategori";

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-md shadow-sm">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6 border-b pb-2">
//           <h2 className="text-xl font-semibold text-gray-800">Detail Produk</h2>
//           <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white px-5">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Kembali
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Gambar utama */}
//           <div>
//             <div className="relative w-full h-[320px] rounded-lg overflow-hidden border border-gray-200">
//               <Image src={`https://api.rusnandapurnama.com${mainImage}`} alt={produk.name} fill className="object-cover" priority />
//               <button onClick={copyImageToClipboard} className="absolute inset-x-0 bottom-4 mx-auto bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-md hover:bg-green-600 transition max-w-[180px]">
//                 <span className="flex items-center gap-2 justify-center">
//                   <Copy className="w-4 h-4" />
//                   Salin Gambar
//                 </span>
//               </button>
//             </div>

//             {/* Thumbnail */}
//             {produk.img_products && produk.img_products.length > 1 && (
//               <div className="flex gap-3 mt-4">
//                 {produk.img_products.map((img, index) => (
//                   <div
//                     key={img.id}
//                     className={`relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-all ${selectedImage === index ? "border-blue-500 border-2" : "border-gray-200"}`}
//                     onClick={() => setSelectedImage(index)}
//                   >
//                     <Image src={`https://api.rusnandapurnama.com${img.path}`} alt={`${produk.name} ${index + 1}`} fill className="object-cover" />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Detail produk dalam tabel */}
//           <div className="text-sm text-gray-700">
//             <div className="flex items-center gap-2 mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">{produk.name}</h3>
//               {produk.prioritas_upselling && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
//             </div>

//             <table className="w-full">
//               <tbody>
//                 {/* Nama Barang */}
//                 <tr className="border-b border-gray-100">
//                   <td className="py-3 font-medium text-gray-600 w-1/3">Nama Barang</td>
//                   <td className="py-3">: {produk.jenis}</td>
//                 </tr>

//                 {/* Tahap */}
//                 <tr className="border-b border-gray-100">
//                   <td className="py-3 font-medium text-gray-600">Tahap</td>
//                   <td className="py-3">
//                     : <Badge className="bg-yellow-100 text-[#FEB941] font-medium rounded-md ml-1">Tahap {tahapNum}</Badge>
//                   </td>
//                 </tr>

//                 {/* Kategori */}
//                 <tr className="border-b border-gray-100">
//                   <td className="py-3 font-medium text-gray-600">Kategori</td>
//                   <td className="py-3">
//                     : <Badge className="bg-blue-100 text-[#0892D8] font-medium rounded-md ml-1">{kategoriName}</Badge>
//                   </td>
//                 </tr>

//                 {/* Harga Jual */}
//                 <tr className="border-b border-gray-100">
//                   <td className="py-3 font-medium text-gray-600">Harga Jual</td>
//                   <td className="py-3">: {fmtRp.format(produk.harga_jual)}</td>
//                 </tr>

//                 {/* Kondisi Peruntukan */}
//                 <tr className="border-b border-gray-100 align-top">
//                   <td className="py-3 font-medium text-gray-600 align-top">Kondisi Peruntukan</td>
//                   <td className="py-3 align-top flex gap-1">
//                     : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{produk.kondisi_peruntukan}</div>
//                   </td>
//                 </tr>

//                 {/* Spesifikasi */}
//                 <tr className="border-b border-gray-100 align-top">
//                   <td className="py-3 font-medium text-gray-600 align-top">Spesifikasi</td>
//                   <td className="py-3 align-top flex gap-1">
//                     : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{produk.spesifikasi}</div>
//                   </td>
//                 </tr>

//                 {/* Draft Penawaran */}
//                 <tr>
//                   <td className="py-3 font-medium text-gray-600 align-top">Draft Penawaran</td>
//                   <td className="py-3 flex gap-1">
//                     : <DraftPenawaran productId={produk.id} draftData={produk.draft_penawaran || []} />
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Cross Selling Section */}
//       {produk.cross_selling_inti && produk.cross_selling_inti.length > 0 && (
//         <div className="bg-white p-6 rounded-md shadow-sm">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Cross Selling</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {produk.cross_selling_inti.map((cross: any) => {
//               const crossProduct = cross.product_cross_selling;
//               const crossWithDraft = crossSellingData[crossProduct.id];

//               // Gunakan data dari crossSellingData jika tersedia, fallback ke data dari produk utama
//               const displayProduct = crossWithDraft || crossProduct;

//               // Ambil gambar pertama dari produk cross selling
//               const crossImage = displayProduct.img_products?.[0]?.path || "/placeholder-image.jpg";
//               const crossTahapNum = displayProduct.kategori?.tahap?.numbers ?? "-";
//               const crossKategoriName = displayProduct.kategori?.name ?? "Tanpa Kategori";
//               const crossDrafts = crossWithDraft?.draft_penawaran || [];

//               return (
//                 <div key={displayProduct.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                   {/* Gambar Cross Selling */}
//                   <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-3">
//                     <Image src={`https://api.rusnandapurnama.com${crossImage}`} alt={displayProduct.name} fill className="object-cover" />
//                   </div>

//                   <div className="flex items-start justify-between mb-2">
//                     <div>
//                       <div className="flex gap-1 mt-1">
//                         <Badge className="bg-yellow-100 text-[#FEB941] text-xs">Tahap {crossTahapNum}</Badge>
//                         <Badge className="bg-blue-100 text-[#0892D8] text-xs">{crossKategoriName}</Badge>
//                       </div>
//                       <h4 className="font-semibold text-gray-800">{displayProduct.name}</h4>
//                     </div>
//                     <span className="text-[#0892D8] font-semibold">{fmtRp.format(displayProduct.harga_jual)}</span>
//                   </div>

//                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">{displayProduct.kondisi_peruntukan}</p>

//                   {/* Draft Penawaran untuk Cross Selling */}
//                   <div className="flex gap-2">
//                     <DraftPenawaran productId={displayProduct.id} draftData={crossDrafts} />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import DraftPenawaran from "@/components/layout/tooltip-salin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { ArrowLeft, Copy, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Sesuaikan type dengan response API
interface DraftPenawaranType {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

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
    id: string;
    product_inti_id: string;
    product_cross_selling_id: string;
    product_cross_selling: {
      id: string;
      name: string;
      harga_jual: number;
      jenis: string;
      kondisi_peruntukan: string;
      type: string;
      img_products?: {
        id: string;
        path: string;
      }[];
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
    };
  }[];
  draft_penawaran?: DraftPenawaranType[];
};

// Type untuk cross selling dengan draft
type CrossSellingWithDraft = {
  id: string;
  name: string;
  jenis: string;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  type: string;
  prioritas_upselling?: boolean;
  img_products?: {
    id: string;
    path: string;
  }[];
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
};

export default function DetailProduk() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [produk, setProduk] = useState<Produk | null>(null);
  const [crossSellingData, setCrossSellingData] = useState<{ [key: string]: CrossSellingWithDraft }>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // State untuk modal dialog
  const [selectedCrossSelling, setSelectedCrossSelling] = useState<CrossSellingWithDraft | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCrossImage, setSelectedCrossImage] = useState(0);

  const fmtRp = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  // Fetch data cross selling dengan draft penawaran
  const fetchCrossSellingData = async (crossSellingIds: string[]) => {
    if (crossSellingIds.length === 0) return;

    try {
      // Fetch semua data cross selling
      const res = await api.get("/private/product?type=cross_selling");

      if (res.data?.data?.data) {
        const crossProducts = res.data.data.data as CrossSellingWithDraft[];
        const crossDataMap: { [key: string]: CrossSellingWithDraft } = {};

        // Map data cross selling berdasarkan ID
        crossSellingIds.forEach((id) => {
          const crossProduct = crossProducts.find((p: CrossSellingWithDraft) => p.id === id);
          if (crossProduct) {
            crossDataMap[id] = crossProduct;
          }
        });

        setCrossSellingData(crossDataMap);
        console.log("✅ Data cross selling dengan draft:", crossDataMap);
      }
    } catch (err) {
      console.error("❌ Gagal fetch data cross selling:", err);
    }
  };

  useEffect(() => {
    const fetchProdukDetail = async () => {
      try {
        setLoading(true);
        // API mengembalikan array of products, jadi kita fetch semua dan filter
        const res = await api.get("/private/product");

        console.log("📦 Response detail produk:", res.data);

        if (res.data?.data?.data) {
          // Cari produk yang sesuai dengan ID dari array
          const products = res.data.data.data as Produk[];
          const productData = products.find((p: Produk) => p.id === productId);

          if (productData) {
            setProduk(productData);
            console.log("✅ Produk ditemukan:", productData.name);

            // Jika produk memiliki cross selling, fetch data cross selling dengan draft
            if (productData.cross_selling_inti && productData.cross_selling_inti.length > 0) {
              const crossIds = productData.cross_selling_inti.map((cross: any) => cross.product_cross_selling.id);
              fetchCrossSellingData(crossIds);
            }
          } else {
            console.error("❌ Produk tidak ditemukan dengan ID:", productId);
            setProduk(null);
          }
        } else {
          console.error("❌ Data tidak valid:", res.data);
          setProduk(null);
        }
      } catch (err: any) {
        console.error("Gagal fetch detail produk:", err);
        showErrorToast("Gagal memuat detail produk");
        setProduk(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProdukDetail();
    }
  }, [productId]);

  // Fungsi untuk membuka modal detail cross selling
  const openCrossSellingDetail = (crossProduct: CrossSellingWithDraft) => {
    setSelectedCrossSelling(crossProduct);
    setSelectedCrossImage(0);
    setIsDialogOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCrossSelling(null);
  };

  const copyToClipboard = async (text: string, judul: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`Pesan "${judul}" berhasil disalin`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showErrorToast("Gagal menyalin pesan");
    }
  };

  const copyImageToClipboard = async (imagePath: string) => {
    try {
      const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      showSuccessToast("gambar berhasil disalin");
    } catch (err) {
      console.error("Failed to copy image: ", err);
      // Fallback: copy image URL
      const imageUrl = `https://api.rusnandapurnama.com${imagePath}`;
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
              <Image src={`https://api.rusnandapurnama.com${mainImage}`} alt={produk.name} fill className="object-cover" priority />
              <button onClick={() => copyImageToClipboard(mainImage)} className="absolute inset-x-0 bottom-4 mx-auto bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-md hover:bg-green-600 transition max-w-[180px]">
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
                    : <DraftPenawaran productId={produk.id} draftData={produk.draft_penawaran || []} />
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
            {produk.cross_selling_inti.map((cross: any) => {
              const crossProduct = cross.product_cross_selling;
              const crossWithDraft = crossSellingData[crossProduct.id];

              // Gunakan data dari crossSellingData jika tersedia, fallback ke data dari produk utama
              const displayProduct = crossWithDraft || crossProduct;

              // Ambil gambar pertama dari produk cross selling
              const crossImage = displayProduct.img_products?.[0]?.path || "/placeholder-image.jpg";
              const crossTahapNum = displayProduct.kategori?.tahap?.numbers ?? "-";
              const crossKategoriName = displayProduct.kategori?.name ?? "Tanpa Kategori";
              const crossDrafts = crossWithDraft?.draft_penawaran || [];

              return (
                <div key={displayProduct.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCrossSellingDetail(displayProduct)}>
                  {/* Gambar Cross Selling */}
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <Image src={`https://api.rusnandapurnama.com${crossImage}`} alt={displayProduct.name} fill className="object-cover" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex gap-1 mt-1">
                        <Badge className="bg-yellow-100 text-[#FEB941] text-xs">Tahap {crossTahapNum}</Badge>
                        <Badge className="bg-blue-100 text-[#0892D8] text-xs">{crossKategoriName}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-800">{displayProduct.name}</h4>
                    </div>
                    <span className="text-[#0892D8] font-semibold">{fmtRp.format(displayProduct.harga_jual)}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{displayProduct.kondisi_peruntukan}</p>

                  {/* Draft Penawaran untuk Cross Selling */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <DraftPenawaran productId={displayProduct.id} draftData={crossDrafts} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Dialog untuk Detail Cross Selling */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCrossSelling && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedCrossSelling.name}
                  {selectedCrossSelling.prioritas_upselling && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                </DialogTitle>
                <DialogDescription>Detail Produk Cross Selling</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Gambar Cross Selling */}
                <div>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={`https://api.rusnandapurnama.com${selectedCrossSelling.img_products?.[selectedCrossImage]?.path || "/placeholder-image.jpg"}`} alt={selectedCrossSelling.name} fill className="object-cover" />
                    <button
                      onClick={() => copyImageToClipboard(selectedCrossSelling.img_products?.[selectedCrossImage]?.path || "")}
                      className="absolute inset-x-0 bottom-4 mx-auto bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-md hover:bg-green-600 transition max-w-[180px]"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <Copy className="w-4 h-4" />
                        Salin Gambar
                      </span>
                    </button>
                  </div>

                  {/* Thumbnail untuk Cross Selling */}
                  {selectedCrossSelling.img_products && selectedCrossSelling.img_products.length > 1 && (
                    <div className="flex gap-3 mt-4">
                      {selectedCrossSelling.img_products.map((img, index) => (
                        <div
                          key={img.id}
                          className={`relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-all ${selectedCrossImage === index ? "border-blue-500 border-2" : "border-gray-200"}`}
                          onClick={() => setSelectedCrossImage(index)}
                        >
                          <Image src={`https://api.rusnandapurnama.com${img.path}`} alt={`${selectedCrossSelling.name} ${index + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detail Cross Selling */}
                <div className="text-sm text-gray-700">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-600 w-1/3">Jenis Produk</td>
                        <td className="py-3">: {selectedCrossSelling.jenis}</td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-600">Tahap</td>
                        <td className="py-3">
                          : <Badge className="bg-yellow-100 text-[#FEB941] font-medium rounded-md ml-1">Tahap {selectedCrossSelling.kategori?.tahap?.numbers ?? "-"}</Badge>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-600">Kategori</td>
                        <td className="py-3">
                          : <Badge className="bg-blue-100 text-[#0892D8] font-medium rounded-md ml-1">{selectedCrossSelling.kategori?.name ?? "Tanpa Kategori"}</Badge>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-600">Harga Jual</td>
                        <td className="py-3">: {fmtRp.format(selectedCrossSelling.harga_jual)}</td>
                      </tr>

                      <tr className="border-b border-gray-100 align-top">
                        <td className="py-3 font-medium text-gray-600 align-top">Kondisi Peruntukan</td>
                        <td className="py-3 align-top flex gap-1">
                          : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{selectedCrossSelling.kondisi_peruntukan}</div>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100 align-top">
                        <td className="py-3 font-medium text-gray-600 align-top">Spesifikasi</td>
                        <td className="py-3 align-top flex gap-1">
                          : <div className="whitespace-pre-line text-gray-700 leading-relaxed ml-1">{selectedCrossSelling.spesifikasi}</div>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 font-medium text-gray-600 align-top">Draft Penawaran</td>
                        <td className="py-3 flex gap-1">
                          : <DraftPenawaran productId={selectedCrossSelling.id} draftData={selectedCrossSelling.draft_penawaran || []} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={closeDialog} variant="outline">
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
