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
        setAuthToken(token); // simpan ke cookie
        router.push("/feed");
      }
    } catch (error) {
      alert("Login gagal! Pastikan username/password benar.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-80 p-6 border rounded-lg shadow"
      >
        <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>

        <input
          placeholder="Username"
          className="w-full border p-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full border p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>

        <p className="text-center mt-3 text-sm">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
