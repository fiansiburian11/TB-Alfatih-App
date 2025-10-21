// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// // API untuk verifikasi token
// const VERIFY_URL = "https://api.rusnandapurnama.com/private/admin/verify";

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   const role = req.cookies.get("role")?.value;
//   const { pathname } = req.nextUrl;

//   if (pathname === "/") {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // 🔹 Kalau belum login & akses halaman private → login
//   if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // 🔹 Jika ada token, validasi ke API (cek expired / invalid)
//   if (token) {
//     try {
//       const res = await fetch(VERIFY_URL, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // Kalau API balas 401 atau token invalid → redirect login
//       if (!res.ok) {
//         const loginUrl = new URL("/login", req.url);
//         const response = NextResponse.redirect(loginUrl);
//         response.cookies.delete("token");
//         response.cookies.delete("role");
//         return response;
//       }
//     } catch (err) {
//       // console.error("Verifikasi token gagal:", err);
//       const loginUrl = new URL("/login", req.url);
//       const response = NextResponse.redirect(loginUrl);
//       response.cookies.delete("token");
//       response.cookies.delete("role");
//       return response;
//     }
//   }

//   // 🔹 Jika sudah login tapi buka /login → redirect ke dashboard sesuai role
//   if (token && pathname === "/login") {
//     switch (role) {
//       case "admin":
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//       case "staff":
//         return NextResponse.redirect(new URL("/staff/dashboard", req.url));
//       case "supervisor":
//         return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
//       default:
//         return NextResponse.next();
//     }
//   }

//   // 🔒 Batasi akses antar role
//   if (role === "admin" && (pathname.startsWith("/staff") || pathname.startsWith("/supervisor"))) {
//     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   }
//   if (role === "staff" && (pathname.startsWith("/admin") || pathname.startsWith("/supervisor"))) {
//     return NextResponse.redirect(new URL("/staff/dashboard", req.url));
//   }
//   if (role === "supervisor" && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
//     return NextResponse.redirect(new URL("/supervisor/dashboard", req.url));
//   }

//   // ✅ Aman → lanjutkan
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/admin/:path*", "/staff/:path*", "/supervisor/:path*", "/login"],
// };

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
