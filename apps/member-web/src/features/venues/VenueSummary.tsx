import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { VenueSummary as VenueSummaryType } from "@gig-planner/api-client/generated/models";
import { Card } from "@/components/ui/card";
export function VenueSummary({ venue }: { venue: VenueSummaryType }) {
  return (
    <Link to={`/venues/${venue.id}`} className="group">
      <Card className="overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-ink">
          <img
            src={venue.imageUrl}
            alt=""
            className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h2 className="text-2xl font-bold group-hover:text-violet">
            {venue.name}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-ink/55">
            <MapPin size={15} />
            {venue.suburb}
          </p>
        </div>
      </Card>
    </Link>
  );
}
