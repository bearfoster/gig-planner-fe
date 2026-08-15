import { Link } from "react-router-dom";
import type { ArtistSummaryDto as ArtistSummaryType } from "@gig-planner/api-client/generated/models";
import { Card } from "@/components/ui/card";
export function ArtistSummary({ artist }: { artist: ArtistSummaryType }) {
  return (
    <Link to={`/artists/${artist.id}`} className="group">
      <Card className="overflow-hidden">
        <div className="aspect-square overflow-hidden bg-ink">
          <img
            src={artist.imageUrl}
            alt=""
            className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h2 className="text-2xl font-bold group-hover:text-violet">
            {artist.name}
          </h2>
          <p className="mt-1 capitalize text-ink/55">{artist.genre}</p>
        </div>
      </Card>
    </Link>
  );
}
