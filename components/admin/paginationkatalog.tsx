"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaginationBarProps = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
};

export default function PaginationBar({ currentPage, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  return (
    <div className="flex items-center justify-between px-4 mt-3">
      {/* Info kiri */}
      <p className="text-sm text-gray-600">{totalItems > 0 ? `${startItem}-${endItem} dari ${totalItems} item` : "Tidak ada data"}</p>

      {/* Navigasi halaman */}
      <div className="space-x-1">
        <Button size="sm" variant="outline" className="text-[#0892D8] border-blue-200 hover:bg-blue-50" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          ‹
        </Button>

        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              className={`${page === currentPage ? "bg-[#0892D8] text-white hover:bg-[#0892D8]/90" : "text-gray-700 border-blue-200 hover:bg-blue-50"}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}

        <Button size="sm" variant="outline" className="text-[#0892D8] border-blue-200 hover:bg-blue-50" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          ›
        </Button>
      </div>

      {/* Items per page */}
      <div className="flex items-center gap-2 ml-3">
        <Select value={itemsPerPage.toString()} onValueChange={(val) => onItemsPerPageChange(Number(val))}>
          <SelectTrigger className="text-gray-600 w-[80px]">
            <SelectValue placeholder={itemsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">per halaman</span>
      </div>
    </div>
  );
}
