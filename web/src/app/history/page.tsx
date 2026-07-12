"use client";

import useSWR from "swr";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/Feedback";
import { PageHeader } from "@/components/ui/PageHeader";
import { Account, ApiError, listAccounts, listTransfers } from "@/lib/api";
import { formatAmount, formatDateTime } from "@/lib/format";

type HistoryEntry = {
  id: number;
  createdAt: string;
  direction: "sent" | "received";
  counterpartAccountId: number;
  amount: number;
  currency: string;
};

async function loadHistory(accounts: Account[]): Promise<HistoryEntry[]> {
  const perAccount = await Promise.all(
    accounts.map(async (account) => {
      const transfers = await listTransfers(account.id);
      return transfers.map((t) => {
        const sent = t.from_account_id === account.id;
        return {
          id: t.id,
          createdAt: t.created_at,
          direction: sent ? ("sent" as const) : ("received" as const),
          counterpartAccountId: sent ? t.to_account_id : t.from_account_id,
          amount: t.amount,
          currency: account.currency,
        };
      });
    }),
  );

  return perAccount
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function HistoryView() {
  const { data: accounts, error: accountsError, isLoading: loadingAccounts } = useSWR(
    "accounts",
    () => listAccounts(),
  );

  const {
    data: history,
    error: historyError,
    isLoading: loadingHistory,
  } = useSWR(accounts ? ["history", accounts.map((a) => a.id).join(",")] : null, () =>
    loadHistory(accounts!),
  );

  const error = accountsError ?? historyError;
  const isLoading = loadingAccounts || loadingHistory;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transaction history"
        description="Every transfer into or out of your accounts, most recent first."
      />

      {error && (
        <ErrorBanner
          message={error instanceof ApiError ? error.message : "failed to load history"}
        />
      )}

      {isLoading ? (
        <LoadingState message="Loading transaction history…" />
      ) : !history || history.length === 0 ? (
        <EmptyState message="No transactions yet." />
      ) : (
        <Card className="divide-y divide-hairline overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
            <span>Type</span>
            <span>Details</span>
            <span className="text-right">Amount</span>
          </div>
          {history.map((entry) => (
            <div
              key={`${entry.id}-${entry.direction}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 text-sm"
            >
              <span
                className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  entry.direction === "received"
                    ? "bg-status-good/10 text-status-good"
                    : "bg-ink-primary/5 text-ink-secondary"
                }`}
              >
                {entry.direction === "received" ? "Received" : "Sent"}
              </span>
              <div>
                <div className="text-ink-primary">
                  {entry.direction === "received" ? "From" : "To"} account #
                  {entry.counterpartAccountId}
                </div>
                <div className="text-xs text-ink-muted">{formatDateTime(entry.createdAt)}</div>
              </div>
              <span
                className={`tabular-nums text-right font-medium ${
                  entry.direction === "received" ? "text-status-good" : "text-ink-primary"
                }`}
              >
                {entry.direction === "received" ? "+" : "−"}
                {formatAmount(entry.amount, entry.currency)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryView />
    </AppShell>
  );
}
