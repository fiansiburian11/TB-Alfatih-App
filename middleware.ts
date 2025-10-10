import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  // Jika belum login dan mencoba akses halaman role apa pun → redirect ke login
  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika sudah login tapi buka /login → redirect ke dashboard sesuai role
  if (token && pathname === "/login") {
    switch (role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      case "staff":
        return NextResponse.redirect(new URL("/staff/dashboard", req.url));
      case "supervisor":
        return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
      default:
        return NextResponse.next();
    }
  }

  // 🔒 Batasi akses antar role
  if (role === "admin" && (pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (role === "staff" && (pathname.startsWith("/admin") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/staff/dashboard", req.url));
  }

  if (role === "supervisor" && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
    return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
  }

  // Kalau semua aman, lanjut request
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/supervisor/:path*", "/login"],
};
