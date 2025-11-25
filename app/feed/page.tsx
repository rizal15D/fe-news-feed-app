"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_FEED } from "@/lib/api-endpoints";
import Cookies from "js-cookie";

interface Post {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await API.get(API_FEED(page, 10));

      console.log("Feed response:", res.data);

      setPosts(res.data.posts ?? []);
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
  }, [page]);

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
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada postingan.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">UserID #{post.userid}</p>

              <p className="my-1">{post.content}</p>

              <p className="text-xs text-gray-500">
                {new Date(post.createdat).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
