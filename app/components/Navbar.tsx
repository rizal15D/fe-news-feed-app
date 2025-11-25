"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <nav className="bg-[#111] border-b border-gray-700 p-4 text-white">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/feed" className="font-bold text-lg">
          NewsFeed
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link href="/feed" className="hover:text-gray-300">
            Feed
          </Link>

          <Link href="/explore" className="hover:text-gray-300">
            Explore
          </Link>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
