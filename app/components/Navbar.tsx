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
        <Link href="/feed" className="font-bold text-lg">
          NewsFeed
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/feed">Feed</Link>
          <Link href="/explore">Explore</Link>
          <button onClick={handleLogout} className="text-red-400">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
