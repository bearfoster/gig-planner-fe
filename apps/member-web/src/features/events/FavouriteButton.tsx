import { Heart } from "lucide-react";
import type { EventSummaryDto as EventSummary } from "@gig-planner/api-client/generated/models";
import { useFavouriteEvent } from "@/features/favourites/useFavouriteEvent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function FavouriteButton({
  event,
  compact = false,
}: {
  event: EventSummary;
  compact?: boolean;
}) {
  const favourite = useFavouriteEvent(event);
  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon" : "default"}
      disabled={favourite.isLoading}
      aria-label={
        favourite.isFavourite
          ? `Remove ${event.name} from favourites`
          : `Add ${event.name} to favourites`
      }
      aria-pressed={favourite.isFavourite}
      onClick={(e) => {
        e.preventDefault();
        favourite.toggle();
      }}
      className={cn(
        favourite.isFavourite && "border-coral bg-coral/10 text-coral",
      )}
    >
      {" "}
      <Heart size={18} fill={favourite.isFavourite ? "currentColor" : "none"} />
      {!compact && (favourite.isFavourite ? "Saved" : "Favourite")}
    </Button>
  );
}
