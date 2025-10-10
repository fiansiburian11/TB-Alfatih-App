import { useState } from "react";
import Sidebar from "../layout/sidebarstaff";
import Topbar from "./topbarstaff";

export default function SidebarStaff({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  const sidebarWidth = open ? "w-64" : "w-18";
  const contentMargin = open ? "ml-64" : "ml-18";
  return (
    <div>
      {/* sidebar */}
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 ${sidebarWidth}`}>
        <Sidebar open={open} setOpen={setOpen} />
      </div>

      {/* content */}
      <div className={`transition-all  ${contentMargin}`}>
        <Topbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
