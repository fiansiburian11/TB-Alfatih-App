// // "use client";

// // import { useEffect, useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { Plus } from "lucide-react";
// // import { apiRequest } from "@/lib/axios";
// // import { showSuccessToast, showErrorToast } from "@/components/layout/snackbar";

// // type Tahapan = {
// //   id: string;
// //   title: string;
// //   numbers?: number;
// //   details?: string;
// //   created_at?: string;
// //   updated_at?: string;
// // };

// // interface DialogTambahFAQProps {
// //   onFAQAdded?: () => void;
// // }

// // export default function DialogTambahFAQ({ onFAQAdded }: DialogTambahFAQProps) {
// //   const [open, setOpen] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [tahapan, setTahapan] = useState<Tahapan[]>([]);
// //   const [selectedTahap, setSelectedTahap] = useState("");
// //   const [judul, setJudul] = useState("");
// //   const [keterangan, setKeterangan] = useState("");

// //   const fetchTahapan = async () => {
// //     try {
// //       const response = await apiRequest("/private/tahap");

// //       const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];

// //       setTahapan(data);
// //     } catch (error) {
// //       console.error("Gagal mengambil data tahapan:", error);
// //       setTahapan([]);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchTahapan();
// //   }, []);

// //   const resetForm = () => {
// //     setSelectedTahap("");
// //     setJudul("");
// //     setKeterangan("");
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!selectedTahap || !judul.trim() || !keterangan.trim()) {
// //       showErrorToast("Semua field harus diisi");
// //       return;
// //     }

// //     setIsLoading(true);
// //     try {
// //       await apiRequest("/private/admin/faq", {
// //         method: "POST",
// //         data: {
// //           tahap_id: selectedTahap,
// //           title: judul.trim(),
// //           details: keterangan.trim(),
// //         },
// //       });

// //       showSuccessToast("FAQ berhasil ditambahkan!");
// //       setOpen(false);
// //       resetForm();
// //       onFAQAdded?.();
// //     } catch (error: any) {
// //       console.error("Gagal menambahkan FAQ:", error);
// //       showErrorToast(`Gagal menambahkan FAQ: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <Dialog
// //       open={open}
// //       onOpenChange={(isOpen) => {
// //         setOpen(isOpen);
// //         if (!isOpen) resetForm();
// //       }}
// //     >
// //       <DialogTrigger asChild>
// //         <Button className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex items-center gap-2">
// //           <Plus size={18} />
// //           Tambah FAQ
// //         </Button>
// //       </DialogTrigger>
// //       <DialogContent className="max-w-2xl">
// //         <DialogHeader className="border-b pb-4">
// //           <DialogTitle className="text-xl font-semibold">Tambah FAQ</DialogTitle>
// //         </DialogHeader>
// //         <form onSubmit={handleSubmit} className="space-y-6 mt-4">
// //           {/* Pilih Tahap */}
// //           <div className="space-y-3">
// //             <Label htmlFor="tahap" className="text-sm font-medium text-gray-700">
// //               Pilih Tahap
// //             </Label>
// //             <Select value={selectedTahap} onValueChange={setSelectedTahap}>
// //               <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent">
// //                 <SelectValue placeholder="Pilih tahapan" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {tahapan.map((tahap) => (
// //                   <SelectItem key={tahap.id} value={tahap.id}>
// //                     {tahap.title}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>

// //           {/* Judul FAQ */}
// //           <div className="space-y-3">
// //             <Label htmlFor="judul" className="text-sm font-medium text-gray-700">
// //               Judul FAQ
// //             </Label>
// //             <Input id="judul" placeholder="Masukkan Judul FAQ" required value={judul} onChange={(e) => setJudul(e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent" />
// //           </div>

// //           {/* Keterangan FAQ */}
// //           <div className="space-y-3">
// //             <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
// //               Keterangan FAQ
// //             </Label>
// //             <textarea
// //               id="keterangan"
// //               placeholder="Masukkan Keterangan FAQ"
// //               required
// //               value={keterangan}
// //               onChange={(e) => setKeterangan(e.target.value)}
// //               className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0892D8] focus:border-transparent resize-y"
// //               style={{
// //                 whiteSpace: "pre-wrap",
// //                 wordWrap: "break-word",
// //                 overflowWrap: "break-word",
// //               }}
// //             />
// //           </div>

// //           {/* Tombol Aksi */}
// //           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
// //             <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-normal">
// //               Batal
// //             </Button>
// //             <Button type="submit" className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-normal" disabled={isLoading}>
// //               {isLoading ? "Menyimpan..." : "Simpan FAQ"}
// //             </Button>
// //           </div>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Plus } from "lucide-react";
// import { apiRequest } from "@/lib/axios";
// import { showSuccessToast, showErrorToast } from "@/components/layout/snackbar";

// type Tahapan = {
//   id: string;
//   title: string;
//   numbers?: number;
//   details?: string;
//   created_at?: string;
//   updated_at?: string;
// };

// interface DialogTambahFAQProps {
//   onFAQAdded: () => void;
// }

// export default function DialogTambahFAQ({ onFAQAdded }: DialogTambahFAQProps) {
//   const [open, setOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [tahapan, setTahapan] = useState<Tahapan[]>([]);
//   const [selectedTahap, setSelectedTahap] = useState("");
//   const [judul, setJudul] = useState("");
//   const [keterangan, setKeterangan] = useState("");

//   const fetchTahapan = async () => {
//     try {
//       const response = await apiRequest("/private/tahap");
//       const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
//       setTahapan(data);
//     } catch (error) {
//       console.error("Gagal mengambil data tahapan:", error);
//       setTahapan([]);
//     }
//   };

//   useEffect(() => {
//     fetchTahapan();
//   }, []);

//   const resetForm = () => {
//     setSelectedTahap("");
//     setJudul("");
//     setKeterangan("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTahap || !judul.trim() || !keterangan.trim()) {
//       showErrorToast("Semua field harus diisi");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await apiRequest("/private/admin/faq", {
//         method: "POST",
//         data: {
//           tahap_id: selectedTahap,
//           title: judul.trim(),
//           details: keterangan.trim(),
//         },
//       });

//       showSuccessToast("FAQ berhasil ditambahkan!");
//       setOpen(false);
//       resetForm();

//       // PASTIKAN onFAQAdded dipanggil di sini
//       onFAQAdded();
//     } catch (error: any) {
//       console.error("Gagal menambahkan FAQ:", error);
//       showErrorToast(`Gagal menambahkan FAQ: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(isOpen) => {
//         setOpen(isOpen);
//         if (!isOpen) resetForm();
//       }}
//     >
//       <DialogTrigger asChild>
//         <Button className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex items-center gap-2">
//           <Plus size={18} />
//           Tambah FAQ
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader className="border-b pb-4">
//           <DialogTitle className="text-xl font-semibold">Tambah FAQ</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6 mt-4">
//           {/* Pilih Tahap */}
//           <div className="space-y-3">
//             <Label htmlFor="tahap" className="text-sm font-medium text-gray-700">
//               Pilih Tahap
//             </Label>
//             <Select value={selectedTahap} onValueChange={setSelectedTahap}>
//               <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent">
//                 <SelectValue placeholder="Pilih tahapan" />
//               </SelectTrigger>
//               <SelectContent>
//                 {tahapan.map((tahap) => (
//                   <SelectItem key={tahap.id} value={tahap.id}>
//                     {tahap.title}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Judul FAQ */}
//           <div className="space-y-3">
//             <Label htmlFor="judul" className="text-sm font-medium text-gray-700">
//               Judul FAQ
//             </Label>
//             <Input id="judul" placeholder="Masukkan Judul FAQ" required value={judul} onChange={(e) => setJudul(e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent" />
//           </div>

//           {/* Keterangan FAQ */}
//           <div className="space-y-3">
//             <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
//               Keterangan FAQ
//             </Label>
//             <textarea
//               id="keterangan"
//               placeholder="Masukkan Keterangan FAQ"
//               required
//               value={keterangan}
//               onChange={(e) => setKeterangan(e.target.value)}
//               className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0892D8] focus:border-transparent resize-y"
//               style={{
//                 whiteSpace: "pre-wrap",
//                 wordWrap: "break-word",
//                 overflowWrap: "break-word",
//               }}
//             />
//           </div>

//           {/* Tombol Aksi */}
//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//             <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-normal">
//               Batal
//             </Button>
//             <Button type="submit" className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-normal" disabled={isLoading}>
//               {isLoading ? "Menyimpan..." : "Simpan FAQ"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Tahapan = {
  id: string;
  title: string;
  numbers?: number;
  details?: string;
  created_at?: string;
  updated_at?: string;
};

