"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export type FilterGroup = {
  /** Query-string key this group writes to. */
  param: string;
  label: string;
  options: string[];
};

/**
 * Writes each choice into the URL so filtered views are shareable and survive
 * a reload or a back-navigation.
 */
export default function FilterBar({
  groups,
  resultCount,
  noun = "results",
}: {
  groups: FilterGroup[];
  resultCount: number;
  noun?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (param: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(param, value);
    else next.delete(param);

    startTransition(() => {
      router.replace(next.toString() ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    });
  };

  const activeCount = groups.filter((g) => searchParams.get(g.param)).length;

  return (
    <div className="border-y border-line py-6">
      <div className="flex flex-col gap-5">
        {groups.map((group) => {
          const active = searchParams.get(group.param);
          return (
            <div
              key={group.param}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            >
              <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-muted sm:w-28 shrink-0">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={!active}
                  onClick={() => setParam(group.param, null)}
                >
                  All
                </FilterChip>
                {group.options.map((option) => (
                  <FilterChip
                    key={option}
                    active={active === option}
                    onClick={() =>
                      setParam(group.param, active === option ? null : option)
                    }
                  >
                    {option}
                  </FilterChip>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between gap-4 pt-1">
          <p
            className={cn(
              "text-sm text-muted transition-opacity",
              pending && "opacity-40",
            )}
            aria-live="polite"
          >
            {resultCount} {resultCount === 1 ? noun.replace(/s$/, "") : noun}
          </p>

          {activeCount > 0 && (
            <button
              onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
              className="text-sm text-body underline underline-offset-4 transition-colors hover:text-ink"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-all duration-300",
        active
          ? "border-ink bg-ink text-canvas"
          : "border-line text-body hover:border-ink/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
