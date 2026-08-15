import { useListEvents } from "@gig-planner/api-client/generated/events/events";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { EventFilters } from "@/features/events/EventFilters";
import { EventGrid } from "@/features/events/EventCard";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EventsPage() {
  useDocumentTitle("Browse gigs");
  const { filters, update, clear } = useEventFilters();
  const query = useListEvents(filters);
  const result = query.data;
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-9">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
          What’s on
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">
          Gigs around Sydney
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/60">
          Search the city’s fictional stages, from intimate songwriter rooms to
          all-in late nights.
        </p>
      </header>
      <EventFilters />
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : !result?.items.length ? (
        <EmptyState action={<Button onClick={clear}>Clear filters</Button>} />
      ) : (
        <>
          <div className="mb-5 text-sm text-ink/55">
            Showing {result.items.length} of {result.totalItems} gigs
          </div>
          <EventGrid events={result.items} />
          <nav
            className="mt-10 flex items-center justify-center gap-3"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              disabled={result.page <= 1}
              onClick={() => update({ page: result.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold">
              Page {result.page} of {result.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={result.page >= result.totalPages}
              onClick={() => update({ page: result.page + 1 })}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
