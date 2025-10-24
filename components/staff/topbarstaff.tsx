// components/ui/topbar.tsx
"use client";

import Cookies from "js-cookie";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { showSuccessToast } from "../layout/snackbar";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Mapping judul sesuai path
  const titles: Record<string, string> = {
    "/staff/dashboard": "Dashboard",
    "/staff/katalog-produk": "Katalog Produk",
    "/staff/riwayat-sales-order": "Riwayat Pesanan",
    "/staff/draft-penawaran": "Draft Penawaran",
    "/staff/faq": "FAQ",
    "/staff/profile-saya": "Profile Saya",
    "/staff/user": "User",
  };

  const title = titles[pathname] || "Kliksales";

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });

    showSuccessToast("Logout Berhasil");

    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between  bg-white px-4">
      {/* Kiri - judul halaman */}
      <h1 className="text-lg font-semibold">{title}</h1>

      {/* Kanan - tombol logout */}
      <button onClick={handleLogout} className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium text-white bg-[#0892D8]">
        <LogOut className="h-4 w-4" />
        Keluar
      </button>
    </header>
  );
}
