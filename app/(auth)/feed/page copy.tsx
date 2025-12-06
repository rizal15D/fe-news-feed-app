"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import API from "@/lib/api";
import { API_FEED, API_UNFOLLOW, API_POSTS } from "@/lib/api-endpoints";

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

  // pagination state
  const [page, setPage] = useState(1); // current page as we know it
  const pageRef = useRef<number>(1); // ref to read the latest page inside observer
  const LIMIT = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // helper: merge new posts avoiding duplicates and sort by createdat desc
  const mergePosts = useCallback((existing: Post[], incoming: Post[]) => {
    const existingIds = new Set(existing.map((p) => p.id));
    const filtered = incoming.filter((p) => !existingIds.has(p.id));
    const merged = [...existing, ...filtered];

    // sort newest first
    merged.sort(
      (a, b) =>
        new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
    );

    return merged;
  }, []);

  // fetch feed page
  const fetchFeed = useCallback(
    async (pageNum: number) => {
      try {
        if (pageNum > 1) setLoadingMore(true);
        else setLoading(true);

        console.log(`Fetching feed page ${pageNum}...`);
        const res = await API.get(API_FEED(pageNum, LIMIT));

        // backend format assumption: { page: N, posts: [...] }
        const serverPage: number = res.data?.page ?? pageNum;
        const data: Post[] = res.data?.posts ?? [];

        console.log(
          "fetch result page:",
          serverPage,
          "items:",
          data.length,
          data
        );

        // determine hasMore: if returned items < LIMIT => no more
        const more = data.length >= LIMIT;
        setHasMore(more);

        if (pageNum === 1) {
          // replace
          setPosts(() =>
            [...data].sort(
              (a, b) =>
                new Date(b.createdat).getTime() -
                new Date(a.createdat).getTime()
            )
          );
        } else {
          // append without duplicates
          setPosts((prev) => mergePosts(prev, data));
        }

        // sync page state with server-provided page for safety
        setPage(serverPage);
        pageRef.current = serverPage;
      } catch (err) {
        console.error("Fetch feed error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [mergePosts]
  );

  // initial load
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // reset state and fetch page 1
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    fetchFeed(1);
  }, [router, fetchFeed]);

  // load next page helper (guarded)
  const loadNext = useCallback(() => {
    if (loadingMore || !hasMore) {
      console.log(
        "loadNext skipped. loadingMore:",
        loadingMore,
        "hasMore:",
        hasMore
      );
      return;
    }
    const nextPage = pageRef.current + 1;
    console.log("Requesting next page:", nextPage);
    // optimistic set (page will be synced by fetch result)
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchFeed(nextPage);
  }, [fetchFeed, hasMore, loadingMore]);

  // stable intersection observer: observe sentinel — observer NOT recreated on page changes
  useEffect(() => {
    if (!loadMoreRef.current) {
      // if sentinel not mounted yet, nothing to observe
      return;
    }

    // do not observe if no more data
    if (!hasMore) {
      console.log("No more pages to load, observer not attached.");
      return;
    }

    const sentinel = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // debug
        // console.log("Observer entries:", entries);
        if (first && first.isIntersecting) {
          console.log("Sentinel intersecting -> loadNext()");
          loadNext();
        }
      },
      {
        root: null, // viewport
        rootMargin: "300px", // trigger earlier for smoother UX
        threshold: 0, // fire when any part intersects
      }
    );

    observer.observe(sentinel);
    console.log("Observer attached to sentinel:", sentinel);

    return () => {
      observer.unobserve(sentinel);
      console.log("Observer detached.");
    };
    // intentionally not depending on page or loadingMore (we use guards inside loadNext)
    // only re-run when hasMore changes (we should detach if no more)
  }, [hasMore, loadNext]);

  // unfollow -> refresh from page 1
  const handleUnfollow = async (userid: number) => {
    try {
      await API.delete(API_UNFOLLOW(userid));
      // refresh feed from page 1
      setPage(1);
      pageRef.current = 1;
      setHasMore(true);
      fetchFeed(1);
    } catch (err) {
      console.error("Error unfollow:", err);
    }
  };

  // create post -> refresh page 1
  const createPost = async (content: string) => {
    if (!content.trim()) return alert("Post cannot be empty");
    try {
      await API.post(API_POSTS, { content });
      // refresh feed from page 1
      setPage(1);
      pageRef.current = 1;
      setHasMore(true);
      fetchFeed(1);
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post");
    }
  };

  if (loading) return <p className="p-6 text-center text-white">Loading...</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-xl mx-auto pt-4 px-4 space-y-4">
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

      {/* Sentinel placed outside the centered container so it can enter viewport properly */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="w-full py-6 text-center text-gray-400"
        >
          {loadingMore ? "Loading more..." : "Scroll to load more"}
        </div>
      )}

      {/* Floating create button (example) */}
      <button
        onClick={() => {
          const sample = prompt("Type post content:");
          if (sample !== null) createPost(sample);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white text-3xl shadow-xl"
        aria-label="Create post"
      >
        +
      </button>
    </div>
  );
}
