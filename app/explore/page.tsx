"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import {
  API_GET_USERS,
  API_FOLLOW,
  API_UNFOLLOW,
  API_GET_ME,
} from "@/lib/api-endpoints";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  followers: number;
  following: number;
  isFollowed: boolean;
}

export default function ExploreUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [myId, setMyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Get logged-in user (me)
  const fetchMe = async () => {
    try {
      const res = await API.get(API_GET_ME);
      setMyId(res.data.id);
    } catch (err) {
      console.error("Error fetching me:", err);
    }
  };

  // Get list of all users
  const fetchUsers = async () => {
    try {
      const res = await API.get(API_GET_USERS);
      const data = res.data ?? [];

      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const follow = async (userId: number) => {
    try {
      await API.post(API_FOLLOW(userId));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFollowed: true, followers: u.followers + 1 }
            : u
        )
      );
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const unfollow = async (userId: number) => {
    try {
      await API.delete(API_UNFOLLOW(userId));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                isFollowed: false,
                followers: Math.max(0, u.followers - 1),
              }
            : u
        )
      );
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchMe(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-6 max-w-xl mx-auto">Explore Users</h1>

      <div className="max-w-xl mx-auto space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-[#111] border border-gray-700 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-gray-400 text-sm">
                Followers: {user.followers} • Following: {user.following}
              </p>
            </div>

            {/* Tombol follow/unfollow TIDAK boleh tampil untuk diri sendiri */}
            {user.id === myId ? null : user.isFollowed ? (
              <button
                onClick={() => unfollow(user.id)}
                className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-500"
              >
                Unfollow
              </button>
            ) : (
              <button
                onClick={() => follow(user.id)}
                className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500"
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
