import {
  ArrowLeft,
  CalendarPlus,
  Clock3,
  ExternalLink,
  MapPin,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetEvent } from "@/api/generated/events/events";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import { FavouriteButton } from "@/features/events/FavouriteButton";
import { useWeekendPlan } from "@/features/weekend-plan/useWeekendPlan";
import { formatGigDate, formatPrice } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EventDetailsPage() {
  const [fullDescription, setFullDescription] = useState(false);
  const { eventId = "" } = useParams();
  const query = useGetEvent(eventId, {
    query: { enabled: Boolean(eventId), retry: false },
  });
  const event = query.data;
  useDocumentTitle(event?.name ?? "Event details");
  const plan = useWeekendPlan();
  if (query.isLoading) return <LoadingState label="Loading gig…" />;
  if (query.isError || !event)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ErrorState message="That gig could not be found. It may have left the lineup." />
        <Button asChild variant="outline" className="mt-6">
          <Link to="/events">
            <ArrowLeft size={16} />
            Back to gigs
          </Link>
        </Button>
      </div>
    );
  const planned = plan.contains(event.id);
  return (
    <div>
      <section className="relative min-h-[52vh] overflow-hidden bg-ink text-white">
        <img
          src={event.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/20" />
        <div className="relative mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-end px-6 py-12">
          <Link
            to="/events"
            className="mb-auto flex w-fit items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-semibold backdrop-blur"
          >
            <ArrowLeft size={16} />
            All gigs
          </Link>
          <span className="mb-4 w-fit rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
            {event.genre} · {event.status}
          </span>
          <h1 className="max-w-4xl text-5xl font-bold leading-none sm:text-7xl">
            {event.name}
          </h1>
          <Link
            to={`/artists/${event.artist.id}`}
            className="mt-4 text-xl font-semibold text-white/75 hover:text-lime"
          >
            {event.artist.name}
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
        <article>
          <h2 className="text-3xl font-bold">About this gig</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/65">
            {fullDescription ? event.description : event.description.substring(0, 20) + "..."}
            <button
              onClick={() => setFullDescription(!fullDescription)}
              className="ml-2 text-violet hover:underline"
            >
              {fullDescription ? "Show less" : "Show more"}
            </button>
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to={`/venues/${event.venue.id}`}
              className="rounded-3xl bg-white p-6 hover:ring-2 hover:ring-violet"
            >
              <MapPin className="mb-5 text-coral" />
              <h3 className="text-xl font-bold">{event.venue.name}</h3>
              <p className="mt-1 text-ink/55">{event.venue.suburb}</p>
            </Link>
            <Link
              to={`/artists/${event.artist.id}`}
              className="rounded-3xl bg-white p-6 hover:ring-2 hover:ring-violet"
            >
              <div className="mb-5 size-12 overflow-hidden rounded-full">
                <img
                  src={event.artist.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">{event.artist.name}</h3>
              <p className="mt-1 capitalize text-ink/55">
                {event.artist.genre}
              </p>
            </Link>
          </div>
        </article>
        <aside>
          <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-xl">
            <div className="space-y-5">
              <div className="flex gap-3">
                <Clock3 className="mt-1 text-violet" size={19} />
                <div>
                  <div className="font-bold">
                    {formatGigDate(event.startsAt)}
                  </div>
                  <div className="text-sm text-ink/50">
                    Doors one hour earlier
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-1 text-violet" size={19} />
                <div>
                  <div className="font-bold">{event.venue.name}</div>
                  <div className="text-sm text-ink/50">
                    {event.venue.suburb}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Ticket className="mt-1 text-violet" size={19} />
                <div>
                  <div className="font-bold">{formatPrice(event.price)}</div>
                  <div className="text-sm text-ink/50">
                    {event.ageRestriction}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-7 grid gap-3">
              <Button
                disabled={planned || event.status === "cancelled"}
                onClick={() => plan.add(event)}
              >
                <CalendarPlus size={17} />
                {planned ? "In your weekend" : "Add to weekend"}
              </Button>
              <FavouriteButton event={event} />
              {event.ticketUrl && (
                <Button asChild variant="ghost">
                  <a href={event.ticketUrl} target="_blank" rel="noreferrer">
                    Demo tickets <ExternalLink size={15} />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
