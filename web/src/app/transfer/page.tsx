"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { ApiError, Transfer, createTransfer } from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "CAD"];

function TransferView() {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const transfer = await createTransfer({
        from_account_id: Number(fromAccountId),
        to_account_id: Number(toAccountId),
        amount: Number(amount),
        currency,
      });
      setResult(transfer);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Send money</h1>

        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="From account ID"
          type="number"
          min={1}
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="To account ID"
          type="number"
          min={1}
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20"
          placeholder="Amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          className="border rounded px-3 py-2 border-black/10 dark:border-white/20 bg-transparent"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <p className="text-sm text-green-600">
            Transfer #{result.transfer.id} completed: {result.transfer.amount}{" "}
            {currency} from account {result.transfer.from_account_id} to{" "}
            {result.transfer.to_account_id}.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}

export default function TransferPage() {
  return (
    <AuthGuard>
      <Nav />
      <TransferView />
    </AuthGuard>
  );
}
