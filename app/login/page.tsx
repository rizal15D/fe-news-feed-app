"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_LOGIN } from "@/lib/api-endpoints";
import { setAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post(API_LOGIN, {
        username,
        password,
      });

      const token = res.data?.access_token;

      if (token) {
        setAuthToken(token); // <-- simpan ke cookie
        router.push("/feed");
      }
    } catch (error: any) {
      alert("Login gagal!");
    }
  };

  return (
    <div className="p-6">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="username"
          className="block border p-2 my-2"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          className="block border p-2 my-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
