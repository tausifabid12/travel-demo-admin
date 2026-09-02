import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Users, Presentation, Trophy, ArrowRight } from "lucide-react";
import {
  getSettings,
  getPackages,
  getDestinations,
  getFeaturedCaseStudies,
  getInsights,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { HOLIDAY_THEMES } from "@/lib/constants";
import { Container, Section } from "@/components/site/primitives";
import StoreHero from "@/components/site/StoreHero";
import PackageCard from "@/components/site/PackageCard";
import {
  ThemeRow,
  DestinationTile,
  PromoBand,
  ShelfHeader,
} from "@/components/site/storefront";
import { InsightCard } from "@/components/site/cards";
import { HScroll, HScrollItem } from "@/components/site/HScroll";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: `${settings.siteTitle} — Holiday Packages, Honeymoons & Corporate Travel`,
    description: settings.siteDescription,
    path: "/",
    image: settings.homepage.heroImageUrl,
    settings,
  });
}

const CORPORATE_PILLARS = [
  { icon: Presentation, label: "MICE & conferences" },
  { icon: Trophy, label: "Incentive travel" },
  { icon: Users, label: "Team offsites" },
  { icon: Briefcase, label: "Business travel" },
];

export default async function HomePage() {
  const settings = await getSettings();
  const home = settings.homepage;

  const [allPackages, destinations, caseStudies, insights] = await Promise.all([
    getPackages(),
    getDestinations(),
    getFeaturedCaseStudies(home.featuredCaseStudyIds, 1),
    getInsights(),
  ]);

  const holidays = allPackages.filter((p) => p.tripType !== "Corporate");
  const corporate = allPackages.filter((p) => p.tripType === "Corporate");

  // Trending = the ones the team flagged, topped up with whatever else exists
  // so the shelf is never half-empty.
  const trending = [
    ...holidays.filter((p) => p.isFeatured),
    ...holidays.filter((p) => !p.isFeatured),
  ].slice(0, 8);

  // Everything with a genuine saving, steepest discount first.
  const discounted = holidays
    .filter((p) => p.strikePrice && p.priceFrom && p.strikePrice > p.priceFrom)
    .sort(
      (a, b) =>
        (b.strikePrice! - b.priceFrom!) / b.strikePrice! -
        (a.strikePrice! - a.priceFrom!) / a.strikePrice!,
    );

  // Prefer deals the trending shelf has not already shown, but never render a
  // near-empty row — fall back to the full discounted list if the leftovers
  // would not fill it.
  const shown = new Set(trending.slice(0, 5).map((p) => p._id));
  const unseen = discounted.filter((p) => !shown.has(p._id));
  const deals = (unseen.length >= 3 ? unseen : discounted).slice(0, 5);

  const featuredDestinations = destinations.filter((d) => d.isFeatured);
  const featuredCase = caseStudies[0];

  const availableThemes = HOLIDAY_THEMES.filter((theme) =>
    holidays.some((p) => p.themes?.includes(theme)),
  );
  const themes = availableThemes.length >= 4 ? availableThemes : HOLIDAY_THEMES;

  return (
    <>
      <StoreHero
        image={home.heroImageUrl}
        video={home.heroVideoUrl}
        headline={
          home.heroHeadline ||
          "Holidays worth taking the leave for."
        }
        subheadline={
          home.heroSubheadline ||
          "Handpicked packages across 38 destinations, shaped around how you actually want to travel — then run by people who pick up the phone."
        }
        destinations={destinations.map((d) => ({
          name: d.name,
          region: d.region,
        }))}
        quickLinks={featuredDestinations.slice(0, 5).map((d) => ({
          label: d.name,
          href: `/travelxl?destination=${encodeURIComponent(d.name)}`,
        }))}
      />

      {/* ----------------------------- Themes ------------------------------- */}
      <section className="border-b border-line py-5 sm:py-7">
        <Container size="wide">
          <ThemeRow themes={[...themes]} />
        </Container>
      </section>

      {/* --------------------------- Trending ------------------------------- */}
      {trending.length > 0 && (
        <Section className="py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title="Trending right now"
              subtitle="The packages most people are asking us about this month."
              href="/travelxl"
              linkLabel="See all packages"
            />

            <HScroll
              columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              cardWidth="46vw"
              gap="gap-2.5 sm:gap-4"
            >
              {trending.slice(0, 5).map((pkg, index) => (
                <HScrollItem key={pkg._id}>
                  <PackageCard pkg={pkg} priority={index < 2} />
                </HScrollItem>
              ))}
            </HScroll>
          </Container>
        </Section>
      )}

      {/* -------------------------- Destinations ---------------------------- */}
      {featuredDestinations.length > 0 && (
        <Section className="bg-elevated py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title="Where everyone is going"
              subtitle="Places we know street by street, not from a brochure."
              href="/travelxl"
              linkLabel="All destinations"
            />

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {featuredDestinations.slice(0, 5).map((destination, index) => (
                <div
                  key={destination._id}
                  // The first tile takes a double slot on wide screens.
                  className={index === 0 ? "col-span-2 lg:row-span-2" : undefined}
                >
                  <DestinationTile
                    destination={destination}
                    packages={allPackages}
                    large={index === 0}
                  />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ------------------------------ Deals ------------------------------- */}
      {deals.length > 0 && (
        <Section className="py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title="Deals on right now"
              subtitle="Live prices on packages with real savings against the standard rate."
              href="/travelxl"
              linkLabel="See all deals"
            />

            <HScroll
              columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              cardWidth="46vw"
              gap="gap-2.5 sm:gap-4"
            >
              {deals.map((pkg) => (
                <HScrollItem key={pkg._id}>
                  <PackageCard pkg={pkg} />
                </HScrollItem>
              ))}
            </HScroll>
          </Container>
        </Section>
      )}

      {/* --------------------------- Honeymoon band ------------------------- */}
      <Section className="py-4 sm:py-6">
        <PromoBand
          eyebrow="Just the two of you"
          title="Honeymoons planned around the trip, not the package."
          body="Private pool villas, over-water suites and the kind of itinerary that leaves room to do nothing at all."
          href="/travelxl?theme=Honeymoon"
          cta="Browse honeymoons"
          image={featuredDestinations[1]?.heroImage}
          tone="berry"
        />
      </Section>

      {/* ---------------------------- Corporate ----------------------------- */}
      <Section className="bg-deep py-10 sm:py-14">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                <Briefcase className="size-3 text-gold" />
                TravelXL for business
              </span>

              <h2 className="mt-3.5 text-balance font-[family-name:var(--font-display)] text-xl leading-tight text-white sm:text-3xl">
                Moving a whole team, not just a family.
              </h2>

              <p className="mt-2.5 max-w-md text-[0.8125rem] leading-relaxed text-white/75 sm:text-sm">
                The same team also runs corporate programmes — conferences,
                incentive trips and offsites, with delegate manifests, approval
                cycles and a named producer from brief to strike.
              </p>

              <ul className="mt-5 grid grid-cols-2 gap-2">
                {CORPORATE_PILLARS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[0.75rem] text-white/85"
                  >
                    <Icon className="size-3.5 shrink-0 text-gold" />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/travelxl?tripType=Corporate"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-transform duration-300 hover:translate-x-0.5"
                >
                  Corporate packages
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Talk to the team
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              {corporate.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {corporate.slice(0, 4).map((pkg) => (
                    <PackageCard key={pkg._id} pkg={pkg} />
                  ))}
                </div>
              ) : featuredCase ? (
                <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-6 sm:p-8">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
                    Recent programme
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">
                    {featuredCase.title}
                  </p>
                  {featuredCase.metrics?.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {featuredCase.metrics.slice(0, 4).map((metric) => (
                        <div key={metric.label}>
                          <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-white sm:text-3xl">
                            {metric.value}
                          </p>
                          <p className="mt-1 text-[0.6875rem] text-white/55">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/work/${featuredCase.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                  >
                    Read the case study
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Stats ------------------------------- */}
      {(home.stats?.length ?? 0) > 0 && (
        <Section className="py-8 sm:py-10">
          <Container size="wide">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {home.stats!.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-card)] border border-line bg-elevated p-4 text-center sm:p-5"
                >
                  <p className="font-[family-name:var(--font-display)] text-xl leading-none tabular-nums text-brand sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[0.6875rem] text-body sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ----------------------------- Insights ----------------------------- */}
      {insights.length > 0 && (
        <Section className="bg-elevated py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title="Before you book"
              subtitle="Destination guides and the practical detail nobody else writes down."
              href="/insights"
              linkLabel="All guides"
            />

            <HScroll cardWidth="72vw" gap="gap-2.5 sm:gap-4">
              {insights.slice(0, 3).map((insight) => (
                <HScrollItem key={insight._id}>
                  <InsightCard insight={insight} />
                </HScrollItem>
              ))}
            </HScroll>
          </Container>
        </Section>
      )}

      {/* ------------------------------- CTA -------------------------------- */}
      <Section className="py-8 sm:py-12">
        <PromoBand
          eyebrow="Not sure where to start?"
          title="Tell us roughly what you want. We will do the planning."
          body={`Send us dates, a budget and who is travelling. ${
            settings.contact.responsePromise || "We respond within 24 hours"
          }, with a real itinerary and a real price.`}
          href="/contact"
          cta="Plan my trip"
          image={featuredDestinations[0]?.heroImage}
          tone="accent"
        />
      </Section>
    </>
  );
}
