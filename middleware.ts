import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Redirect root "/" → "/login"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedPage = pathname.startsWith("/feed");

  // Sudah login tapi masuk auth page → redirect ke feed
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Belum login tapi akses feed → redirect login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // <--- penting, agar root ikut diproses middleware
    "/login",
    "/register",
    "/feed/:path*",
  ],
};
