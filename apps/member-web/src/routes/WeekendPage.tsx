import { CalendarDays, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { useWeekendPlan } from "@/features/weekend-plan/useWeekendPlan";
import { formatGigDate } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function PlanNote({
  initial,
  onSave,
  pending,
}: {
  initial: string;
  onSave: (note: string) => void;
  pending: boolean;
}) {
  const [note, setNote] = useState(initial);
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Your note</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Meet at the front bar? Last train?"
          maxLength={500}
        />
      </label>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={pending || note === initial}
        onClick={() => onSave(note)}
      >
        <Save size={15} />
        Save note
      </Button>
    </div>
  );
}
export default function WeekendPage() {
  useDocumentTitle("Weekend plan");
  const plan = useWeekendPlan();
  const entries = plan.plan?.entries ?? [];
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
          Friday to Sunday
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">
          Your weekend plan
        </h1>
        <p className="mt-4 flex items-center gap-2 text-lg text-ink/60">
          <CalendarDays size={20} />
          Weekend of{" "}
          {new Date(`${plan.weekend}T12:00:00`).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>
      {plan.isLoading ? (
        <LoadingState />
      ) : plan.error ? (
        <ErrorState retry={() => void plan.refetch()} />
      ) : !entries.length ? (
        <EmptyState
          title="Your weekend is wide open"
          message="Add a gig while browsing and it will become the first stop in your plan."
          action={
            <Button asChild>
              <Link to="/events">Browse gigs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {entries
            .sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))
            .map((entry, index) => (
              <article
                key={entry.eventId}
                className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-[64px_160px_1fr] sm:p-6"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-lime font-display text-xl font-bold">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <Link
                  to={`/events/${entry.event.id}`}
                  className="overflow-hidden rounded-2xl"
                >
                  <img
                    src={entry.event.imageUrl}
                    alt=""
                    className="aspect-[4/3] size-full object-cover"
                  />
                </Link>
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase text-violet">
                        {formatGigDate(entry.event.startsAt)}
                      </p>
                      <Link to={`/events/${entry.event.id}`}>
                        <h2 className="mt-1 text-2xl font-bold hover:text-violet">
                          {entry.event.name}
                        </h2>
                      </Link>
                      <p className="mt-1 text-ink/55">
                        {entry.event.venue.name}, {entry.event.venue.suburb}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${entry.event.name} from plan`}
                      disabled={plan.isPending}
                      onClick={() => plan.remove(entry.eventId)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <div className="mt-5">
                    <PlanNote
                      initial={entry.note}
                      pending={plan.isPending}
                      onSave={(note) => plan.updateNote(entry.eventId, note)}
                    />
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
