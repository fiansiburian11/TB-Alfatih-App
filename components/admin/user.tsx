"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, apiRequest } from "@/lib/axios";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { showErrorToast } from "../layout/snackbar";
import DialogTambahUser from "./createuser";
import UserSwitch from "./dialogconfirm";
import DialogEditUser from "./dialogedituser";
import DialogViewUser from "./dialogviewuser";

type User = {
  id: string;
  username: string;
  password: string;
  status: boolean;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
};

type PaginationInfo = {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // State untuk search loading
  const [isSearching, setIsSearching] = useState(false);

  // Ref untuk menyimpan data asli sebelum search
  const originalUsersRef = useRef<User[]>([]);
  const originalPaginationRef = useRef<PaginationInfo>({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // Fetch data dengan parameter pagination dan search
  const fetchData = async (page: number = currentPage, searchQuery: string = search, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await apiRequest(`/private/users?desc=true&${params}`);

      if (response && response.data && Array.isArray(response.data.data)) {
        const usersData = response.data.data.map((user: any) => ({
          id: user.id,
          username: user.username,
          status: user.status,
          avatar: `https://api.rusnandapurnama.com/${user.img_profile}` || "/assets/genteng.jpg",
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));

        setUsers(usersData);

        // Update informasi pagination dari response
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }

        // Simpan data asli jika ini adalah load tanpa search
        if (!searchQuery) {
          originalUsersRef.current = usersData;
          if (response.data.pagination) {
            originalPaginationRef.current = response.data.pagination;
          }
        }
      } else {
        // console.warn("Unexpected API response structure:", response);
        setUsers([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch users";
      setError(errorMessage);
      // console.error("Failed to fetch users:", err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      setIsSearching(false);
    }
  };

  // Fetch data ketika component mount atau itemsPerPage berubah
  useEffect(() => {
    fetchData(1, "", true); // Reset ke page 1 tanpa search
  }, [itemsPerPage]);

  // Debounce search untuk menghindari terlalu banyak request
  useEffect(() => {
    // Jika search kosong, kembalikan ke data asli tanpa API call
    if (search.trim() === "") {
      setIsSearching(false);
      if (originalUsersRef.current.length > 0) {
        setUsers(originalUsersRef.current);
        setPagination(originalPaginationRef.current);
        setCurrentPage(1);
      }
      return;
    }

    // Jika ada search query, lakukan API call dengan debounce
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchData(1, search, false); // false agar tidak show loading
      setCurrentPage(1);
    }, 300); // Delay 300ms untuk lebih responsif

    return () => clearTimeout(timer);
  }, [search]);

  // Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      setCurrentPage(page);
      fetchData(page, search, false); // false agar tidak show loading
    }
  };

  // Handler untuk items per page
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    // Update UI secara langsung tanpa fetch ulang
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)));

    // Update juga data asli
    if (originalUsersRef.current.length > 0) {
      originalUsersRef.current = originalUsersRef.current.map((user) => (user.id === userId ? { ...user, status: newStatus } : user));
    }

    try {
      await api.put(`/private/admin/users`, {
        id: userId,
        status: newStatus,
      });
    } catch (err) {
      // console.error("Gagal update status:", err);
      // Revert perubahan jika gagal
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: !newStatus } : user)));
      if (originalUsersRef.current.length > 0) {
        originalUsersRef.current = originalUsersRef.current.map((user) => (user.id === userId ? { ...user, status: !newStatus } : user));
      }
      showErrorToast("Gagal mengupdate status user");
    }
  };

  const handleUserUpdate = (userId: string, updatedData: Partial<User>) => {
    // Update UI secara langsung tanpa fetch ulang
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updatedData } : user)));

    // Update juga data asli
    if (originalUsersRef.current.length > 0) {
      originalUsersRef.current = originalUsersRef.current.map((user) => (user.id === userId ? { ...user, ...updatedData } : user));
    }
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

  if (isLoading)
    return (
      <div className="p-6 bg-[#F7FAFC] rounded-xl shadow-sm flex justify-center items-center h-40">
        <p>Loading data users...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-[#F7FAFC] rounded-xl shadow-sm">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => fetchData(1, "", true)} className="mt-2 bg-[#0892D8] hover:bg-[#067ab1] text-white">
          Coba Lagi
        </Button>
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <DialogTambahUser onUserAdded={() => fetchData(1, search, true)} />

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Cari User" className="pl-10" value={search} onChange={handleSearchChange} />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0892D8]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white  overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="bg-[#E9F7FF] text-[#0892D8] font-semibold text-left">
              <th className="py-3 px-4 w-10">No</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  {search ? "User tidak ditemukan" : "Tidak ada data users"}
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className="border-b last:border-none hover:bg-slate-50 transition">
                  <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Image src={user.avatar} width={28} height={28} alt={user.username} className="rounded-full" />
                    <span>{user.username}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <UserSwitch user={user} onStatusChange={(newStatus) => handleStatusChange(user.id, newStatus)} />
                  </td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <DialogViewUser user={user} onUserUpdate={(updatedData) => handleUserUpdate(user.id, updatedData)} />
                    <DialogEditUser user={user} onUserUpdate={(updatedData) => handleUserUpdate(user.id, updatedData)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-gray-600">
        {/* Keterangan jumlah data */}
        <div className="text-center md:text-left">
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total_data)}
          </span>{" "}
          dari <span className="font-medium">{pagination.total_data}</span> user
          {search && <span className="ml-2 text-[#0892D8] italic">(Hasil pencarian: "{search}")</span>}
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
          <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0892D8]">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-gray-600">per halaman</span>
        </div>
      </div>
    </div>
  );
}
