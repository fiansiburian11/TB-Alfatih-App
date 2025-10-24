"use client";

import { apiRequest } from "@/lib/axios";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

type FAQ = {
  id: string;
  title: string;
  details: string;
  tahap_id: string;
  created_at?: string;
  updated_at?: string;
  tahap?: {
    id: string;
    title: string;
    details: string;
  };
};

type Tahap = {
  id: string;
  title: string;
  numbers?: number;
  details?: string;
  created_at?: string;
  updated_at?: string;
};

type PaginationInfo = {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
};

export default function FAQ() {
  const [selectedTahap, setSelectedTahap] = useState("1");
  const [tahapan, setTahapan] = useState<Tahap[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // State untuk pagination per tahap
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    items_per_page: 10,
    page: 1,
    max_page: 1,
    total_data: 0,
  });

  // Fetch data tahapan
  const fetchTahapan = async () => {
    try {
      const response = await apiRequest("/private/tahap");
      const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setTahapan(data);

      if (data.length > 0 && !selectedTahap) {
        setSelectedTahap(data[0].id);
      }
    } catch (error) {
      // console.error("Gagal mengambil data tahapan:", error);
      setTahapan([]);
    }
  };

  const [isTransitioning, setIsTransitioning] = useState(false);
  const fetchFaqsByTahap = async (tahapId: string, page: number = 1, smooth: boolean = false) => {
    try {
      if (smooth) {
        setIsTransitioning(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
        tahap_id: tahapId,
      });

      const response = await apiRequest(`/private/faq?${params}`);

      let data: FAQ[] = [];
      let paginationData: PaginationInfo = {
        items_per_page: 10,
        page: 1,
        max_page: 1,
        total_data: 0,
      };

      if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        paginationData = response.data.pagination;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      if (response?.data?.pagination) {
        paginationData = response.data.pagination;
      }

      setFaqs(data);
      setPagination(paginationData);
    } catch (error) {
      // console.error("❌ Gagal mengambil data FAQ:", error);
    } finally {
      if (smooth) {
        setIsTransitioning(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTahapan();
  }, []);

  // Effect untuk fetch data ketika selectedTahap berubah
  useEffect(() => {
    if (selectedTahap) {
      // Selalu reset ke halaman 1 ketika ganti tahap
      fetchFaqsByTahap(selectedTahap, 1);
    }
  }, [selectedTahap]);

  // Handler untuk ganti halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      fetchFaqsByTahap(selectedTahap, page, true);
    }
  };

  const getTahapById = (tahapId: string) => {
    return tahapan.find((tahap) => tahap.id === tahapId);
  };

  const toggleExpand = (faqId: string) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const selectedTahapData = getTahapById(selectedTahap);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p>Loading data FAQ...</p>
      </div>
    );
  }

  return (
    <div className=" bg-white rounded-lg shadow-md">
      <div className="px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Tahap List */}
          <div className="col-span-3 space-y-2">
            <div className="bg-white rounded-lg shadow-sm  overflow-hidden ">
              <div className=" bg-gray-200  p-2 *:text-black ">
                {tahapan.map((tahap) => (
                  <button
                    key={tahap.id}
                    onClick={() => {
                      setSelectedTahap(tahap.id);
                      // Reset ke halaman 1 ketika berpindah tahap
                      fetchFaqsByTahap(tahap.id, 1);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors  ${selectedTahap === tahap.id ? " font-medium text-gray-900 bg-gray-50 rounded-lg" : "text-gray-700 hover:bg-gray-50 rounded-lg"}`}
                  >
                    {tahap.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - FAQ Details */}
          <div className="col-span-9">
            <div className="bg-white ">
              {/* Tahap Header */}
              {selectedTahapData && (
                <div className="border rounded-lg px-6 py-4">
                  <div className="flex  items-start justify-between">
                    <div className="flex-1 ">
                      <h2 className="text-lg font-semibold text-gray-800 mb-1 ">{selectedTahapData.title}</h2>
                      <p className="text-sm text-gray-600">{selectedTahapData.details || "Tahap ini belum memiliki deskripsi."}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ List */}
              <div className="p-6">
                {faqs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada pertanyaan untuk tahap ini.</p>
                  </div>
                ) : (
                  <div className={`space-y-3 transition-all duration-300 ${isTransitioning ? "opacity-50 blur-[1px] pointer-events-none" : "opacity-100 blur-0"}`}>
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* View Mode Only */}
                        <div className="flex flex-col">
                          <div className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpand(faq.id)}>
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-sm text-gray-800 font-medium flex-1">{faq.title}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">{expandedFAQs.has(faq.id) ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}</div>
                          </div>
                          {expandedFAQs.has(faq.id) && (
                            <div className="px-4 pb-3 pl-4 bg-gray-50 border-t border-gray-100">
                              <p className="text-sm text-gray-600">{faq.details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls - SELALU TAMPIL jika max_page > 1 */}
                {pagination.max_page > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {faqs.length > 0
                        ? `Menampilkan ${(pagination.page - 1) * itemsPerPage + 1} - ${Math.min(pagination.page * itemsPerPage, pagination.total_data)} dari ${pagination.total_data} FAQ`
                        : `Total ${pagination.total_data} FAQ`}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                        <ChevronLeft size={16} />
                      </button>

                      <span className="text-sm text-gray-700">
                        Halaman {pagination.page} dari {pagination.max_page}
                      </span>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.max_page}
                        className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
