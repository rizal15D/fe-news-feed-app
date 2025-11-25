"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { API_REGISTER } from "@/lib/api-endpoints";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post(API_REGISTER, {
        username,
        password,
      });

      alert("Registrasi berhasil! Silakan login.");
      router.push("/login"); // <-- LANGSUNG KE LOGIN
    } catch (error) {
      alert("Register gagal! Username mungkin sudah dipakai.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="w-80 p-6 border rounded-lg shadow"
      >
        <h1 className="text-xl font-semibold mb-4 text-center">Register</h1>

        <input
          placeholder="Username"
          className="w-full border p-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="relative mb-3">
          <input
            placeholder="Password"
            type={showPw ? "text" : "password"}
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-sm"
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>

        <p className="text-center mt-3 text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
