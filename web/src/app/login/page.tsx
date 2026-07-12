"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Input, Label } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await loginUser({ username, password });
      saveSession(session);
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="text-sm font-semibold tracking-tight text-ink-primary">
            Swift Transfer
          </div>
          <h1 className="mt-3 text-xl font-semibold text-ink-primary">Log in</h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>

          <p className="text-center text-sm text-ink-secondary">
            No account?{" "}
            <Link href="/register" className="font-medium text-brand hover:underline">
              Register
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
