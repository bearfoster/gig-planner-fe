import { useEffect } from "react";
export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Setting title:", title);
    }

    document.title = `${title} · Sydney Gig Planner`;

    return () => {
      if (import.meta.env.DEV) {
        console.log("Cleaning up title:", title);
      }
    };
  }, [title]);
}
