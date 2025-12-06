"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import {
  API_FEED,
  API_UNFOLLOW,
  API_FOLLOW,
  API_POSTS,
} from "@/lib/api-endpoints";
import Cookies from "js-cookie";

interface Post {
  id: number;
  content: string;
  createdat: string;
  userid: number;
  username?: string;
  isFollowing?: boolean; // optional (your backend should return this)
}

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const LIMIT = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState("");

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ============================================================
  // FETCH FEED
  // ============================================================
  const fetchFeed = useCallback(async (pageNum: number) => {
    try {
      if (pageNum > 1) setLoadingMore(true);

      const res = await API.get(API_FEED(pageNum, LIMIT));
      const data: Post[] = res.data?.posts || [];

      if (data.length < LIMIT) setHasMore(false);

      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error("Feed fetch error:", err);
    }

    setLoading(false);
    setLoadingMore(false);
  }, []);

  // Initial Load
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchFeed(1);
  }, [fetchFeed]);

  // ============================================================
  // FOLLOW / UNFOLLOW
  // ============================================================
  const toggleFollow = async (
    userid: number,
    currentlyFollowing: boolean | undefined
  ) => {
    try {
      if (currentlyFollowing) {
        await API.delete(API_UNFOLLOW(userid));
      } else {
        await API.post(API_FOLLOW(userid));
      }

      // Update UI instantly (no refresh needed)
      setPosts((prev) =>
        prev.map((p) =>
          p.userid === userid ? { ...p, isFollowing: !currentlyFollowing } : p
        )
      );
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
    }
  };

  // ============================================================
  // CREATE POST
  // ============================================================
  const createPost = async () => {
    if (!content.trim()) return alert("Post cannot be empty");

    try {
      await API.post(API_POSTS, { content });

      setContent("");
      setOpenModal(false);

      // Refresh feed
      setPage(1);
      setHasMore(true);
      fetchFeed(1);
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  // ============================================================
  // INFINITE SCROLL OBSERVER — ONE TIME SETUP
  // ============================================================
  useEffect(() => {
    if (observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting) {
          if (!loadingMore && hasMore) {
            const next = page + 1;
            setPage(next);
            fetchFeed(next);
          }
        }
      },
      {
        rootMargin: "0px 0px 300px 0px",
        threshold: 0,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [fetchFeed, page, hasMore, loadingMore]);

  // Ensure observer stays attached after renders
  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  });

  // ============================================================
  // UI
  // ============================================================
  if (loading) return <p className="text-center p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      {/* FEED LIST */}
      <div className="max-w-xl mx-auto space-y-4">
        {posts.length === 0 ? (
          <p className="text-gray-400 text-center">Feed kosong.</p>
        ) : (
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

                {/* FOLLOW / UNFOLLOW BUTTON */}
                <button
                  onClick={() => toggleFollow(post.userid, post.isFollowing)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    post.isFollowing
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {post.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SENTINEL FOR INFINITE SCROLL */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className=" mt-40 py-32 text-center text-gray-500 bg-red-500"
        >
          {loadingMore ? "Loading more..." : "Scroll to load more"}
        </div>
      )}

      {/* FLOATING CREATE POST BUTTON */}
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-3xl"
      >
        +
      </button>

      {/* CREATE POST MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#111] border border-gray-700 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-black border border-gray-700 p-3 rounded text-white"
              placeholder="What's happening?"
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={createPost}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
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
