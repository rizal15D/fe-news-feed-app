"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_FEED, API_UNFOLLOW, API_POSTS } from "@/lib/api-endpoints";
import Cookies from "js-cookie";

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

  // Modal Create Post
  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const fetchFeed = async (newPage = 1) => {
    try {
      const res = await API.get(API_FEED(newPage, LIMIT));
      const data: Post[] = res.data?.posts ?? [];

      // kalau tidak ada data, berarti sudah habis
      if (data.length < LIMIT) setHasMore(false);

      // jika newPage = 1 → refresh
      if (newPage === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const handleUnfollow = async (userid: number) => {
    try {
      await API.delete(API_UNFOLLOW(userid));
      fetchFeed();
    } catch (err) {
      console.error("Error unfollow:", err);
    }
  };

  const createPost = async () => {
    if (!content.trim()) return alert("Post cannot be empty");

    try {
      await API.post(API_POSTS, { content });

      setContent("");
      setOpenModal(false);
      fetchFeed(); // refresh
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post");
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchFeed(1);
  }, []);

  if (loading) return <p className="p-6 text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      {/* Feed List */}
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

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            Load more
          </button>
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white text-3xl shadow-xl"
      >
        +
      </button>

      {/* Modal Create Post */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-gray-700 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 p-3 rounded bg-black border border-gray-700 text-white outline-none"
              placeholder="What's happening?"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={createPost}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
