"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Halaman tanpa navbar
  const hideNavbarOn = ["/login", "/register"];

  const shouldHideNavbar = hideNavbarOn.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-black text-white">
        {!shouldHideNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
