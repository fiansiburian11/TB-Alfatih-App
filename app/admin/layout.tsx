"use client";

import SidebarAdmin from "@/components/admin/sidebaradmin";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Sidebar */}
      <SidebarAdmin children={children} />
    </div>
  );
}
