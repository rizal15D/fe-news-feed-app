import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const path = req.nextUrl.pathname;

  const isAuth = path.startsWith("/feed") || path.startsWith("/explore");
  const isNonAuth = path.startsWith("/login") || path.startsWith("/register");

  if (path === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  if (isAuth && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika sudah login tetapi masuk login/register → redirect ke feed
  if (isNonAuth && token) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed/:path*", "/explore/:path*", "/login", "/register"],
};
