"use client";

import { useState } from "react";
import useSWR from "swr";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { ApiError, createAccount, listAccounts } from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "CAD"];

function AccountsView() {
  const { data: accounts, error: loadError, isLoading, mutate } = useSWR(
    "accounts",
    () => listAccounts(),
  );
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
    <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Accounts</h1>

      {(error || loadError) && (
        <p className="text-sm text-red-600">
          {error ?? (loadError instanceof ApiError ? loadError.message : "failed to load accounts")}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-black/60 dark:text-white/60">Loading...</p>
      ) : !accounts || accounts.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">No accounts yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/10">
              <th className="py-2">ID</th>
              <th className="py-2">Balance</th>
              <th className="py-2">Currency</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2">{a.id}</td>
                <td className="py-2">{a.balance}</td>
                <td className="py-2">{a.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={onCreate} className="flex items-center gap-3">
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
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2 disabled:opacity-50"
        >
          {creating ? "Creating..." : "New account"}
        </button>
      </form>
    </main>
  );
}

export default function AccountsPage() {
  return (
    <AuthGuard>
      <Nav />
      <AccountsView />
    </AuthGuard>
  );
}
