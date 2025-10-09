// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveRight, Plus } from "lucide-react";
import Image from "next/image";
import KatalogProduk from "./katalog-produk";

export default function DashboardStaff() {
  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-gray-900">Selamat datang, Staff Fadhil!</h1>
        </div>

        {/* Menu Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Buat Sales Order */}
          <Card className="flex flex-col justify-between h-full">
            <CardHeader>
              <CardTitle className="flex text-sm gap-1 items-center font-extralight">
                <div className="bg-[#E9F7FF] rounded-md p-1">
                  <Image src="/assets/category.png" width={20} height={20} alt="category" />
                </div>
                Buat Sales Order
              </CardTitle>
              <CardDescription className="text-xs">Tawarkan produk ke pelanggan dan Buat sales order baru</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-xs font-extralight text-white bg-[#0892D8] hover:bg-[#0892D8]/80 justify-start">
                <Plus />
                Buat SO
              </Button>
            </CardContent>
          </Card>

          {/* Total Produk Tersedia */}
          <Card className="flex flex-col justify-between h-full">
            <CardHeader>
              <CardTitle className="flex text-sm gap-1 items-center font-extralight justify-between">
                <div className="flex gap-1 items-center">
                  <div className="bg-[#E9F7FF] rounded-md p-1">
                    <Image src="/assets/category.png" width={20} height={20} alt="category" />
                  </div>
                  Total Produk Tersedia
                </div>
                <span>500</span>
              </CardTitle>
              <CardDescription>Telusuri Seluruh produk di katalog utuk ditawarkan ke pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-xs font-extralight text-black bg-[#F3F3F3] hover:bg-slate-200 flex justify-between items-center">
                Lihat Katalog Produk
                <MoveRight />
              </Button>
            </CardContent>
          </Card>

          {/*  Total SO */}
          <Card className="flex flex-col justify-between h-full">
            <CardHeader>
              <CardTitle className="flex text-sm gap-1 items-center font-extralight justify-between">
                <div className="flex gap-1 items-center">
                  <div className="bg-[#E9F7FF] rounded-md p-1">
                    <Image src="/assets/totalso.png" width={20} height={20} alt="category" />
                  </div>
                  Total SO
                </div>
                <span>1000</span>
              </CardTitle>
              <CardDescription>Catatan SO terbaru siap untuk ditinjau</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-xs font-extralight text-black bg-[#F3F3F3] hover:bg-slate-200 flex justify-between items-center ">
                Lihat Riwayat SO
                <MoveRight />
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <KatalogProduk />
        </div>
      </div>
    </div>
  );
}
