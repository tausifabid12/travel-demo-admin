import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getPackages, getDestinations, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { HOLIDAY_THEMES, PACKAGE_CATEGORIES, TRIP_TYPES } from "@/lib/constants";
import { Container } from "@/components/site/primitives";
import PackageCard from "@/components/site/PackageCard";
import FilterSidebar, { type FilterGroup } from "@/components/site/FilterSidebar";
import type { PublicPackage } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "All Packages — Holidays, Honeymoons & Corporate Travel",
    description:
      "Browse every Bhancer package: beach holidays, honeymoons, family trips and corporate MICE programmes, filterable by destination, budget and duration.",
    path: "/travelxl",
    settings,
  });
}

/** Reads a comma-joined multi-select value out of the query string. */
function readMulti(value: string | string[] | undefined): string[] {
  if (typeof value !== "string") return [];
  return value.split(",").filter(Boolean);
}

function sortPackages(items: PublicPackage[], sort?: string) {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort(
        (a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity),
      );
    case "price-desc":
      return copy.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
    case "duration-asc":
      return copy.sort((a, b) => (a.durationDays ?? 0) - (b.durationDays ?? 0));
    case "duration-desc":
      return copy.sort((a, b) => (b.durationDays ?? 0) - (a.durationDays ?? 0));
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:
      // "Popular": featured first, then the editorial order from the CMS.
      return copy.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
}

export default async function PackagesPage({
  searchParams,
}: PageProps<"/travelxl">) {
  const params = await searchParams;

  const selected = {
    destination: readMulti(params.destination),
    region: readMulti(params.region),
    theme: readMulti(params.theme),
    category: readMulti(params.category),
    tripType: readMulti(params.tripType),
  };
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const maxPrice =
    typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const [all, destinations] = await Promise.all([
    getPackages(),
    getDestinations(),
  ]);

  // Filtering runs here rather than in the query: several facets are
  // multi-select, and two of them live on the joined destination document.
  const filtered = all.filter((pkg) => {
    if (
      selected.destination.length &&
      !selected.destination.includes(pkg.destinationId?.name ?? "")
    ) {
      return false;
    }
    if (
      selected.region.length &&
      !selected.region.includes(pkg.destinationId?.region ?? "")
    ) {
      return false;
    }
    if (selected.theme.length && !selected.theme.some((t) => pkg.themes?.includes(t))) {
      return false;
    }
    if (selected.category.length && !selected.category.includes(pkg.category)) {
      return false;
    }
    if (
      selected.tripType.length &&
      !selected.tripType.includes(pkg.tripType ?? "Holiday")
    ) {
      return false;
    }
    if (maxPrice && pkg.priceFrom && pkg.priceFrom > maxPrice) return false;
    return true;
  });

  const results = sortPackages(filtered, sort);

  // Facet counts come from the unfiltered set, so a count never reads zero just
  // because a different facet happens to be active.
  const countBy = (predicate: (pkg: PublicPackage) => boolean) =>
    all.filter(predicate).length;

  const regions = [...new Set(destinations.map((d) => d.region))].sort();

  const groups: FilterGroup[] = [
    {
      param: "destination",
      label: "Destination",
      multi: true,
      options: destinations
        .map((d) => ({
          value: d.name,
          label: d.name,
          count: countBy((p) => p.destinationId?.name === d.name),
        }))
        .filter((o) => o.count > 0),
    },
    {
      param: "region",
      label: "Region",
      multi: true,
      options: regions
        .map((region) => ({
          value: region,
          label: region,
          count: countBy((p) => p.destinationId?.region === region),
        }))
        .filter((o) => o.count > 0),
    },
    {
      param: "theme",
      label: "Holiday type",
      multi: true,
      options: HOLIDAY_THEMES.map((theme) => ({
        value: theme,
        label: theme,
        count: countBy((p) => Boolean(p.themes?.includes(theme))),
      })).filter((o) => o.count > 0),
    },
    {
      param: "tripType",
      label: "Trip type",
      multi: true,
      options: TRIP_TYPES.map((type) => ({
        value: type,
        label: type,
        count: countBy((p) => (p.tripType ?? "Holiday") === type),
      })).filter((o) => o.count > 0),
    },
    {
      param: "category",
      label: "Programme",
      multi: true,
      options: PACKAGE_CATEGORIES.map((category) => ({
        value: category,
        label: category,
        count: countBy((p) => p.category === category),
      })).filter((o) => o.count > 0),
    },
  ];

  const priceCeiling = Math.max(...all.map((p) => p.priceFrom ?? 0), 0);

  return (
    <div className="pt-20 sm:pt-24">
      <Container size="wide">
        <header className="py-5 sm:py-7">
          <h1 className="font-[family-name:var(--font-display)] text-xl leading-tight text-ink sm:text-3xl">
            All packages
          </h1>
          <p className="mt-1 text-sm text-body">
            Holidays, honeymoons and corporate programmes. Filter down to what
            fits, then tell us how you would change it.
          </p>
        </header>

        <div className="grid gap-6 pb-12 lg:grid-cols-[15rem_1fr] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FilterSidebar
              groups={groups}
              resultCount={results.length}
              maxPrice={
                priceCeiling > 0 ? Math.ceil(priceCeiling / 5000) * 5000 : undefined
              }
            />
          </aside>

          <div>
            {results.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-line py-16 text-center">
                <SearchX className="mx-auto size-8 text-muted" />
                <p className="mt-3 font-[family-name:var(--font-display)] text-lg text-ink">
                  Nothing matches those filters
                </p>
                <p className="mt-1.5 text-sm text-body">
                  Loosen a filter, or tell us what you want and we will build it.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <Link
                    href="/travelxl"
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                  >
                    Clear filters
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    Design my trip
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((pkg, index) => (
                  <PackageCard key={pkg._id} pkg={pkg} priority={index < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
