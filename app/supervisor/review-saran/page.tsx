"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { ChevronLeft, ChevronRight, Filter, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/components/layout/snackbar";

interface Review {
  id: string;
  nama: string;
  star: number;
  comment: string;
  created_at: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: {
    data: Review[];
    pagination: {
      items_per_page: number;
      page: number;
      max_page: number;
      total_data: number;
    };
  };
  refrence: null;
  error: boolean;
}

export default function ReviewSaran() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"Terbaru" | "Terlama">("Terbaru");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // 🔹 Fetch data dari API
  const fetchReviews = async (page: number = currentPage, items_per_page: number = itemsPerPage, sort: "Terbaru" | "Terlama" = sortBy) => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>("/public/reviews", {
        params: {
          page,
          items_per_page,
          desc: sort === "Terbaru",
        },
      });

      if (response.data.status === 200 && !response.data.error) {
        setReviews(response.data.data.data || []);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Gagal mengambil data reviews:", error);
      showErrorToast("Gagal memuat data reviews");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Hitung jumlah review per rating dari data API
  const ratingCounts = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.star === rating).length,
  }));

  const ratingText = ["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"];

  // 🔹 Format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // 🔹 Format tanggal untuk table
  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // 🔹 Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      setCurrentPage(page);
      fetchReviews(page, itemsPerPage, sortBy);
    }
  };

  // 🔹 Handler untuk perubahan items per page
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchReviews(1, newItemsPerPage, sortBy);
  };

  // 🔹 Handler untuk perubahan sorting
  const handleSortChange = (newSortBy: "Terbaru" | "Terlama") => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    fetchReviews(1, itemsPerPage, newSortBy); // Kirim nilai sortBy yang baru
  };

  // 🔹 Handler untuk filter rating
  const handleFilterRating = (rating: number) => {
    const newFilterRating = filterRating === rating ? null : rating;
    setFilterRating(newFilterRating);
    setCurrentPage(1);
    // Filter dilakukan di client side karena API tidak mendukung filter rating
  };

  // 🔹 Filter data berdasarkan rating (client side)
  const filteredReviews = filterRating ? reviews.filter((review) => review.star === filterRating) : reviews;

  // 🔹 Generate page numbers untuk pagination
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

  // Calculate display range
  const startItem = pagination.total_data === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination.total_data);

  // Fetch data pertama kali
  useEffect(() => {
    fetchReviews(1, 10, "Terbaru");
  }, []);

  return (
    <div>
      <div className="w-full max-w-3xl bg-white p-4 rounded-xl">
        {/* Filter Section */}
        <div className="flex justify-between items-center mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-300 bg-white">
                <Filter className="h-4 w-4" />
                {sortBy}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleSortChange("Terlama")}>Terlama</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("Terbaru")}>Terbaru</DropdownMenuItem>

              <DropdownMenuSeparator />

              {ratingCounts.map(({ rating, count }) => (
                <DropdownMenuItem key={rating} onClick={() => handleFilterRating(rating)} className={cn("flex items-center justify-between", filterRating === rating && "bg-gray-100")}>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={cn(i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({count})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat data reviews...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card key={review.id} className="rounded-xl cursor-pointer bg-[#F5F7FA] hover:shadow-md transition" onClick={() => setSelectedReview(review)}>
                <CardContent className="space-y-1 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{review.nama}</h3>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={18} className={cn(i < review.star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{formatShortDate(review.created_at)}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-snug mt-3">{review.comment.length > 120 ? review.comment.slice(0, 120) + "..." : review.comment}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-8">{filterRating ? "Tidak ada review dengan rating ini." : "Tidak ada review."}</p>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6 text-sm text-gray-600">
            {/* Keterangan jumlah data */}
            <div className="text-center md:text-left">
              <span className="font-medium">
                {startItem} - {endItem}
              </span>{" "}
              dari <span className="font-medium">{pagination.total_data}</span> review
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
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-600">per halaman</span>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Dialog Detail Review */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent
          className="max-w-md rounded-xl"
          style={{
            animation: "none",
            transform: "none",
          }}
        >
          {selectedReview && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-gray-700 text-base font-medium">Tanggal direview</DialogTitle>
                  <p className="text-gray-600 text-sm mr-4">{formatDate(selectedReview.created_at)}</p>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4 text-sm text-gray-700">
                {/* Nama */}
                <div className="flex">
                  <span className="font-medium w-20 flex-shrink-0">Nama</span>
                  <span className="ml-2">: {selectedReview.nama}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <span className="font-medium w-20 flex-shrink-0">Rating</span>
                  <div className="ml-2 flex items-center gap-2">
                    <span>:</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} className={cn(i < selectedReview.star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                    ))}
                    <span className="text-sm ml-1">{ratingText[selectedReview.star - 1]}</span>
                  </div>
                </div>

                {/* Ulasan */}
                <div className="flex">
                  <span className="font-medium w-20 flex-shrink-0 mt-1">Ulasan</span>
                  <div className="ml-2 flex gap-1">
                    <span>:</span>
                    <span className="text-gray-600 leading-relaxed block">{selectedReview.comment}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => setSelectedReview(null)}>
                    Kembali
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
