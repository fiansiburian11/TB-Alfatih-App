"use client";

import SidebarStaff from "@/components/staff/sidebar-staff";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Sidebar */}
      <SidebarStaff children={children} />
    </div>
  );
}
