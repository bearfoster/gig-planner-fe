import { CalendarPlus, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { EventSummaryDto as EventSummary } from "@gig-planner/api-client/generated/models";
import { formatGigDate, formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FavouriteButton } from "./FavouriteButton";
import { Button } from "@/components/ui/button";
import { useWeekendPlan } from "@/features/weekend-plan/useWeekendPlan";

export function EventCard({ event }: { event: EventSummary }) {
  const plan = useWeekendPlan();
  const planned = plan.contains(event.id);
  return (
    <Card className="group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/events/${event.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
          <img
            src={event.imageUrl}
            alt=""
            className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
          />
          {event.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-sm">
              Sydney pick
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12">
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
              {event.genre}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
            <span className="text-violet">{formatGigDate(event.startsAt)}</span>
            <span>{formatPrice(event.price)}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight group-hover:text-violet">
            {event.name}
          </h3>
          <p className="mt-2 font-semibold">{event.artist.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
            <MapPin size={14} />
            {event.venue.name}, {event.venue.suburb}
          </p>
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <FavouriteButton event={event} compact />
      </div>
      <div className="border-t border-ink/10 p-3">
        <Button
          variant={planned ? "secondary" : "ghost"}
          size="sm"
          className="w-full"
          disabled={planned || event.status === "cancelled"}
          onClick={() => plan.add(event)}
        >
          <CalendarPlus size={16} />
          {planned ? "In your weekend" : "Add to weekend"}
        </Button>
      </div>
    </Card>
  );
}
export function EventGrid({ events }: { events: EventSummary[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
