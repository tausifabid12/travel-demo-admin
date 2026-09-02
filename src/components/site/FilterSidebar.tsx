"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterGroup = {
  param: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
  /** Allow several values at once, joined with commas in the query string. */
  multi?: boolean;
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Duration: shortest" },
  { value: "duration-desc", label: "Duration: longest" },
  { value: "rating", label: "Highest rated" },
];

/**
 * Faceted filters. Every choice is written to the URL so a filtered view is
 * shareable, bookmarkable and survives the back button.
 */
export default function FilterSidebar({
  groups,
  resultCount,
  maxPrice,
}: {
  groups: FilterGroup[];
  resultCount: number;
  maxPrice?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const push = (next: URLSearchParams) => {
    startTransition(() => {
      router.replace(next.toString() ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    });
  };

  const toggle = (param: string, value: string, multi?: boolean) => {
    const next = new URLSearchParams(searchParams.toString());

    if (multi) {
      const current = (next.get(param) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length) next.set(param, updated.join(","));
      else next.delete(param);
    } else {
      if (next.get(param) === value) next.delete(param);
      else next.set(param, value);
    }

    push(next);
  };

  const setSingle = (param: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(param, value);
    else next.delete(param);
    push(next);
  };

  const isOn = (param: string, value: string, multi?: boolean) =>
    multi
      ? (searchParams.get(param) ?? "").split(",").includes(value)
      : searchParams.get(param) === value;

  const activeCount =
    groups.reduce(
      (sum, g) =>
        sum + (searchParams.get(g.param) ? searchParams.get(g.param)!.split(",").length : 0),
      0,
    ) + (searchParams.get("maxPrice") ? 1 : 0);

  const priceCeiling = maxPrice ?? 0;
  const currentMax = Number(searchParams.get("maxPrice") ?? priceCeiling);

  const panel = (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.param}>
          <h3 className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink">
            {group.label}
          </h3>
          <div className="flex flex-col gap-1">
            {group.options.map((option) => {
              const on = isOn(group.param, option.value, group.multi);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(group.param, option.value, group.multi)}
                  aria-pressed={on}
                  className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-sm transition-colors hover:bg-elevated"
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border transition-colors",
                      on
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-white",
                    )}
                  >
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className={cn("flex-1", on ? "text-ink" : "text-body")}>
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs tabular-nums text-muted">
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {priceCeiling > 0 && (
        <section>
          <h3 className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink">
            Max price per person
          </h3>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={5000}
            value={currentMax}
            aria-label="Maximum price per person"
            onChange={(e) =>
              setSingle(
                "maxPrice",
                Number(e.target.value) >= priceCeiling ? null : e.target.value,
              )
            }
            className="w-full accent-[var(--color-brand)]"
          />
          <p className="mt-1 text-xs text-body">
            Up to{" "}
            <span className="font-semibold text-ink">
              ₹{currentMax.toLocaleString("en-IN")}
            </span>
          </p>
        </section>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          className="self-start text-sm font-semibold text-brand hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Toolbar: result count, sort, and the mobile filter trigger. */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
        <p
          className={cn("text-sm text-body transition-opacity", pending && "opacity-40")}
          aria-live="polite"
        >
          <span className="font-semibold text-ink">{resultCount}</span>{" "}
          {resultCount === 1 ? "package" : "packages"}
        </p>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">Sort</span>
            <select
              value={searchParams.get("sort") ?? "popular"}
              onChange={(e) =>
                setSingle("sort", e.target.value === "popular" ? null : e.target.value)
              }
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-brand text-[0.5625rem] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop rail */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-70 bg-ink/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Filters"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 z-80 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white lg:hidden",
          "pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-transform duration-300",
          open ? "translate-y-0" : "pointer-events-none invisible translate-y-full",
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-4 py-3">
          <span className="text-sm font-semibold text-ink">Filters</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="text-body"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">{panel}</div>

        <div className="sticky bottom-0 border-t border-line bg-white p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            Show {resultCount} {resultCount === 1 ? "package" : "packages"}
          </button>
        </div>
      </div>
    </>
  );
}
