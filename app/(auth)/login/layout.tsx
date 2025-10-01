export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="flex items-center justify-center min-h-screen">{children}</main>
      </body>
    </html>
  );
}
