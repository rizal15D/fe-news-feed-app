"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState("");

  const LIMIT = 10;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = useCallback(async (pageNum: number) => {
    try {
      if (pageNum > 1) setLoadingMore(true);

      const res = await API.get(API_FEED(pageNum, LIMIT));
      const data: Post[] = res.data?.posts ?? [];

      if (data.length < LIMIT) setHasMore(false);
      else setHasMore(true);

      if (pageNum === 1) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Fetch error", err);
    }

    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchFeed(1);
  }, [fetchFeed, router]);

  const handleUnfollow = async (userid: number) => {
    await API.delete(API_UNFOLLOW(userid));
    setPosts((prev) => prev.filter((p) => p.userid !== userid));
    setPage(1);
    setHasMore(true);
    fetchFeed(1);
  };

  const createPost = async () => {
    if (!content.trim()) return;
    await API.post(API_POSTS, { content });
    setContent("");
    setOpenModal(false);
    setPage(1);
    setHasMore(true);
    fetchFeed(1);
  };

  // INFINITE SCROLL — versi sukses
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    console.log("Observer setup. Sentinel =", sentinelRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("🔥 OBSERVER TRIGGERED!");
          setPage((prev) => {
            const next = prev + 1;
            fetchFeed(next);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [hasMore, loadingMore, fetchFeed]);

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      {/* Loading tetap tampil, TAPI sentinel tetap ada */}
      {loading && <p className="text-center text-gray-400 mb-10">Loading...</p>}

      <div className="max-w-xl mx-auto space-y-4">
        {!loading &&
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-700 p-4 rounded-lg bg-[#111]"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-200">
                    User #{post.userid}
                  </p>
                  <p className="text-gray-300 mt-2">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(post.createdat).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleUnfollow(post.userid)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* SENTINEL SELALU DIRENDER */}
      <div ref={sentinelRef} className="mt-40 py-32 text-center text-gray-400">
        {hasMore
          ? loadingMore
            ? "Loading more..."
            : "Scroll to load more"
          : ""}
      </div>

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-3xl flex items-center justify-center"
      >
        +
      </button>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#111] border border-gray-700 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl mb-4">Create Post</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-black border border-gray-700 text-white p-3 rounded"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                className="px-4 py-2 bg-blue-600 rounded-lg"
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
