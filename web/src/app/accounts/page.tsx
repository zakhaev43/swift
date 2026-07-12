"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { ApiError, createAccount, listAccounts } from "@/lib/api";
import { formatAmount, formatDateTime } from "@/lib/format";

const CURRENCIES = ["USD", "EUR", "CAD"];

function AccountsView() {
  const { data: accounts, error: loadError, isLoading, mutate } = useSWR(
    "accounts",
    () => listAccounts(),
  );
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const balancesByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    for (const account of accounts ?? []) {
      totals.set(account.currency, (totals.get(account.currency) ?? 0) + account.balance);
    }
    return Array.from(totals.entries());
  }, [accounts]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createAccount(currency);
      await mutate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "failed to create account");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Accounts"
        description="Balances across every currency you hold with us."
      />

      {(error || loadError) && (
        <ErrorBanner
          message={
            error ?? (loadError instanceof ApiError ? loadError.message : "failed to load accounts")
          }
        />
      )}

      {isLoading ? (
        <LoadingState message="Loading accounts…" />
      ) : (
        <>
          {balancesByCurrency.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {balancesByCurrency.map(([curr, total]) => (
                <StatTile
                  key={curr}
                  label={curr}
                  value={formatAmount(total, curr)}
                  tone={total < 0 ? "critical" : "neutral"}
                />
              ))}
            </div>
          )}

          {!accounts || accounts.length === 0 ? (
            <EmptyState message="No accounts yet. Open one below to get started." />
          ) : (
            <Card className="divide-y divide-hairline overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
                <span>Account</span>
                <span>Currency</span>
                <span className="text-right">Balance</span>
              </div>
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-ink-primary">Account #{a.id}</div>
                    <div className="text-xs text-ink-muted">
                      Opened {formatDateTime(a.created_at)}
                    </div>
                  </div>
                  <span className="text-ink-secondary">{a.currency}</span>
                  <span
                    className={`tabular-nums text-right font-medium ${
                      a.balance < 0 ? "text-status-critical" : "text-ink-primary"
                    }`}
                  >
                    {formatAmount(a.balance, a.currency)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
              New account currency
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Open account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <AppShell>
      <AccountsView />
    </AppShell>
  );
}
