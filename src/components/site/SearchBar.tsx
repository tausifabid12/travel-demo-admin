"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Tag, Users, ChevronDown } from "lucide-react";
import { PACKAGE_CATEGORIES, HOLIDAY_THEMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PARTY_SIZES = [
  "2 travellers",
  "3–4 travellers",
  "5–9 travellers",
  "10+ travellers",
];

/**
 * Hero search. It does not hit a search index — it composes the same query
 * string the experiences listing already understands, so the results always
 * match the filters shown on that page.
 */
export default function SearchBar({
  destinations,
}: {
  destinations: { name: string; region: string }[];
}) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [theme, setTheme] = useState("");
  const [party, setParty] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (theme) params.set("theme", theme);
    // Party size is a hint for the enquiry form rather than a content filter.
    if (party) params.set("party", party);
    router.push(params.toString() ? `/travelxl?${params}` : "/travelxl");
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl bg-white p-1.5 shadow-[var(--shadow-lg)] lg:rounded-full"
    >
      <div className="flex flex-col lg:flex-row lg:items-center">
        <Cell icon={MapPin} label="Destination">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            aria-label="Destination"
            className="w-full appearance-none truncate bg-transparent pr-5 text-sm font-medium text-ink focus:outline-none"
          >
            <option value="">Anywhere</option>
            {destinations.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </Cell>

        <Divider />

        <Cell icon={Tag} label="Trip type">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            aria-label="Trip type"
            className="w-full appearance-none truncate bg-transparent pr-5 text-sm font-medium text-ink focus:outline-none"
          >
            <option value="">Any</option>
            <optgroup label="Holidays">
              {HOLIDAY_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </optgroup>
            <optgroup label="Corporate">
              {PACKAGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
        </Cell>

        <Divider />

        <Cell icon={Users} label="Travellers">
          <select
            value={party}
            onChange={(e) => setParty(e.target.value)}
            aria-label="Travellers"
            className="w-full appearance-none truncate bg-transparent pr-5 text-sm font-medium text-ink focus:outline-none"
          >
            <option value="">Any group</option>
            {PARTY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </Cell>

        <button
          type="submit"
          className={cn(
            "mt-1.5 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand",
            "px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover",
            "lg:mt-0 lg:size-12 lg:rounded-full lg:px-0 lg:py-0",
          )}
        >
          <Search className="size-4" />
          <span className="lg:sr-only">Search</span>
        </button>
      </div>
    </form>
  );
}

function Cell({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative flex flex-1 items-center gap-2.5 rounded-lg px-3.5 py-2 lg:px-4">
      <Icon className="size-4 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted">
          {label}
        </span>
        {children}
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-muted" />
    </label>
  );
}

function Divider() {
  return <span className="hidden h-8 w-px shrink-0 bg-line lg:block" />;
}
