import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/10 bg-white shadow-[0_8px_30px_rgb(16_19_17_/_0.06)]",
        className,
      )}
      {...props}
    />
  );
}
