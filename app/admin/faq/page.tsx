"use client";

import DialogTambahFAQ from "@/components/admin/dialogfaq";
import { showErrorToast, showSuccessToast } from "@/components/layout/snackbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/axios";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pencil, Save, Trash2, X } from "lucide-react";
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

export default function FAQManagement() {
  const [selectedTahap, setSelectedTahap] = useState("1");
  const [tahapan, setTahapan] = useState<Tahap[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    details: "",
    tahap_id: "",
  });
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

  // State untuk delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle ketika FAQ baru ditambahkan
  const handleFAQAdded = (tahap_id: string) => {
    console.log("✅ FAQ baru ditambahkan untuk tahap:", tahap_id);

    // Pindah ke tahap yang sesuai dan reset ke halaman 1
    setSelectedTahap(tahap_id);

    // Refresh data - selalu di halaman 1 agar FAQ baru langsung terlihat
    setTimeout(() => {
      fetchFaqsByTahap(tahap_id, 1);
    }, 100);
  };

  // Handler untuk ganti halaman
  // const handlePageChange = (page: number) => {
  //   if (page >= 1 && page <= pagination.max_page) {
  //     fetchFaqsByTahap(selectedTahap, page);
  //   }
  // };
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.max_page) {
      fetchFaqsByTahap(selectedTahap, page, true); // ✅ smooth true
    }
  };

  // Handler untuk delete FAQ
  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;

    setIsDeleting(true);
    try {
      await apiRequest("/private/admin/faq", {
        method: "DELETE",
        data: {
          id: faqToDelete.id,
        },
      });

      showSuccessToast("FAQ berhasil dihapus!");

      // Refresh data setelah delete
      fetchFaqsByTahap(selectedTahap, pagination.page);

      setIsDeleteDialogOpen(false);
      setFaqToDelete(null);
    } catch (error: any) {
      // console.error("Gagal menghapus FAQ:", error);
      showErrorToast(`Gagal menghapus FAQ: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setFaqToDelete(null);
  };

  const getTahapById = (tahapId: string) => {
    return tahapan.find((tahap) => tahap.id === tahapId);
  };

  const startEdit = (faq: FAQ) => {
    setEditingFAQ(faq.id);
    setEditForm({
      title: faq.title,
      details: faq.details,
      tahap_id: faq.tahap_id,
    });
  };

  const cancelEdit = () => {
    setEditingFAQ(null);
    setEditForm({
      title: "",
      details: "",
      tahap_id: "",
    });
  };

  const saveEdit = async (faqId: string) => {
    if (!editForm.title.trim() || !editForm.details.trim() || !editForm.tahap_id) {
      showErrorToast("Judul, keterangan, dan tahap harus diisi");
      return;
    }

    try {
      const updateData: any = {
        id: faqId,
        title: editForm.title.trim(),
        details: editForm.details.trim(),
      };

      if (editForm.tahap_id) {
        updateData.tahap_id = editForm.tahap_id;
      }

      await apiRequest("/private/admin/faq", {
        method: "PUT",
        data: updateData,
      });

      showSuccessToast("FAQ berhasil diupdate!");

      // Refresh data setelah edit
      fetchFaqsByTahap(selectedTahap, pagination.page);

      setEditingFAQ(null);
      setEditForm({
        title: "",
        details: "",
        tahap_id: "",
      });

      // Jika tahap berubah, pindah ke tahap baru
      if (editForm.tahap_id !== selectedTahap) {
        setSelectedTahap(editForm.tahap_id);
      }
    } catch (error: any) {
      // console.error("Gagal mengupdate FAQ:", error);
      showErrorToast(`Gagal mengupdate FAQ: ${error.response?.data?.message || error.message}`);
    }
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
            {/* <div className=" text-white px-4 py-3 w-full  "> */}
            <DialogTambahFAQ onFAQAdded={handleFAQAdded} />
            {/* </div> */}
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
                        {editingFAQ === faq.id ? (
                          // Edit Mode
                          <div className="p-4 space-y-3 bg-white">
                            {/* Judul FAQ */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Judul FAQ</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Judul FAQ"
                              />
                            </div>

                            {/* Keterangan FAQ */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan FAQ</label>
                              <textarea
                                value={editForm.details}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, details: e.target.value }))}
                                placeholder="Keterangan FAQ"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                }}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button onClick={cancelEdit} className="px-3 py-1.5 text-sm border  bg-[#DD3737] rounded-md hover:bg-[#DD3737]/90 text-white flex items-center gap-1">
                                <X size={14} />
                                Batal
                              </button>
                              <button onClick={() => saveEdit(faq.id)} className="px-3 py-1.5 text-sm bg-[#0892D8] text-white rounded-md hover:bg-[#0892D8]/80 flex items-center gap-1">
                                <Save size={14} />
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex flex-col">
                            <div className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpand(faq.id)}>
                              <div className="flex items-start gap-3 flex-1">
                                <span className="text-sm text-gray-800 font-medium flex-1">{faq.title}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(faq);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(faq);
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                                {expandedFAQs.has(faq.id) ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                              </div>
                            </div>
                            {expandedFAQs.has(faq.id) && (
                              <div className="px-4 pb-3 pl-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-sm text-gray-600">{faq.details}</p>
                              </div>
                            )}
                          </div>
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-800">Hapus FAQ</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              Apakah Anda yakin ingin menghapus FAQ ini?
              {faqToDelete && <span className="block font-medium mt-2 text-gray-800">"{faqToDelete.title}"</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting} className="border border-gray-300 hover:bg-gray-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
