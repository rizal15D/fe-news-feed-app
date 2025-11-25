"use client";

import { useState, useContext } from "react";
import API from "@/lib/api";
import * as endpoint from "@/lib/api-endpoints";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username and password cannot be empty");
      return;
    }

    try {
      const res = await API.post(endpoint.API_LOGIN, { username, password });

      login(res.data.token, username);

      router.push("/feed");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid login";
      setError(msg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={submit}
        className="w-80 space-y-4 border p-6 rounded shadow"
      >
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
