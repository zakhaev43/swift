"use client";

import Link from "next/link";
import { ReactNode, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Logo } from "@/components/ui/Logo";
import { clearSession, subscribeAuth, usernameSnapshot } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/accounts", label: "Accounts" },
  { href: "/transfer", label: "Transfer" },
  { href: "/history", label: "History" },
];

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const username = useSyncExternalStore(subscribeAuth, usernameSnapshot, () => null);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/accounts" className="shrink-0">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {username && (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-ink-secondary hover:bg-ink-primary/5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-ink">
                {initials(username)}
              </span>
              <span className="hidden sm:inline">{username}</span>
            </Link>
            <button
              onClick={logout}
              className="text-sm text-ink-secondary underline-offset-2 hover:text-ink-primary hover:underline"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </AuthGuard>
  );
}
