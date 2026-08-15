import { useListArtists } from "@gig-planner/api-client/generated/artists/artists";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import { ArtistSummary } from "@/features/artists/ArtistSummary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function ArtistsPage() {
  useDocumentTitle("Artists");
  const query = useListArtists();
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
          The lineup
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Artists</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/60">
          Songwriters, selectors and bands headed for Sydney stages.
        </p>
      </header>
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((artist) => (
            <ArtistSummary key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
