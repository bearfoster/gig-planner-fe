import { useListVenues } from "@gig-planner/api-client/generated/venues/venues";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import { VenueSummary } from "@/features/venues/VenueSummary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function VenuesPage() {
  useDocumentTitle("Venues");
  const query = useListVenues();
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-coral">
          Rooms with history
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Sydney venues</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/60">
          Big stages, hidden basements and beloved Inner West rooms.
        </p>
      </header>
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((venue) => (
            <VenueSummary key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
