import { cn } from "@/lib/utils";

/**
 * App-style horizontal carousel on mobile, a plain grid from `sm` up.
 *
 * Children snap into place and the track bleeds to the screen edge so the next
 * card peeks in — the affordance that tells a thumb it can swipe.
 */
export function HScroll({
  children,
  className,
  cardWidth = "78vw",
  columns = "sm:grid-cols-2 lg:grid-cols-3",
  gap = "gap-5 sm:gap-x-8 sm:gap-y-14",
}: {
  children: React.ReactNode;
  className?: string;
  /** Width of each card while in carousel mode. */
  cardWidth?: string;
  columns?: string;
  gap?: string;
}) {
  return (
    <div
      className={cn(
        // Carousel on mobile…
        "flex snap-x snap-mandatory overflow-x-auto scroll-px-6 pb-2",
        "-mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // …grid from sm up.
        "sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0",
        columns,
        gap,
        className,
      )}
      style={{ ["--card-w" as string]: cardWidth }}
    >
      {children}
    </div>
  );
}

/** One slide inside an HScroll. */
export function HScrollItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[var(--card-w)] shrink-0 snap-start sm:w-auto sm:shrink",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Two-up grid that stays two-up on mobile, the way app catalogue screens do,
 * rather than collapsing to a single tall column.
 */
export function TwoUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-8 sm:gap-y-14",
        className,
      )}
    >
      {children}
    </div>
  );
}
