// "use client";
// import FilterSearch from "@/components/layout/filter-search";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Files } from "lucide-react";
// import { useRouter } from "next/router";

// export default function KatalogProduk() {
//   const router = useRouter();

//   // Data untuk produk Barang Inti
//   const barangInti = [
//     {
//       id: 1,
//       nama: "Atap Spandek 3.0 ⭐",
//       deskripsi: "Untuk atap rumah modern, untuk atap gudang atau bengkel, untuk kanopi atau atap parkir",
//       harga: "Rp. 35.000",
//     },
//     {
//       id: 2,
//       nama: "Atap Spandek 3.0 ⭐",
//       deskripsi: "Untuk atap rumah modern, untuk atap gudang atau bengkel, untuk kanopi atau atap parkir",
//       harga: "Rp. 35.000",
//     },
//     {
//       id: 3,
//       nama: "Atap Spandek 3.0 ⭐",
//       deskripsi: "Untuk atap rumah modern, untuk atap gudang atau bengkel, untuk kanopi atau atap parkir",
//       harga: "Rp. 35.000",
//     },
//   ];

//   return (
//     <div className="mb-8 space-y-8">
//       <FilterSearch />
//       {/* Barang Inti */}
//       <Card className="mb-8">
//         <CardHeader className="-mt-3 px-3 ">
//           <CardTitle>
//             <Button variant="outline" className="items-center border-[#E9F7FF] ">
//               <span className="text-sm">Barang Inti</span>
//             </Button>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0 -mt-4">
//           <div className="overflow-x-auto ">
//             <table className="w-full ">
//               <thead>
//                 <tr className="border-b bg-[#E9F7FF]  ">
//                   <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
//                   <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
//                   <th className="text-center font-normal py-3 px-4">Harga Jual</th>
//                   <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {barangInti.map((item, index) => (
//                   <tr key={index} onClick={() => router.push(`/katalog-produk/${item.id}`)} className={index === barangInti.length - 1 ? "" : "border-b"}>
//                     <td className="py-3 px-4 font-medium flex flex-col gap-1">
//                       {item.nama}
//                       <span className="flex gap-3 ">
//                         <Button className="items-center text-xs font-extralight bg-[#FFF8E0] text-[#FEB941]  rounded-[4px] p-1 h-fit ">Tahap 4</Button>
//                         <Button className="items-center text-xs font-extralight  rounded-[4px] text-[#0892D8] bg-[#E9F7FF] p-1 h-fit">Atap</Button>
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <ul className="list-disc list-inside space-y-1 text-sm">
//                         {item.deskripsi.split(",").map((desc, i) => (
//                           <p key={i}>{desc.trim()}</p>
//                         ))}
//                       </ul>
//                     </td>

//                     <td className="py-3 px-4">{item.harga}</td>
//                     <td className="py-3 px-4">
//                       <div className="flex flex-col gap-1 text-[#0892D8]">
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Salam
//                         </Button>
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Tawar Produk
//                         </Button>
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Cocok Untuk
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* cross selling */}
//       <Card className="mb-8">
//         <CardHeader className="-mt-3 px-3 ">
//           <CardTitle>
//             <Button variant="outline" className="items-center border-[#E9F7FF]">
//               <span className="text-sm">Cross Selling</span>
//             </Button>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0 -mt-4">
//           <div className="overflow-x-auto ">
//             <table className="w-full ">
//               <thead>
//                 <tr className="border-b bg-[#E9F7FF]  ">
//                   <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
//                   <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
//                   <th className="text-center font-normal py-3 px-4">Harga Jual</th>
//                   <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {barangInti.map((item, index) => (
//                   <tr key={index} className={index === barangInti.length - 1 ? "" : "border-b"}>
//                     <td className="py-3 px-4 font-medium flex flex-col gap-1">
//                       {item.nama}
//                       <span className="flex gap-3 ">
//                         <Button className="items-center text-xs font-extralight bg-[#FFF8E0] text-[#FEB941]  rounded-[4px] p-1 h-fit ">Tahap 4</Button>
//                         <Button className="items-center text-xs font-extralight  rounded-[4px] text-[#0892D8] bg-[#E9F7FF] p-1 h-fit">Atap</Button>
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <ul className="list-disc list-inside space-y-1 text-sm">
//                         {item.deskripsi.split(",").map((desc, i) => (
//                           <p key={i}>{desc.trim()}</p>
//                         ))}
//                       </ul>
//                     </td>

