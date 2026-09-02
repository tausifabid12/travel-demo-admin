import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getDestinationBySlug,
  getDestinationSlugs,
  getPackages,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema } from "@/lib/seo";
import { Container, Section } from "@/components/site/primitives";
import { ImageHero, Breadcrumbs } from "@/components/site/heroes";
import PackageCard, { formatPrice } from "@/components/site/PackageCard";
import { Gallery } from "@/components/site/Gallery";
import { ShelfHeader } from "@/components/site/storefront";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function generateStaticParams() {
  const destinations = await getDestinationSlugs();
  return destinations.map((d) => ({ slug: d.slug ?? toSlug(d.name) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [destination, settings] = await Promise.all([
    getDestinationBySlug(slug),
    getSettings(),
  ]);
  if (!destination) return { title: "Destination not found" };

  return buildMetadata({
    title: `${destination.name} Holiday Packages`,
    description:
      destination.description ??
      `Holiday and corporate travel packages in ${destination.name}.`,
    path: `/destinations/${slug}`,
    image: destination.heroImage,
    settings,
  });
}

export default async function DestinationPage({
  params,
}: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const all = await getPackages();
  const packages = all.filter((p) => p.destinationId?.name === destination.name);

  const holidays = packages.filter((p) => p.tripType !== "Corporate");
  const corporate = packages.filter((p) => p.tripType === "Corporate");

  const cheapest = packages
    .map((p) => p.priceFrom)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b)[0];

  const trail = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: destination.name, path: `/destinations/${slug}` },
  ];

  return (
    <>
      <ImageHero
        image={destination.heroImage}
        eyebrow={destination.region}
        title={destination.name}
        lead={destination.description}
        height="medium"
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-md">
              {packages.length} {packages.length === 1 ? "package" : "packages"}
            </span>
            {cheapest ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
                from {formatPrice(cheapest, "INR")}
              </span>
            ) : null}
          </div>
        }
      />

      <Container size="wide" className="pt-6">
        <Breadcrumbs trail={trail.map((c) => ({ label: c.name, href: c.path }))} />
      </Container>

      {holidays.length > 0 && (
        <Section className="py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title={`Holidays in ${destination.name}`}
              subtitle="Every one of these is a starting point we reshape around you."
              href={`/travelxl?destination=${encodeURIComponent(destination.name)}`}
              linkLabel="Filter all"
            />
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {holidays.map((pkg, index) => (
                <PackageCard key={pkg._id} pkg={pkg} priority={index < 4} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {corporate.length > 0 && (
        <Section className="bg-elevated py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader
              title={`Corporate programmes in ${destination.name}`}
              subtitle="MICE, incentives and offsites run by the TravelXL team."
            />
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {corporate.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {destination.gallery?.length > 0 && (
        <Section className="py-8 sm:py-12">
          <Container size="wide">
            <ShelfHeader title={`${destination.name} in pictures`} />
            <Gallery images={destination.gallery} alt={destination.name} />
          </Container>
        </Section>
      )}

      {packages.length === 0 && (
        <Section className="py-12">
          <Container size="narrow" className="text-center">
            <p className="font-[family-name:var(--font-display)] text-xl text-ink">
              Nothing published for {destination.name} yet.
            </p>
            <p className="mt-2 text-sm text-body">
              We still plan trips here — tell us what you have in mind and we
              will build one.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Design my trip
              <ArrowRight className="size-4" />
            </Link>
          </Container>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(trail))}
      />
    </>
  );
}
