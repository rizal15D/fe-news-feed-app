// app/feed/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_FEED } from "@/lib/api-endpoints";
import Cookies from "js-cookie";

interface Post {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await API.get(API_FEED(1, 10)); // page 1, limit 20
      console.log("Feed response:", res);
      setPosts(res.data?.data ?? []); // sesuaikan dengan API backendmu
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchFeed();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Your Feed</h1>
        <button onClick={handleLogout} className="text-red-600 font-semibold">
          Logout
        </button>
      </div>

      {/* Posts */}
      {/* <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada postingan.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">@{post.user.username}</p>
              <p className="my-1">{post.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div> */}
    </div>
  );
}
