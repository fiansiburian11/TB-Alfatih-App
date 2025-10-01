export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main className="flex items-center justify-center min-h-screen">{children}</main>
    </div>
  );
}
