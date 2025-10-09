import BackButton from "@/components/layout/backbutton";
import { Button } from "@/components/ui/button";

export default function DetailProduk({ params }: { params: { id: string } }) {
  const { id } = params;

  // contoh data statis, nanti bisa fetch API/database sesuai `id`
  const produk = {
    id,
    nama: "Spandek 3.0 ⭐",
    tahap: "Tahap 4",
    kategori: "Atap",
    harga: "Rp. 35.000",
    kondisi: ["Untuk atap rumah modern", "Untuk atap gudang atau bengkel", "Untuk kanopi rumah atau atap parkir"],
    spesifikasi: ["76cm - type elite", "70cm - type span"],
    draft: ["Salam", "Tawar Produk", "Cocok Untuk"],
  };

  return (
    <div className="p-6 bg-white rounded-md">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detail Produk</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Kiri: gambar */}
        <div className="space-y-2">
          <img src="/assets/genteng.jpg" alt={produk.nama} className="rounded-md w-full" />
          <div className="flex gap-2">
            <img src="/assets/genteng.jpg" className="w-16 h-16 rounded-md border" />
            <img src="/assets/genteng.jpg" className="w-16 h-16 rounded-md border" />
          </div>
        </div>

        {/* Kanan: detail */}
        <div>
          <h3 className="text-lg font-bold">{produk.nama}</h3>
          <p>
            Tahap : <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">{produk.tahap}</span>
          </p>
          <p>
            Kategori : <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{produk.kategori}</span>
          </p>
          <p>Harga Jual : {produk.harga}</p>

          <p className="mt-2 font-medium">Kondisi Peruntukan :</p>
          <ul className="list-disc list-inside">
            {produk.kondisi.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>

          <p className="mt-2 font-medium">Spesifikasi :</p>
          <ul className="list-disc list-inside">
            {produk.spesifikasi.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <p className="mt-2 font-medium">Draft Penawaran :</p>
          <div className="flex gap-2 mt-1">
            {produk.draft.map((d, i) => (
              <Button key={i} variant="outline" size="sm" className="text-xs">
                {d}
              </Button>
            ))}
          </div>

          <BackButton />
        </div>
      </div>
      <div className="bg-red-500">
        testing
      </div>
    </div>
  );
}
