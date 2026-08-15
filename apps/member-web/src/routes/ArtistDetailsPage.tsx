import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  useGetArtist,
  useListArtistEvents,
} from "@gig-planner/api-client/generated/artists/artists";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { EventGrid } from "@/features/events/EventCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function ArtistDetailsPage() {
  const { artistId = "" } = useParams();
  const artistQuery = useGetArtist(artistId, { query: { retry: false } });
  const eventsQuery = useListArtistEvents(artistId, {
    query: { retry: false },
  });
  const artist = artistQuery.data;
  useDocumentTitle(artist?.name ?? "Artist details");
  if (artistQuery.isLoading) return <LoadingState />;
  if (!artist || artistQuery.isError)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ErrorState message="That artist could not be found." />
      </div>
    );
  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 sm:grid-cols-[240px_1fr] sm:py-16">
          <img
            src={artist.imageUrl}
            alt=""
            className="aspect-square w-full rounded-3xl object-cover"
          />
          <div>
            <Link
              to="/artists"
              className="mb-7 flex items-center gap-2 text-sm font-semibold text-white/55 hover:text-lime"
            >
              <ArrowLeft size={15} />
              All artists
            </Link>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-lime">
              {artist.genre}
            </p>
            <h1 className="mt-2 text-5xl font-bold sm:text-7xl">
              {artist.name}
            </h1>
            <p className="mt-3 text-white/55">{artist.hometown}</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              {artist.bio}
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-7 text-4xl font-bold">Upcoming gigs</h2>
        {eventsQuery.isLoading ? (
          <LoadingState />
        ) : eventsQuery.isError ? (
          <ErrorState />
        ) : eventsQuery.data?.length ? (
          <EventGrid events={eventsQuery.data} />
        ) : (
          <EmptyState title="No upcoming shows" />
        )}
      </section>
    </div>
  );
}
