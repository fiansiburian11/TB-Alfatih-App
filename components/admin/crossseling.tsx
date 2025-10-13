"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  type: string;
  name: string;
  jenis: string;
  prioritas_upselling: boolean;
  harga_jual: number;
  img_products: { path: string }[];
};

type PaginationInfo = {
  page: number;
  items_per_page: number;
  max_page: number;
  total_data: number;
};

export default function ProductList() {
  const [intiProducts, setIntiProducts] = useState<Product[]>([]);
  const [crossProducts, setCrossProducts] = useState<Product[]>([]);

  const [intiPagination, setIntiPagination] = useState<PaginationInfo>({
    page: 1,
    items_per_page: 4,
    max_page: 1,
    total_data: 0,
  });

  const [crossPagination, setCrossPagination] = useState<PaginationInfo>({
    page: 1,
    items_per_page: 10,
    max_page: 1,
    total_data: 0,
  });

  const [isLoadingInti, setIsLoadingInti] = useState(true);
  const [isLoadingCross, setIsLoadingCross] = useState(true);

  const fetchProducts = async (type: string, page: number, limit: number) => {
    try {
      const response = await api.get(`/private/product`, {
        params: { type, page, items_per_page: limit },
      });

      const data = response.data?.data?.data || [];
      const pagination = response.data?.data?.pagination || {
        page,
        items_per_page: limit,
        max_page: 1,
        total_data: data.length,
      };

      return { data, pagination };
    } catch (err) {
      console.error(`Gagal fetch produk ${type}:`, err);
      return { data: [], pagination: { page, items_per_page: limit, max_page: 1, total_data: 0 } };
    }
  };

  const loadIntiProducts = async () => {
    setIsLoadingInti(true);
    const { data, pagination } = await fetchProducts("inti", intiPagination.page, intiPagination.items_per_page);
    setIntiProducts(data);
    setIntiPagination(pagination);
    setIsLoadingInti(false);
  };

  const loadCrossProducts = async () => {
    setIsLoadingCross(true);
    const { data, pagination } = await fetchProducts("cross_selling", crossPagination.page, crossPagination.items_per_page);
    setCrossProducts(data);
    setCrossPagination(pagination);
    setIsLoadingCross(false);
  };

  useEffect(() => {
    loadIntiProducts();
    loadCrossProducts();
  }, []);

  return (
    <div className="space-y-10">
      {/* Produk Inti */}
      <section>
        <h2 className="text-xl font-bold mb-4">Produk Cross Selling</h2>
        {isLoadingInti ? (
          <p>Loading produk inti...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {intiProducts.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                {p.img_products[0] && <img src={p.img_products[0].path} alt={p.name} className="w-full h-32 object-cover mb-2 rounded" />}
                <h3 className="font-medium">
                  {p.name} {p.prioritas_upselling && <span className="text-yellow-500">⭐</span>}
                </h3>
                <p className="text-sm text-gray-600">{p.jenis}</p>
                <p className="font-semibold mt-1">Rp {p.harga_jual.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Produk Cross Selling */}
      <section>
        <h2 className="text-xl font-bold mb-4">Produk Cross Selling</h2>
        {isLoadingCross ? (
          <p>Loading cross selling...</p>
        ) : crossProducts.length === 0 ? (
          <p className="text-gray-500">Tidak ada produk cross selling.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {crossProducts.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                {p.img_products[0] ? (
                  <img src={p.img_products[0].path} alt={p.name} className="w-full h-32 object-cover mb-2 rounded" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 mb-2 rounded flex items-center justify-center text-gray-400">No Image</div>
                )}
                <h3 className="font-medium">
                  {p.name} {p.prioritas_upselling && <span className="text-yellow-500">⭐</span>}
                </h3>
                <p className="text-sm text-gray-600">{p.jenis}</p>
                <p className="font-semibold mt-1">Rp {p.harga_jual.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
