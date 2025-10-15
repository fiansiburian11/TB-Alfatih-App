"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function DetailProduk() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Detail Produk</h2>
        <Button className="bg-red-500 hover:bg-red-600 text-white px-5">Kembali</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gambar utama */}
        <div>
          <div className="relative w-full h-[320px] rounded-lg overflow-hidden border">
            <Image
              src="/spandek-merah.jpg" // ganti dengan path gambar utama kamu
              alt="Spandek 3.0"
              fill
              className="object-cover"
            />
            <button className="absolute inset-x-0 bottom-4 mx-auto bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-md hover:bg-green-600 transition">
              <span className="flex items-center gap-2">
                <Image src="/whatsapp-icon.svg" alt="WA" width={16} height={16} />
                Salin Gambar
              </span>
            </button>
          </div>

          {/* Thumbnail */}
          <div className="flex gap-3 mt-4">
            {["/spandek-merah.jpg", "/spandek-biru.jpg", "/spandek-hitam.jpg", "/spandek-gelap.jpg"].map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80">
                <Image src={src} alt="thumbnail" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Detail produk */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Spandek 3.0</h3>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>

          <div className="space-y-1">
            <p>
              <span className="font-medium text-gray-600">Nama Barang</span> : Atap
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium text-gray-600">Tahap</span> :<Badge className="bg-yellow-100 text-yellow-700 font-medium rounded-md">Tahap 4</Badge>
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium text-gray-600">Kategori</span> :<Badge className="bg-blue-100 text-blue-700 font-medium rounded-md">Atap</Badge>
            </p>
            <p>
              <span className="font-medium text-gray-600">Harga Jual</span> : Rp 35.000
            </p>

            <div>
              <span className="font-medium text-gray-600">Kondisi Peruntukan</span> :
              <ul className="list-disc ml-6 mt-1">
                <li>Untuk atap rumah modern</li>
                <li>Untuk atap gudang atau bengkel</li>
                <li>Untuk kanopi rumah atau atap parkir</li>
              </ul>
            </div>

            <div>
              <span className="font-medium text-gray-600">Spesifikasi</span> :
              <ul className="list-disc ml-6 mt-1">
                <li>76cm - type elite</li>
                <li>70cm - type span</li>
              </ul>
            </div>

            <div>
              <span className="font-medium text-gray-600">Draft Penawaran</span> :
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="text-xs border-blue-400 text-blue-600 hover:bg-blue-50">
                  Salam
                </Button>
                <Button variant="outline" className="text-xs border-blue-400 text-blue-600 hover:bg-blue-50">
                  Tawar Produk
                </Button>
                <Button variant="outline" className="text-xs border-blue-400 text-blue-600 hover:bg-blue-50">
                  Cocok Untuk
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
