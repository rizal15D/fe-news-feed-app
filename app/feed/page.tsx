"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_FEED, API_UNFOLLOW } from "@/lib/api-endpoints";
import Cookies from "js-cookie";
import Link from "next/link";

interface Post {
  id: number;
  content: string;
  createdat: string;
  userid: number;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await API.get(API_FEED(1, 10));
      const data = res.data?.posts ?? [];

      const sorted = data.sort(
        (a: Post, b: Post) =>
          new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
      );

      setPosts(sorted);
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
    setLoading(false);
  };

  const handleUnfollow = async (userid: number) => {
    try {
      await API.delete(API_UNFOLLOW(userid));
      fetchFeed();
    } catch (err) {
      console.error("Error unfollow:", err);
    }
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

  if (loading) return <p className="p-6 text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Posts */}
      <div className="max-w-xl mx-auto space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400">
            Feed kosong. Follow beberapa user dulu.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-700 rounded-lg p-4 bg-[#111] shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-200">
                    User #{post.userid}
                  </p>

                  <p className="my-2 text-gray-300">{post.content}</p>

                  <p className="text-xs text-gray-500">
                    {new Date(post.createdat).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleUnfollow(post.userid)}
                  className="text-sm px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
