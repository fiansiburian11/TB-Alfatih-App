// "use client";

// import TambahDraftModal from "@/components/admin/tambahdraft";
// import EditDraftModal from "@/components/admin/editdraft";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/axios";
// import { ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
// import { useEffect, useState } from "react";

// interface DraftPenawaranType {
//   id: string;
//   product_id: string;
//   judul: string;
//   chat: string;
//   created_at: string;
//   updated_at: string;
// }

// interface Produk {
//   id: string;
//   name: string;
//   jenis: string;
//   harga_jual: number;
//   type: "inti" | "cross_selling";
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
// }

// export default function DraftPenawaranPage() {
//   const [produk, setProduk] = useState<Produk[]>([]);
//   const [filteredProduk, setFilteredProduk] = useState<Produk[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);

//   // Fungsi untuk mendapatkan nama produk berdasarkan type
//   const getNamaProduk = (item: Produk) => {
//     return item.type === "inti" ? item.jenis : item.name;
//   };

//   // Fetch data dari API
//   const fetchProduk = async (page = currentPage, limit = itemsPerPage) => {
//     try {
//       setLoading(true);
//       const res = await api.get("/private/product", {
//         params: {
//           page,
//           items_per_page: limit,
//         },
//       });

//       if (res.data?.data?.data) {
//         const data = res.data.data.data;
//         const total = res.data.data.pagination?.total_data || data.length;

//         // Filter hanya produk yang memiliki draft penawaran
//         const produkDenganDraft = data.filter((item: Produk) => item.draft_penawaran && item.draft_penawaran.length > 0);

//         setProduk(data);
//         setFilteredProduk(produkDenganDraft);
//         setTotalItems(produkDenganDraft.length);
//       }
//     } catch (err) {
//       // console.error("Gagal fetch data produk:", err);
//       setProduk([]);
//       setFilteredProduk([]);
//       setTotalItems(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProduk(currentPage, itemsPerPage);
//   }, [currentPage, itemsPerPage]);

//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newItemsPerPage = Number(e.target.value);
//     setItemsPerPage(newItemsPerPage);
//     setCurrentPage(1);
//   };

//   // Buat array page number
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   // Hitung current items untuk pagination
//   const currentItems = filteredProduk.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   return (
//     <div className="p-6 bg-white rounded-md shadow">
//       <div className=" items-center mb-1">
//         <TambahDraftModal onSuccess={fetchProduk} />
//       </div>

//       {loading ? (
//         <div className="text-center py-8">
//           <p>Memuat Draft Penawaran...</p>
//         </div>
//       ) : filteredProduk.length === 0 ? (
//         <div className="text-center py-8">
//           <p>Tidak ada produk dengan draft penawaran.</p>
//         </div>
//       ) : (
//         <>
//           <table className="min-w-full">
//             <thead className="bg-[#E9F7FF]">
//               <tr>
//                 <th className="py-2 px-4 border-b font-normal text-left">NO</th>
//                 <th className="text-left py-2 px-4 border-b font-normal">Nama Produk</th>
//                 <th className="text-left py-2 px-4 border-b font-normal">Edit Draft Penawaran</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.map((item, index) => {
//                 return (
//                   <tr key={item.id} className="hover:bg-gray-50">
//                     <td className="py-2 px-4 border-b">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                     <td className="py-2 px-4 border-b font-medium">
//                       <div>
//                         <div>{getNamaProduk(item)}</div>
//                       </div>
//                     </td>

//                     <td className="py-2 px-4 border-b space-x-2">
//                       {/* Tombol untuk draft yang sudah ada */}
//                       {item.draft_penawaran && item.draft_penawaran.map((draft) => <EditDraftModal key={draft.id} draft={draft} onSuccess={fetchProduk} />)}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="flex justify-between items-center mt-4">
//             <div>
//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> items
//               </p>
//             </div>

//             <div className="flex items-center gap-1">
//               {/* Previous Button */}
//               <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
//                 <ChevronLeft size={16} />
//               </Button>