interface DialogTambahFAQProps {
  onFAQAdded: (tahap_id: string) => void; // Ubah menjadi string saja
}

export default function DialogTambahFAQ({ onFAQAdded }: DialogTambahFAQProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tahapan, setTahapan] = useState<Tahapan[]>([]);
  const [selectedTahap, setSelectedTahap] = useState("");
  const [judul, setJudul] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setTahapan(data);
    } catch (error) {
      console.error("Gagal mengambil data tahapan:", error);
      setTahapan([]);
    }
  };

  useEffect(() => {
    fetchTahapan();
  }, []);

  const resetForm = () => {
    setSelectedTahap("");
    setJudul("");
    setKeterangan("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTahap || !judul.trim() || !keterangan.trim()) {
      showErrorToast("Semua field harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/private/admin/faq", {
        method: "POST",
        data: {
          tahap_id: selectedTahap,
          title: judul.trim(),
          details: keterangan.trim(),
        },
      });

      showSuccessToast("FAQ berhasil ditambahkan!");
      setOpen(false);
      resetForm();

      // Kirim hanya tahap_id saja, bukan objek lengkap
      onFAQAdded(selectedTahap);
    } catch (error: any) {
      console.error("Gagal menambahkan FAQ:", error);
      showErrorToast(`Gagal menambahkan FAQ: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-semibold flex items-center gap-2 w-full">
            <Plus size={18} />
            Tambah FAQ
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">Tambah FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Pilih Tahap */}
            <div className="space-y-3">
              <Label htmlFor="tahap" className="text-sm font-medium text-gray-700">
                Pilih Tahap
              </Label>
              <Select value={selectedTahap} onValueChange={setSelectedTahap}>
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent">
                  <SelectValue placeholder="Pilih tahapan" />
                </SelectTrigger>
                <SelectContent>
                  {tahapan.map((tahap) => (
                    <SelectItem key={tahap.id} value={tahap.id}>
                      {tahap.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul FAQ */}
            <div className="space-y-3">
              <Label htmlFor="judul" className="text-sm font-medium text-gray-700">
                Judul FAQ
              </Label>
              <Input id="judul" placeholder="Masukkan Judul FAQ" required value={judul} onChange={(e) => setJudul(e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-[#0892D8] focus:border-transparent" />
            </div>

            {/* Keterangan FAQ */}
            <div className="space-y-3">
              <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
                Keterangan FAQ
              </Label>
              <textarea
                id="keterangan"
                placeholder="Masukkan Keterangan FAQ"
                required
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0892D8] focus:border-transparent resize-y"
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-normal">
                Batal
              </Button>
              <Button type="submit" className="bg-[#0892D8] hover:bg-[#067ab1] text-white font-normal" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
