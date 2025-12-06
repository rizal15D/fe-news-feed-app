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

  const [page, setPage] = useState(1);
  const LIMIT = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState("");

  // FETCH FEED
  const fetchFeed = async (pageNum: number) => {
    console.log("trace fetch page =", pageNum);
    try {
      if (pageNum > 1) setLoadingMore(true);

      const res = await API.get(API_FEED(pageNum, LIMIT));
      const data: Post[] = res.data?.posts ?? [];

      if (data.length < LIMIT) setHasMore(false);

      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  // INITIAL LOAD
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchFeed(1);
  }, []);

  // CREATE POST
  const createPost = async () => {
    if (!content.trim()) return alert("Post cannot be empty");

    try {
      await API.post(API_POSTS, { content });

      setContent("");
      setOpenModal(false);

      setPage(1);
      setHasMore(true);
      fetchFeed(1);
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  // UNFOLLOW USER
  const handleUnfollow = async (userid: number) => {
    try {
      await API.delete(API_UNFOLLOW(userid));

      setPage(1);
      setHasMore(true);
      fetchFeed(1);
    } catch (err) {
      console.error(err);
    }
  };

  // LOAD MORE BUTTON
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next);
  };

  if (loading) return <p className="text-center p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* FEED */}
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
              <p className="font-semibold text-gray-200">User #{post.userid}</p>
              <p className="my-2 text-gray-300">{post.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdat).toLocaleString()}
              </p>

              <button
                onClick={() => handleUnfollow(post.userid)}
                className="mt-3 text-sm px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg"
              >
                Unfollow
              </button>
            </div>
          ))
        )}
      </div>

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* CREATE POST FLOATING BUTTON */}
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl"
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
              className="w-full h-32 p-3 rounded bg-black border border-gray-700 text-white"
              placeholder="What's happening?"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={createPost}
                className="px-4 py-2 rounded bg-blue-600"
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
