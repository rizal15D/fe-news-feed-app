//middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log("Middleware - token:", token);
  const { pathname } = req.nextUrl;

  // Redirect dari "/" → "/login"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Jangan injure middleware jika client belum sempat set cookie
  if (!token && pathname.startsWith("/feed")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed/:path*", "/login", "/register"],
};
