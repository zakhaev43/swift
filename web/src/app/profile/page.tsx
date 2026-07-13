"use client";

import useSWR from "swr";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { ErrorBanner, LoadingState } from "@/components/ui/Feedback";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, getCurrentUser, listAccounts, verifyLedger } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function ProfileView() {
  useDocumentTitle("Profile");
  const { data: user, error, isLoading } = useSWR("me", () => getCurrentUser());
  const { data: accounts } = useSWR("accounts", () => listAccounts());
  const { data: ledger } = useSWR("ledger-verify", () => verifyLedger());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account details." />

      {error && (
        <ErrorBanner
          message={error instanceof ApiError ? error.message : "failed to load profile"}
        />
      )}

      {isLoading || !user ? (
        <LoadingState message="Loading profile…" />
      ) : (
        <Card className="max-w-lg p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-semibold text-brand-ink">
              {initials(user.full_name || user.username)}
            </span>
            <div>
              <div className="text-lg font-semibold text-ink-primary">{user.full_name}</div>
              <div className="text-sm text-ink-secondary">@{user.username}</div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-ink-muted">Email</dt>
            <dd className="text-ink-primary">{user.email}</dd>

            <dt className="text-ink-muted">Member since</dt>
            <dd className="text-ink-primary">{formatDateTime(user.created_at)}</dd>

            <dt className="text-ink-muted">Accounts</dt>
            <dd className="text-ink-primary">{accounts?.length ?? "—"}</dd>

            <dt className="text-ink-muted">Ledger integrity</dt>
            <dd>
              {ledger ? (
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    ledger.valid ? "text-status-good" : "text-status-critical"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ledger.valid ? "bg-status-good" : "bg-status-critical"
                    }`}
                  />
                  {ledger.valid ? "Verified" : `Tampering detected (entry #${ledger.broken_entry_id})`}
                </span>
              ) : (
                <span className="text-ink-muted">Checking…</span>
              )}
            </dd>
          </dl>
        </Card>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  );
}
