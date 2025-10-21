"use client";

import SidebarSupervisor from "@/components/supervisor/sidebar-supervisor";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Sidebar */}
      <SidebarSupervisor children={children} />
    </div>
  );
}
