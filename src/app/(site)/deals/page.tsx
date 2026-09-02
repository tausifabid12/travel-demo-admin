import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { getPackages, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/site/primitives";
import PackageCard from "@/components/site/PackageCard";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Deals & Offers",
    description:
      "Every Bhancer package with a live saving against its standard rate, steepest discount first.",
    path: "/deals",
    settings,
  });
}

export default async function DealsPage() {
  const all = await getPackages();

  const savingOf = (p: (typeof all)[number]) =>
    p.strikePrice && p.priceFrom ? (p.strikePrice - p.priceFrom) / p.strikePrice : 0;

  const deals = all
    .filter((p) => savingOf(p) > 0)
    .sort((a, b) => savingOf(b) - savingOf(a));

  const best = deals[0] ? Math.round(savingOf(deals[0]) * 100) : 0;

  return (
    <div className="pt-20 sm:pt-24">
      <Container size="wide">
        <header className="py-5 sm:py-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-leaf">
            <Tag className="size-3" />
            {deals.length} live {deals.length === 1 ? "offer" : "offers"}
            {best > 0 ? ` · up to ${best}% off` : ""}
          </span>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-xl leading-tight text-ink sm:text-3xl">
            Deals on right now
          </h1>
          <p className="mt-1 text-sm text-body">
            Real savings against the standard rate, steepest discount first. No
            countdown timers, no invented was-prices.
          </p>
        </header>

        <div className="pb-12">
          {deals.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-line py-16 text-center">
              <p className="font-[family-name:var(--font-display)] text-lg text-ink">
                No offers running today
              </p>
              <p className="mt-1.5 text-sm text-body">
                We only list a deal when the saving is genuine, so this page is
                sometimes empty.
              </p>
              <Link
                href="/travelxl"
                className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Browse all packages
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {deals.map((pkg, index) => (
                <PackageCard key={pkg._id} pkg={pkg} priority={index < 4} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
