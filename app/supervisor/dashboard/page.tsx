"use client";

import AktivitasStaff from "@/components/supervisor/aktivitasstaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/axios";
import { ArrowRight, Bell, Filter, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ReviewResponse {
  status: number;
  message: string;
  data: ReviewDataWrapper;
  refrence: string | null;
  error: boolean;
}

export interface ReviewDataWrapper {
  data: Review[];
  pagination: Pagination;
}

export interface Review {
  id: string;
  ip_address: string;
  star: number;
  nama: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  items_per_page: number;
  page: number;
  max_page: number;
  total_data: number;
}

// Interface untuk response grafik
export interface GrafikResponse {
  status: number;
  message: string;
  data: {
    filter: {
      key: string;
      name: string;
    };
    interval: {
      data: Array<{
        day: string;
        total: number;
      }>;
      counts: number[];
      high_value: number;
      max_kelipatan: number;
      kelipatan: number;
    };
  };
  refrence: null;
  error: boolean;
}

export default function DashboardSupervisor() {
  const router = useRouter();

  //state so hari ini
  const [orders, setOrders] = useState<any[]>([]);
  const [totalHariIni, setTotalHariIni] = useState(0);
  const [loading, setLoading] = useState(true);

  //state name user
  const [name, setName] = useState("");

  //state total rating
  const [totalRate, setTotalRate] = useState<number>(0);

  //state produk baru
  const [productsHariIni, setProductsHariIni] = useState<number>(0);

  // State untuk data grafik
  const [grafikData, setGrafikData] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("Minggu ini");
  const [loadingGrafik, setLoadingGrafik] = useState(true);
  const [counts, setCounts] = useState<number[]>([]);

  const nameUser = async () => {
    try {
      const res = await apiRequest("/private/profile", { method: "GET" });
      setName(res.data.username);
    } catch (error) {
      throw error;
    }
  };

  const produkBaru = async () => {
    try {
      const res = await apiRequest("/private/supervisor/dashboard/total-product-process", {
        method: "GET",
      });
      setProductsHariIni(res.data.total);
    } catch (error) {
      console.error("Error fetching produk baru:", error);
      setProductsHariIni(0);
    }
  };

  const soHariIni = async () => {
    try {
      const res = await apiRequest("/private/supervisor/sales-order", { method: "GET" });
      const allOrders = res.data.data;

      // Tanggal hari ini dalam format YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      // Filter hanya data dengan created_at hari ini
      const todayOrders = allOrders.filter((order: any) => {
        const createdDate = order.created_at.split("T")[0];
        return createdDate === today;
      });

      setOrders(todayOrders);
      setTotalHariIni(todayOrders.length);
    } catch (error) {
      console.error("Gagal mengambil data sales order:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRating = async () => {
    try {
      const res = await apiRequest<ReviewResponse>("/public/reviews", { method: "GET" });
      setTotalRate(res.data.pagination.total_data);
    } catch (error) {
      throw error;
    }
  };

  // Fungsi untuk fetch data grafik
  const fetchGrafik = async () => {
    try {
      setLoadingGrafik(true);
      const res = await apiRequest<GrafikResponse>("/private/supervisor/dashboard/grafik", {
        method: "GET",
      });

      // Format data untuk chart (ubah 'day' menjadi 'name' untuk kompatibilitas)
      const formattedData = res.data.interval.data.map((item) => ({
        name: item.day,
        total: item.total,
      }));

      setCounts(res.data.interval.counts || []);
      setGrafikData(formattedData);
      setFilterName(res.data.filter.name);
    } catch (error) {
      console.error("Error fetching data grafik:", error);
      // Fallback data jika API error
      setGrafikData([
        { name: "Sen", total: 0 },
        { name: "Sel", total: 0 },
        { name: "Rab", total: 0 },
        { name: "Kam", total: 0 },
        { name: "Jum", total: 0 },
        { name: "Sab", total: 0 },
        { name: "Ming", total: 0 },
      ]);
    } finally {
      setLoadingGrafik(false);
    }
  };

  useEffect(() => {
    nameUser();
    produkBaru();
    soHariIni();
    totalRating();
    fetchGrafik(); // Panggil fungsi fetch grafik
  }, []);

  return (
    <div className="mb-8 space-y-5">
      <div className=" space-y-2">
        <h1 className="text-xl">Selamat datang {name}!</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#FFF6E5] p-1 rounded-md">
                    <Bell className="text-[#F9B919] h-5 w-5" />
                  </div>
                  Produk Baru
                </h1>
                <span className="font-semibold">{productsHariIni ?? 0}</span>
              </div>

              <p className="text-xs text-gray-600">Produk yang ditambahkan oleh admin siap untuk ditinjau</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={() => {
                  router.push("/supervisor/pengajuan-produk");
                }}
                className="flex justify-between bg-accent hover:bg-slate-200 text-black font-normal"
              >
                Tinjau Produk Baru
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#E9F7FF] p-1 rounded-md">
                    <Image src="/assets/totalso.png" alt="so" width={20} height={20} />
                  </div>
                  Sales Order Hari Ini
                </h1>
                <span className="font-semibold">{totalHariIni}</span>
              </div>

              <p className="text-xs text-gray-600">Daftar pesanan terbaru yang dibuat staff</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={() => {
                  router.push("/supervisor/riwayat-sales-order");
                }}
                className="flex justify-between bg-accent hover:bg-slate-200 text-black font-normal"
              >
                Periksa Pesanan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-white p-4 rounded-md shadow-md flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h1 className="flex text-md items-center gap-1">
                  <div className="bg-[#FFF6E5] p-1 rounded-md">
                    <Star className="text-[#F9B919] h-5 w-5" />
                  </div>
                  Total Rating
                </h1>
                <span className="font-semibold">{totalRate}</span>
              </div>

              <p className="text-xs text-gray-600">Lihat ringkasan ulasan konsumen terhadap produk</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={() => {
                  router.push("/supervisor/review-saran");
                }}
                className="flex justify-between bg-accent hover:bg-slate-200 text-black font-normal"
              >
                Lihat Ulasan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* grafik */}
      <Card className="p-4 rounded-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">Total Jumlah SO</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-1 text-gray-600 border-gray-200 shadow-none hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            {filterName}
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="h-[240px] w-full">
            {loadingGrafik ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading grafik...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={grafikData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  {/* Garis bantu */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                  {/* Gradient area biru */}
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  {/* Sumbu X dan Y dengan strip hitam */}
                  <XAxis dataKey="name" axisLine={false} tickLine={{ stroke: "#000", strokeWidth: 1 }} tick={{ fill: "#111", fontSize: 12 }} />
                  <YAxis ticks={counts.length ? counts : undefined} axisLine={false} tickLine={{ stroke: "#000", strokeWidth: 1 }} tick={{ fill: "#111", fontSize: 12 }} />

                  {/* Tooltip */}
                  <Tooltip
                    cursor={{ stroke: "#3B82F6", strokeWidth: 1, opacity: 0.2 }}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "#E5E7EB",
                      fontSize: 12,
                    }}
                  />

                  {/* Garis area */}
                  <Area type="monotone" dataKey="total" stroke="#0892D8" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* aktivitas staff */}
      <div>
        <AktivitasStaff />
      </div>
    </div>
  );
}
