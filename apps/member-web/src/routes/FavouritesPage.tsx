import { Link } from "react-router-dom";
import { useListFavourites } from "@gig-planner/api-client/generated/user/user";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { EventGrid } from "@/features/events/EventCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function FavouritesPage() {
  useDocumentTitle("Favourites");
  const query = useListFavourites();
  const favourites = query.data ?? [];
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-coral">
          Saved for later
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Your favourites</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/60">
          The gigs that caught your ear. Pick the ones that make the weekend.
        </p>
      </header>
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : favourites.length ? (
        <EventGrid events={favourites.map((item) => item.event)} />
      ) : (
        <EmptyState
          title="Nothing saved yet"
          message="Tap the heart on any gig and it will wait for you here."
          action={
            <Button asChild>
              <Link to="/events">Find a favourite</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
