"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Home, BookOpen, FileText, HelpCircle, User } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menus = [
    { name: "Dashboard", icon: Home, active: true },
    { name: "Katalog Produk", icon: BookOpen },
    { name: "Riwayat Sales Order", icon: FileText },
    { name: "Draft Penawaran", icon: FileText },
    { name: "FAQ", icon: HelpCircle },
    { name: "Profile Saya", icon: User },
  ];

  return (
    <div className={cn("h-screen bg-white shadow-sm flex flex-col border-r transition-all", open ? "w-64" : "w-20")}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b ml-2">
        <button onClick={() => setOpen(!open)}>
          <Menu className="w-6 h-6 text-[#0892D8]" />
        </button>
        {open && <h1 className="text-xl font-bold text-[#0892D8]">Kliksales</h1>}
      </div>

      {/* Menu List */}
      <div className="flex-1 px-3 py-4 space-y-2">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          return (
            <button key={idx} className={cn("flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium", menu.active ? "bg-blue-50 text-[#0892D8]" : "text-gray-700 hover:bg-gray-100")}>
              <Icon className={cn("w-5 h-5", menu.active ? "text-[#0892D8]" : "text-gray-600")} />
              {open && <span>{menu.name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
