import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useGetVenue, useListVenueEvents } from "@/api/generated/venues/venues";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import { EventGrid } from "@/features/events/EventCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function VenueDetailsPage() {
  const { venueId = "" } = useParams();
  const venueQuery = useGetVenue(venueId, { query: { retry: false } });
  const eventsQuery = useListVenueEvents(venueId, { query: { retry: false } });
  const venue = venueQuery.data;
  useDocumentTitle(venue?.name ?? "Venue details");
  if (venueQuery.isLoading) return <LoadingState />;
  if (!venue || venueQuery.isError)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ErrorState message="That venue could not be found." />
      </div>
    );
  return (
    <div>
      <section className="relative min-h-[50vh] bg-ink text-white">
        <img
          src={venue.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-end px-6 py-12">
          <Link
            to="/venues"
            className="mb-auto flex items-center gap-2 text-sm font-semibold text-white/70"
          >
            <ArrowLeft size={15} />
            All venues
          </Link>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-lime">
            {venue.suburb}
          </p>
          <h1 className="mt-2 text-5xl font-bold sm:text-7xl">{venue.name}</h1>
          <div className="mt-5 flex flex-wrap gap-5 text-white/65">
            <span className="flex items-center gap-2">
              <MapPin size={17} />
              {venue.address}
            </span>
            <span className="flex items-center gap-2">
              <Users size={17} />
              {venue.capacity.toLocaleString()} capacity
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <p className="mb-14 max-w-3xl text-xl leading-8 text-ink/65">
          {venue.description}
        </p>
        <h2 className="mb-7 text-4xl font-bold">Coming up here</h2>
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
