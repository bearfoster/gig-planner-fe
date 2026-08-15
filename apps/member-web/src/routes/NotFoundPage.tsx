import { Disc3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <Disc3
        className="mx-auto animate-spin text-violet [animation-duration:5s]"
        size={72}
      />
      <p className="mt-7 text-sm font-bold uppercase tracking-[.2em] text-coral">
        404 · Wrong venue
      </p>
      <h1 className="mt-3 text-5xl font-bold">This page isn’t on the bill.</h1>
      <p className="mt-4 text-lg text-ink/60">
        The link may be old, or this route never made it past soundcheck.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Back to discovery</Link>
      </Button>
    </div>
  );
}
