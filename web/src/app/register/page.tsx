"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Input, Label } from "@/components/ui/Field";

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
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="text-sm font-semibold tracking-tight text-ink-primary">
            Swift Transfer
          </div>
          <h1 className="mt-3 text-xl font-semibold text-ink-primary">Create account</h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={update("username")} required autoFocus />
          </div>
          <div>
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={update("full_name")} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              minLength={6}
              value={form.password}
              onChange={update("password")}
              required
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Creating…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-ink-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
