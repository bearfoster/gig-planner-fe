import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useListEvents } from "@gig-planner/api-client/generated/events/events";
import { Button } from "@/components/ui/button";
import { EventGrid } from "@/features/events/EventCard";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("Discover live music");
  const query = useListEvents({ page: 1, pageSize: 6, sort: "date-asc" });
  const items = query.data?.items ?? [];
  return (
    <>
      <section className="noise relative overflow-hidden bg-ink text-white">
        <div className="absolute -right-28 -top-28 size-96 rounded-full bg-violet/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-coral/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-18 sm:py-24 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/75">
              <Sparkles size={15} className="text-lime" />
              This weekend in Sydney
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-[.95] sm:text-7xl lg:text-8xl">
              Find the gig.
              <br />
              <span className="text-lime">Make the night.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/65">
              From back rooms in Newtown to big stages in the city — discover
              what’s on and build a weekend that sounds like you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="default">
                <Link to="/events">
                  Browse all gigs <ArrowRight size={17} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:text-ink"
              >
                <Link to="/weekend">Open weekend plan</Link>
              </Button>
            </div>
          </div>
          <div className="hidden justify-self-end rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur lg:block">
            <div className="mb-8 flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} className="text-coral" />
              Eora / Sydney
            </div>
            <div className="font-display text-6xl font-bold">12</div>
            <p className="mt-1 text-white/60">fictional gigs to discover</p>
            <div className="mt-8 h-1 w-36 rounded-full bg-white/15">
              <div className="h-full w-2/3 rounded-full bg-lime" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-violet">
              On our radar
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl">Upcoming gigs</h2>
          </div>
          <Link
            to="/events"
            className="hidden items-center gap-2 font-bold hover:text-violet sm:flex"
          >
            See everything <ArrowRight size={17} />
          </Link>
        </div>
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState retry={() => void query.refetch()} />
        ) : (
          <EventGrid events={items} />
        )}
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="overflow-hidden rounded-[2rem] bg-violet px-6 py-12 text-white sm:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-lime">
              Three nights. Your rules.
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Turn a list of maybes into a very good weekend.
            </h2>
            <p className="mt-4 text-white/70">
              Save favourites as you browse, add the winners to your plan and
              leave yourself a note before doors.
            </p>
            <Button asChild variant="secondary" className="mt-7">
              <Link to="/weekend">
                Start planning <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
