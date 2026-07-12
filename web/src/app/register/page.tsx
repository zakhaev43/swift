"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(form);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Create account</h1>

        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="Username"
          value={form.username}
          onChange={update("username")}
          required
        />
        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="Full name"
          value={form.full_name}
          onChange={update("full_name")}
          required
        />
        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={update("email")}
          required
        />
        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="Password"
          type="password"
          minLength={6}
          value={form.password}
          onChange={update("password")}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-black/60 dark:text-white/60">
          Already have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </form>
    </main>
  );
}
