"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearSession, subscribeAuth, usernameSnapshot } from "@/lib/auth";

export default function Nav() {
  const router = useRouter();
  const username = useSyncExternalStore(subscribeAuth, usernameSnapshot, () => null);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <nav className="border-b border-black/10 dark:border-white/10 px-6 py-4 flex items-center justify-between">
      <Link href="/accounts" className="font-semibold">
        Swift Transfer
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/accounts">Accounts</Link>
        <Link href="/transfer">Transfer</Link>
        {username ? (
          <>
            <span className="text-black/50 dark:text-white/50">{username}</span>
            <button onClick={logout} className="underline">
              Log out
            </button>
          </>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </div>
    </nav>
  );
}
