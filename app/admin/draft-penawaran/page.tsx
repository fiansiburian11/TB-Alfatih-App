"use client";

import TambahDraftModal from "@/components/admin/tambahdraft";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import { useState } from "react";

const dataProduk = [
  { id: 1, nama: "Atap Spandek 3.0" },
  { id: 2, nama: "Granit 60x60" },
  { id: 3, nama: "Semen Merdeka" },
  { id: 4, nama: "Triplek 8 mm" },
  { id: 5, nama: "Batu Bata" },
  { id: 6, nama: "Cat Tembok" },
  { id: 7, nama: "Paku" },
  { id: 8, nama: "Kayu Jati" },
  { id: 9, nama: "Kaca" },
  { id: 10, nama: "Keramik" },
  { id: 11, nama: "Genteng" },
  { id: 12, nama: "Semen Putih" },
  { id: 13, nama: "Triplek 12 mm" },
  { id: 14, nama: "Granit 80x80" },
  { id: 15, nama: "Cat Kayu" },
  { id: 16, nama: "Pipa PVC" },
  { id: 17, nama: "Besi Beton" },
  { id: 18, nama: "Semir Kayu" },
];

export default function DraftPenawaran() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(dataProduk.length / itemsPerPage);

  const handlePageChange = (page: any) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: any) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const currentItems = dataProduk.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Buat array page number
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-6 bg-white rounded-md shadow">
      <TambahDraftModal />

      <table className="min-w-full">
        <thead className="bg-[#E9F7FF]">
          <tr>
            <th className="py-2 px-4 border-b font-normal text-left">NO</th>
            <th className="text-left py-2 px-4 border-b font-normal">Nama Produk</th>
            <th className="text-left py-2 px-4 border-b font-normal">Edit Draft Penawaran</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="py-2 px-4 border-b">{item.nama}</td>
              <td className="py-2 px-4 border-b space-x-2">
                <Button className="px-2 py-1 border rounded font-normal border-[#0892D8] bg-white text-[#0892D8] hover:bg-accent">
                  <PencilLine /> Salam
                </Button>
                <Button className="px-2 py-1 border rounded font-normal border-[#0892D8] bg-white text-[#0892D8] hover:bg-accent">
                  <PencilLine /> Tawar Produk
                </Button>
                <Button className="px-2 py-1 border rounded font-normal border-[#0892D8] bg-white text-[#0892D8] hover:bg-accent">
                  <PencilLine /> Cocok Untuk
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, dataProduk.length)}</span> of{" "}
            <span className="font-medium">{dataProduk.length}</span> items
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft size={16} />
          </Button>

          {/* Page Numbers */}
          {pageNumbers.map((num) => (
            <Button key={num} className={`font-normal border border-[#0892D8] px-3 py-1 ${currentPage === num ? "bg-[#0892D8] text-white" : "bg-white text-[#0892D8] hover:bg-accent"}`} onClick={() => handlePageChange(num)}>
              {num}
            </Button>
          ))}

          {/* Next Button */}
          <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8]" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
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
    </div>
  );
}
