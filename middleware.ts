import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// API untuk verifikasi token
const VERIFY_URL = "https://api.rusnandapurnama.com/private/admin/verify";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔹 Kalau belum login & akses halaman private → login
  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔹 Jika ada token, validasi ke API (cek expired / invalid)
  if (token) {
    try {
      const res = await fetch(VERIFY_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Kalau API balas 401 atau token invalid → redirect login
      if (!res.ok) {
        const loginUrl = new URL("/login", req.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        response.cookies.delete("role");
        return response;
      }
    } catch (err) {
      // console.error("Verifikasi token gagal:", err);
      const loginUrl = new URL("/login", req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      response.cookies.delete("role");
      return response;
    }
  }

  // 🔹 Jika sudah login tapi buka /login → redirect ke dashboard sesuai role
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

  // ✅ Aman → lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/staff/:path*", "/supervisor/:path*", "/login"],
};
