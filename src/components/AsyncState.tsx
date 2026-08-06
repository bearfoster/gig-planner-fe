import { AlertTriangle, CalendarX2 } from "lucide-react";
import { Button } from "./ui/button";

export function LoadingState({ label = "Loading gigs…" }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center" role="status">
      <div className="text-center">
        <div className="mx-auto mb-4 size-9 animate-spin rounded-full border-4 border-ink/15 border-t-violet" />
        <p className="font-semibold">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title = "No gigs found",
  message = "Try widening your filters or check back soon.",
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/25 bg-white/50 px-6 py-16 text-center">
      <CalendarX2 className="mx-auto mb-4 text-violet" size={34} />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink/60">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "We could not load this right now.",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-coral/40 bg-coral/10 px-6 py-12 text-center"
    >
      <AlertTriangle className="mx-auto mb-4" />
      <h2 className="text-xl font-bold">Something went off-beat</h2>
      <p className="mt-2 text-ink/65">{message}</p>
      {retry && (
        <Button className="mt-5" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