//               {/* Page Numbers */}
//               {pageNumbers.map((num) => (
//                 <Button key={num} className={`font-normal border border-[#0892D8] px-3 py-1 ${currentPage === num ? "bg-[#0892D8] text-white" : "bg-white text-[#0892D8] hover:bg-accent"}`} onClick={() => handlePageChange(num)}>
//                   {num}
//                 </Button>
//               ))}

//               {/* Next Button */}
//               <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
//                 <ChevronRight size={16} />
//               </Button>
//             </div>

//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="border rounded px-2 py-1 text-sm">
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//               </select>
//               <span>per halaman</span>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import EditDraftModal from "@/components/admin/editdraft";
import TambahDraftModal from "@/components/admin/tambahdraft";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface DraftPenawaranType {
  id: string;
  product_id: string;
  judul: string;
  chat: string;
  created_at: string;
  updated_at: string;
}

interface Produk {
  id: string;
  name: string;
  jenis: string;
  harga_jual: number;
  type: "inti" | "cross_selling";
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
}

export default function DraftPenawaranPage() {
  const [allProduk, setAllProduk] = useState<Produk[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fungsi untuk mendapatkan nama produk berdasarkan type
  const getNamaProduk = (item: Produk) => {
    return item.type === "inti" ? item.jenis : item.name;
  };

  // Fetch data dari API - TANPA PAGINATION
  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await api.get("/private/product");

      if (res.data?.data?.data) {
        const data = res.data.data.data;

        // Filter hanya produk yang memiliki draft penawaran
        const produkDenganDraft = data.filter((item: Produk) => item.draft_penawaran && item.draft_penawaran.length > 0);

        setAllProduk(data);
        setFilteredProduk(produkDenganDraft);
      }
    } catch (err) {
      console.error("Gagal fetch data produk:", err);
      setAllProduk([]);
      setFilteredProduk([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  // Pagination calculations
  const totalItems = filteredProduk.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure currentPage is valid
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredProduk.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers with limits
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the beginning
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="p-6 bg-white rounded-md shadow">
      <div className="items-center mb-1">
        <TambahDraftModal onSuccess={fetchProduk} />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Memuat data...</p>
        </div>
      ) : filteredProduk.length === 0 ? (
        <div className="text-center py-8">
          <p>Tidak ada produk dengan draft penawaran.</p>
        </div>
      ) : (
        <>
          <table className="min-w-full">
            <thead className="bg-[#E9F7FF]">
              <tr>
                <th className="py-2 px-4 border-b font-normal text-left">NO</th>
                <th className="text-left py-2 px-4 border-b font-normal">Nama Produk</th>
                <th className="text-left py-2 px-4 border-b font-normal">Edit Draft Penawaran</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                const itemNumber = startIndex + index + 1;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{itemNumber}</td>
                    <td className="py-2 px-4 border-b font-medium">
                      <div>
                        <div>{getNamaProduk(item)}</div>
                      </div>
                    </td>

                    <td className="py-2 px-4 border-b space-x-2">
                      {/* Tombol untuk draft yang sudah ada */}
                      {item.draft_penawaran && item.draft_penawaran.map((draft) => <EditDraftModal key={draft.id} draft={draft} onSuccess={fetchProduk} />)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> items
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(validCurrentPage - 1)} disabled={validCurrentPage === 1}>
                  <ChevronLeft size={16} />
                </Button>

                {/* Page Numbers */}
                {pageNumbers.map((num) => (
                  <Button key={num} className={`font-normal border border-[#0892D8] px-3 py-1 ${validCurrentPage === num ? "bg-[#0892D8] text-white" : "bg-white text-[#0892D8] hover:bg-accent"}`} onClick={() => handlePageChange(num)}>
                    {num}
                  </Button>
                ))}

                {/* Next Button */}
                <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(validCurrentPage + 1)} disabled={validCurrentPage === totalPages}>
                  <ChevronRight size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="border rounded px-2 py-1 text-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