//                     <td className="py-3 px-4">{item.harga}</td>
//                     <td className="py-3 px-4">
//                       <div className="flex flex-col gap-1 text-[#0892D8]">
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Salam
//                         </Button>
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Tawar Produk
//                         </Button>
//                         <Button variant="outline" className="items-center text-xs font-extralight border-[#0892D8] rounded-[4px] w-fit">
//                           <Files />
//                           Cocok Untuk
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import FilterSearch from "@/components/layout/filter-search";
import DraftPenawaran from "@/components/layout/tooltip-salin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function KatalogProduk() {
  const router = useRouter();

  // Data untuk produk Barang Inti
  const barangInti = [
    {
      id: 1,
      nama: "Atap Spandek 3.0 ⭐",
      deskripsi: "Untuk atap rumah modern, untuk atap gudang atau bengkel, untuk kanopi atau atap parkir",
      harga: "Rp. 35.000",
    },
    {
      id: 2,
      nama: "Atap Spandek 3.0 ⭐",
      deskripsi: "Untuk atap rumah modern, untuk atap gudang atau bengkel, untuk kanopi atau atap parkir",
      harga: "Rp. 35.000",
    },
  ];

  return (
    <div className="mb-8 space-y-8">
      <FilterSearch />
      <Card className="mb-8">
        <CardHeader className="-mt-3 px-3 ">
          <CardTitle>
            <Button variant="outline" className="items-center border-[#E9F7FF] ">
              <span className="text-sm">Barang Inti</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 -mt-4">
          <div className="overflow-x-auto ">
            <table className="w-full ">
              <thead>
                <tr className="border-b bg-[#E9F7FF]">
                  <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
                  <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
                  <th className="text-center font-normal py-3 px-4">Harga Jual</th>
                  <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                </tr>
              </thead>
              <tbody>
                {barangInti.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/katalog-produk/${item.id}`)} // 👈 klik menuju detail
                    className={`cursor-pointer hover:bg-gray-50 ${index === barangInti.length - 1 ? "" : "border-b"}`}
                  >
                    <td className="py-3 px-4 font-medium">{item.nama}</td>
                    <td className="py-3 px-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {item.deskripsi.split(",").map((desc, i) => (
                          <p key={i}>{desc.trim()}</p>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4">{item.harga}</td>
                    <td className="py-3 px-4">
                      {/* <DraftPenawaran /> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="-mt-3 px-3 ">
          <CardTitle>
            <Button variant="outline" className="items-center border-[#E9F7FF] ">
              <span className="text-sm">Cross Selling</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 -mt-4">
          <div className="overflow-x-auto ">
            <table className="w-full ">
              <thead>
                <tr className="border-b bg-[#E9F7FF]">
                  <th className="text-center font-normal py-5 px-4">Jenis Produk</th>
                  <th className="text-center font-normal py-3 px-4">Kondisi Peruntukan</th>
                  <th className="text-center font-normal py-3 px-4">Harga Jual</th>
                  <th className="text-center font-normal py-3 px-4">Draft Penawaran</th>
                </tr>
              </thead>
              <tbody>
                {barangInti.map((item, index) => (
                  <tr key={item.id} onClick={() => router.push(`/katalog-produk/${item.id}`)} className={`cursor-pointer hover:bg-gray-50 ${index === barangInti.length - 1 ? "" : "border-b"}`}>
                    <td className="py-3 px-4 font-medium">{item.nama}</td>
                    <td className="py-3 px-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {item.deskripsi.split(",").map((desc, i) => (
                          <p key={i}>{desc.trim()}</p>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4">{item.harga}</td>
                    <td className="py-3 px-4 ">
                      {/* <DraftPenawaran /> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
