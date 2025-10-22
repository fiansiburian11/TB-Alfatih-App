
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// URL verifikasi berdasarkan role
const VERIFY_URLS: Record<string, string> = {
  admin: "https://api.rusnandapurnama.com/private/admin/verify",
  staff: "https://api.rusnandapurnama.com/private/staff/verify",
  supervisor: "https://api.rusnandapurnama.com/private/supervisor/verify",
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  // 🔸 1. Arahkan "/" ke "/login"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔸 2. Jika belum login tapi akses halaman private → redirect ke login
  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔸 3. Jika ada token → verifikasi ke endpoint berdasarkan role
  if (token && role && VERIFY_URLS[role]) {
    try {
      const res = await fetch(VERIFY_URLS[role], {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Kalau token invalid → hapus cookie & redirect login
      if (!res.ok) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("token");
        response.cookies.delete("role");
        return response;
      }
    } catch (err) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      response.cookies.delete("role");
      return response;
    }
  }

  // 🔸 4. Kalau sudah login dan buka /login → redirect sesuai role
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

  // 🔸 5. Batasi akses antar role (cross-access protection)
  if (role === "admin" && (pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  if (role === "staff" && (pathname.startsWith("/admin") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/staff/dashboard", req.url));
  }
  if (role === "supervisor" && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
    return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
  }

  // ✅ Lanjutkan request kalau semua aman
  return NextResponse.next();
}

// 🔹 Middleware aktif di semua path penting
export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/staff/:path*", "/supervisor/:path*"],
};
