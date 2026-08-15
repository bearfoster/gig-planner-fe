import { useQueryClient } from "@tanstack/react-query";
import type {
  EventSummary,
  Favourite,
} from "@gig-planner/api-client/generated/models";
import {
  getListFavouritesQueryKey,
  useAddFavourite,
  useListFavourites,
  useRemoveFavourite,
} from "@gig-planner/api-client/generated/favourites/favourites";
import { toast } from "sonner";

export function useFavouriteEvent(event: EventSummary) {
  const client = useQueryClient();
  const query = useListFavourites();
  const key = getListFavouritesQueryKey();
  const favourites = query.data ?? [];
  const isFavourite = favourites.some((item) => item.eventId === event.id);
  const rollback = async () => {
    await client.cancelQueries({ queryKey: key });
    return client.getQueryData<Favourite[]>(key);
  };
  const add = useAddFavourite({
    mutation: {
      onMutate: async () => {
        const previous = await rollback();
        client.setQueryData<Favourite[]>(key, [
          ...(previous ?? []),
          { eventId: event.id, createdAt: new Date().toISOString(), event },
        ]);
        return { previous };
      },
      onError: (_e, _v, ctx) => {
        client.setQueryData(key, ctx?.previous);
        toast.error("Could not save favourite");
      },
      onSuccess: () => toast.success("Added to favourites"),
      onSettled: () => void client.invalidateQueries({ queryKey: key }),
    },
  });
  const remove = useRemoveFavourite({
    mutation: {
      onMutate: async () => {
        const previous = await rollback();
        client.setQueryData<Favourite[]>(
          key,
          (previous ?? []).filter((item) => item.eventId !== event.id),
        );
        return { previous };
      },
      onError: (_e, _v, ctx) => {
        client.setQueryData(key, ctx?.previous);
        toast.error("Could not remove favourite");
      },
      onSuccess: () => toast.success("Removed from favourites"),
      onSettled: () => void client.invalidateQueries({ queryKey: key }),
    },
  });
  return {
    isFavourite,
    isLoading: query.isLoading || add.isPending || remove.isPending,
    toggle: () =>
      isFavourite
        ? remove.mutate({ eventId: event.id })
        : add.mutate({ data: { eventId: event.id } }),
  };
}
