"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Staff {
  id: string;
  username: string;
  updated_at: string;
  status: boolean;
  _count: {
    sales_order: number;
  };
}

interface PaginationInfo {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
  search: string;
}

export default function AktivitasStaff() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [pagination, setPagination] = useState<PaginationInfo>({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
    search: "",
  });

  // Ref untuk menyimpan data asli sebelum search
  const originalStaffRef = useRef<Staff[]>([]);
  const originalPaginationRef = useRef<PaginationInfo>({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
    search: "",
  });

  // Fetch data dengan parameter pagination
  const fetchData = async (page: number = currentPage, limit: number = itemsPerPage, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        items_per_page: limit.toString(),
        desc: "true",
      });

      const response = await apiRequest(`/private/supervisor/dashboard/aktifitas-staff?${params}`);

      if (response && response.data && Array.isArray(response.data.data)) {
        setStaffData(response.data.data);

        // Update informasi pagination dari response
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }

        // Simpan data asli
        originalStaffRef.current = response.data.data;
        if (response.data.pagination) {
          originalPaginationRef.current = response.data.pagination;
        }
      } else {
        setStaffData([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch staff activities";
      setError(errorMessage);
      console.error("Failed to fetch staff activities:", err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Fetch data ketika component mount atau itemsPerPage berubah
  useEffect(() => {
    fetchData(1, itemsPerPage, true); // Reset ke page 1
  }, [itemsPerPage]);

  // Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      setCurrentPage(page);
      fetchData(page, itemsPerPage, false);
    }
  };

  // Handler untuk items per page
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate page numbers untuk pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.max_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-32">
            <p>Loading data staff...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-32 text-red-500">
            <p>Error: {error}</p>
            <Button onClick={() => fetchData(1, itemsPerPage, true)} className="mt-2 bg-[#0892D8] hover:bg-[#067ab1] text-white ml-4">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Aktivitas Staff</h2>
        <div className="border-t border-gray-200 mt-1 mb-2" />

        <div className="overflow-x-auto">
          <Table className="min-w-full text-sm">
            <TableHeader>
              <TableRow className="bg-blue-50 hover:bg-blue-50">
                <TableHead className="font-semibold text-gray-800">Nama Staff</TableHead>
                <TableHead className="font-semibold text-gray-800 text-center">Pesanan Dibuat</TableHead>
                <TableHead className="font-semibold text-gray-800 text-center">Aktifitas Terakhir</TableHead>
                <TableHead className="font-semibold text-gray-800 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {staffData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    Tidak ada data staff
                  </TableCell>
                </TableRow>
              ) : (
                staffData.map((staff, index) => (
                  <TableRow key={staff.id} className="bg-white">
                    <TableCell className="flex items-center gap-3">
                      <Image src="/assets/user.png" alt={staff.username} width={35} height={35} className="rounded-full object-cover" />
                      <span className="font-medium text-gray-800">{staff.username}</span>
                    </TableCell>
                    <TableCell className="text-center text-gray-700">{staff._count.sales_order}</TableCell>
                    <TableCell className="text-center text-gray-700">{formatDate(staff.updated_at)}</TableCell>
                    <TableCell className={`text-center font-medium ${staff.status ? "text-green-600" : "text-gray-500"}`}>{staff.status ? "Aktif" : "Tidak Aktif"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-gray-600">
          {/* Keterangan jumlah data */}
          <div className="text-center md:text-left">
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total_data)}
            </span>{" "}
            dari <span className="font-medium">{pagination.total_data}</span> staff
          </div>

          {/* Navigasi pagination */}
          {pagination.max_page > 1 && (
            <div className="flex justify-center md:justify-end items-center gap-2">
              {/* Tombol Sebelumnya */}
              <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8] hover:bg-[#0892D8]/10" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </Button>

              {/* Nomor halaman */}
              <div className="flex gap-1">
                {generatePageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={currentPage === page ? "bg-[#0892D8] text-white hover:bg-[#067ab1]" : "border-[#0892D8] text-[#0892D8] hover:bg-[#0892D8]/10"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              {/* Tombol Selanjutnya */}
              <Button variant="outline" size="icon" className="text-[#0892D8] border-[#0892D8] hover:bg-[#0892D8]/10" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.max_page}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* Items per page */}
          <div className="flex items-center justify-center md:justify-end gap-2">
            <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-gray-600">per halaman</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
