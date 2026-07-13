export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-status-good/30 bg-status-good/10 px-3 py-2 text-sm text-status-good">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline px-6 py-10 text-center text-sm text-ink-muted">
      {message}
    </div>
  );
}

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return <p className="text-sm text-ink-muted">{message}</p>;
}
