"use client";

import { useState } from "react";
import useSWR from "swr";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner, LoadingState, SuccessBanner } from "@/components/ui/Feedback";
import { Input, Label, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, TransferResult, createTransfer, listAccounts } from "@/lib/api";
import { formatAmount } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

function TransferView() {
  useDocumentTitle("Transfer");
  const { data: accounts, isLoading } = useSWR("accounts", () => listAccounts());

  const [fromAccountIdOverride, setFromAccountIdOverride] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [sending, setSending] = useState(false);

  const fromAccountId = fromAccountIdOverride || String(accounts?.[0]?.id ?? "");
  const fromAccount = accounts?.find((a) => String(a.id) === fromAccountId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromAccount) return;
    setError(null);
    setResult(null);
    setSending(true);
    try {
      const transfer = await createTransfer({
        from_account_id: Number(fromAccountId),
        to_account_id: Number(toAccountId),
        amount: Number(amount),
        currency: fromAccount.currency,
      });
      setResult(transfer);
      setToAccountId("");
      setAmount("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "transfer failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Send money"
        description="Move funds from one of your accounts to any account ID."
      />

      <Card className="max-w-md p-6">
        {isLoading ? (
          <LoadingState message="Loading your accounts…" />
        ) : !accounts || accounts.length === 0 ? (
          <ErrorBanner message="You need an account before you can send money. Open one from the Accounts page." />
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <Label>From account</Label>
              <Select
                value={fromAccountId}
                onChange={(e) => setFromAccountIdOverride(e.target.value)}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} — {formatAmount(a.balance, a.currency)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>To account ID</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 3"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Amount {fromAccount ? `(${fromAccount.currency})` : ""}</Label>
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {error && <ErrorBanner message={error} />}
            {result && (
              <SuccessBanner
                message={`Sent ${formatAmount(result.transfer.amount, fromAccount?.currency ?? "USD")} to account #${result.transfer.to_account_id}.`}
              />
            )}

            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function TransferPage() {
  return (
    <AppShell>
      <TransferView />
    </AppShell>
  );
}
