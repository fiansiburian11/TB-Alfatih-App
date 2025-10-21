"use client";

import { cn } from "@/lib/utils";
import { BookOpen, FileText, HelpCircle, Home, Menu, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarStaff({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const menus = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Katalog Produk", icon: BookOpen, href: "/katalog-produk" },
    { name: "Riwayat Sales Order", icon: FileText, href: "/riwayat-sales-order" },
    { name: "Draft Penawaran", icon: FileText, href: "/draft-penawaran" },
    { name: "FAQ", icon: HelpCircle, href: "/faq" },
    { name: "Profile Saya", icon: User, href: "/profile-saya" },
  ];

  return (
    <div className={cn("fixed top-0 left-0 h-screen bg-white flex flex-col transition-all  z-50", open ? "w-64" : "w-18")}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b mx-3">
        <button onClick={() => setOpen(!open)}>
          <Menu className="w-6 h-7 text-[#0892D8]" />
        </button>
        {open && <h1 className="mr-12 text-xl font-bold text-[#0892D8]">Kliksales</h1>}
      </div>

      {/* Menu List */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;

          return (
            <Link key={idx} href={menu.href} className={cn("flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-blue-50 text-[#0892D8]" : "text-gray-700 hover:bg-gray-100")}>
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#0892D8]" : "text-gray-600")} />
              <span className={cn("whitespace-nowrap transition-all duration-300", open ? "opacity-100 translate-x-0 ml-2" : "opacity-0 -translate-x-5 w-0")}>{menu.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
