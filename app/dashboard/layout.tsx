import Sidebar from "@/components/layout/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
