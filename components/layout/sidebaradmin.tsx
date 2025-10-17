// "use client";

// import { cn } from "@/lib/utils";
// import { BookOpen, FileText, HelpCircle, Home, Menu, Tags, User, User2 } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Dispatch, SetStateAction } from "react";

// interface SidebarProps {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
// }

// export default function SidebarAdminn({ open, setOpen }: SidebarProps) {
//   const pathname = usePathname();

//   const menus = [
//     { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
//     { name: "User", icon: User2, href: "/admin/user" },
//     { name: "Katalog Produk", icon: BookOpen, href: "/admin/katalog-produk" },
//     { name: "Kategori", icon: Tags, href: "/admin/kategori" },
//     { name: "Riwayat Sales Order", icon: FileText, href: "/admin/riwayat-sales-order" },
//     { name: "Draft Penawaran", icon: FileText, href: "/admin/draft-penawaran" },
//     { name: "FAQ", icon: HelpCircle, href: "/admin/faq" },
//     { name: "Profile Saya", icon: User, href: "/admin/profile-saya" },
//   ];

//   return (
//     <div className={cn("fixed top-0 left-0 h-screen bg-white flex flex-col transition-all duration-300 z-50 border-r border-gray-200", open ? "w-64" : "w-18")}>
//       {/* Header */}
//       <div className={cn("flex items-center justify-between border-b mx-3", open ? "px-3 py-3" : "py-3 px-3")}>
//         <button onClick={() => setOpen(!open)}>
//           <Menu className="w-6 h-7 text-[#0892D8]" />
//         </button>
//         <div className={cn("flex items-center transition-all duration-300", open ? "justify-center w-40" : "justify-center w-0 overflow-hidden")}>
//           <h1 className={cn("text-xl font-bold text-[#0892D8] transition-all duration-300 whitespace-nowrap", open ? "opacity-100 mr-5" : "opacity-0")}>Kliksales</h1>
//         </div>
//       </div>

//       {/* Menu List */}
//       <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
//         {menus.map((menu, idx) => {
//           const Icon = menu.icon;
//           const isActive = pathname === menu.href;

//           return (
//             <Link key={idx} href={menu.href} className={cn("flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-blue-50 text-[#0892D8]" : "text-gray-700 hover:bg-gray-100")}>
//               <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#0892D8]" : "text-gray-600")} />

//               {/* Text dengan behavior seperti awal - hanya opacity dan translate */}
//               <span className={cn("whitespace-nowrap transition-all duration-300", open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5")}>{menu.name}</span>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { cn } from "@/lib/utils";
import { BookOpen, FileText, HelpCircle, Home, Menu, Tags, User, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarAdminn({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  // Effect untuk membaca state sidebar dari localStorage saat komponen mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-open");
    if (savedState !== null) {
      setOpen(JSON.parse(savedState));
    }
  }, [setOpen]);

  // Effect untuk menyimpan state sidebar ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);

  const menus = [
    { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
    { name: "User", icon: User2, href: "/admin/user" },
    { name: "Katalog Produk", icon: BookOpen, href: "/admin/katalog-produk" },
    { name: "Kategori", icon: Tags, href: "/admin/kategori" },
    { name: "Riwayat Sales Order", icon: FileText, href: "/admin/riwayat-sales-order" },
    { name: "Draft Penawaran", icon: FileText, href: "/admin/draft-penawaran" },
    { name: "FAQ", icon: HelpCircle, href: "/admin/faq" },
    { name: "Profile Saya", icon: User, href: "/admin/profile-saya" },
  ];

  return (
    <div className={cn("fixed top-0 left-0 h-screen bg-white flex flex-col transition-all duration-300 z-50 ", open ? "w-64" : "w-18")}>
      {/* Header */}
      <div className={cn("flex items-center justify-between border-b mx-3", open ? "px-3 py-3" : "py-3 px-3")}>
        <button onClick={() => setOpen(!open)}>
          <Menu className="w-6 h-7 text-[#0892D8]" />
        </button>
        <div className={cn("flex items-center transition-all duration-300", open ? "justify-center w-40" : "justify-center w-0 overflow-hidden")}>
          <h1 className={cn("text-xl font-bold text-[#0892D8] transition-all duration-300 whitespace-nowrap", open ? "opacity-100 mr-5" : "opacity-0")}>Kliksales</h1>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;

          return (
            <Link key={idx} href={menu.href} className={cn("flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-blue-50 text-[#0892D8]" : "text-gray-700 hover:bg-gray-100")}>
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#0892D8]" : "text-gray-600")} />

              {/* Text dengan behavior seperti awal - hanya opacity dan translate */}
              <span className={cn("whitespace-nowrap transition-all duration-300", open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5")}>{menu.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
