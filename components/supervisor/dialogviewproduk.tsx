"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

// Interface untuk Produk (sesuai dengan struktur API)
interface Product {
  id: string;
  type: string;
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  kondisi_peruntukan: string;
  spesifikasi: string;
  kategori_id: string;
  ditolak: boolean;
  diproses: boolean;
  diterima: boolean;
  created_at: string;
  updated_at: string;
  img_products: {
    id: string;
    product_id: string;
    path: string;
    created_at: string;
    updated_at: string;
  }[];
  cross_selling_inti: {
    id: string;
    product_inti_id: string;
    product_cross_selling_id: string;
    created_at: string;
    updated_at: string;
    product_cross_selling: {
      id: string;
      type: string;
      name: string;
      jenis: string;
      prioritas_upselling: boolean;
      harga_jual: number;
      kondisi_peruntukan: string;
      spesifikasi: string;
      kategori_id: string;
      ditolak: boolean;
      diproses: boolean;
      diterima: boolean;
      created_at: string;
      updated_at: string;
      img_products: {
        id: string;
        product_id: string;
        path: string;
        created_at: string;
        updated_at: string;
      }[];
      kategori: {
        id: string;
        name: string;
        tahap: {
          id: string;
          numbers: number;
          title: string;
          details: string;
        };
      };
    };
  }[];
  kategori: {
    id: string;
    name: string;
    tahap: {
      id: string;
      numbers: number;
      title: string;
      details: string;
    };
  };
  draft_penawaran: {
    id: string;
    product_id: string;
    judul: string;
    chat: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface DialogViewProdukProps {
  product: Product;
}

export default function DialogViewProduk({ product }: DialogViewProdukProps) {
  const [open, setOpen] = useState(false);
  const [expandedCrossSelling, setExpandedCrossSelling] = useState(false);

  // Format currency
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-[#0892D8] hover:bg-[#0892D8]/90 text-white" onClick={(e) => e.stopPropagation()}>
          <Eye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold border-b pb-1">Detail Produk yang diajukan</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-4">
            {/* Nama Produk */}
            <div>
              <label className="block text-sm text-black mb-1">Nama Produk</label>
              <div className="p-1 px-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-900">{product.name}</span>
              </div>
            </div>

            {/* Jenis Produk */}
            <div>
              <label className="block text-sm text-black mb-1">Jenis Produk</label>
              <div className="px-2 p-1 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-900">{product.jenis || "Spandek 3.0"}</span>
              </div>
            </div>

            {/* Kategori Produk */}
            <div>
              <label className="block text-sm text-black mb-1">Kategori Produk</label>
              <div className="px-2 p-1 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-900">{product.kategori?.name || "Atap"}</span>
              </div>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-sm text-black mb-1">Prioritas</label>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full relative transition-colors ${product.prioritas_upselling ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${product.prioritas_upselling ? "translate-x-4" : "translate-x-0.4"}`} />
                </div>
              </div>
            </div>

            {/* Tahap */}
            <div>
              <label className="block text-sm text-black mb-1">Tahap</label>
              <div className="px-2 p-1 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-900">{product.kategori?.tahap ? `Tahap ${product.kategori.tahap.numbers} : ${product.kategori.tahap.title}` : "Tahap 1 : Pondasi"}</span>
              </div>
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-sm text-black mb-1">Harga Jual</label>
              <div className="px-2 p-1 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-900">{formatRupiah(product.harga_jual)}</span>
              </div>
            </div>

            {/* Foto Produk */}
            <div>
              <label className="block text-sm text-black mb-1">Foto Produk</label>

              {product.img_products && product.img_products.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {product.img_products.slice(0, 3).map((img, index) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={`https://api.rusnandapurnama.com${img.path}`}
                        alt={`${product.jenis} - Gambar ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/placeholder-product.png";
                        }}
                      />
                    </div>
                  ))}
                  {product.img_products.length === 0 && (
                    <div className="col-span-3 flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 text-gray-300">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-400">Upload Foto</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 text-gray-300">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400">Upload Foto</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Kondisi Peruntukan */}
              <div>
                <Label className="text-sm text-black mb-1 block">Kondisi Peruntukan</Label>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{product.kondisi_peruntukan?.trim() || "-"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Spesifikasi */}
              <div>
                <Label className="text-sm text-black mb-1 block">Spesifikasi</Label>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{product.spesifikasi?.trim() || "-"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Produk Cross Selling */}
            <div>
              <label className="block text-sm text-black mb-1">Produk Cross Selling</label>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCrossSelling(!expandedCrossSelling)}>
                <span className="text-sm text-gray-900">{product.cross_selling_inti && product.cross_selling_inti.length > 0 ? product.cross_selling_inti.map((cs) => cs.product_cross_selling.name).join(", ") : "Palu, Paku, pepan"}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedCrossSelling ? "rotate-180" : ""}`} />
              </div>

              {expandedCrossSelling && product.cross_selling_inti && product.cross_selling_inti.length > 0 && (
                <div className="mt-2 space-y-2">
                  {product.cross_selling_inti.map((crossSelling) => (
                    <div key={crossSelling.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center gap-3">
                        {crossSelling.product_cross_selling.img_products?.[0] && (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                            <Image
                              src={`https://api.rusnandapurnama.com${crossSelling.product_cross_selling.img_products[0].path}`}
                              alt={crossSelling.product_cross_selling.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/assets/placeholder-product.png";
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{crossSelling.product_cross_selling.name}</h4>
                          <p className="text-xs text-gray-500">{crossSelling.product_cross_selling.jenis}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatRupiah(crossSelling.product_cross_selling.harga_jual)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="pr-3 pb-3 bg-white flex justify-end">
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Kembali
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
