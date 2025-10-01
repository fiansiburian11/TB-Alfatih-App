import Sidebar from "@/components/layout/sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
