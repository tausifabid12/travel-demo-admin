import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, X, MapPin, Clock, Tag } from "lucide-react";
import {
  getPackageBySlug,
  getPackageSlugs,
  getRelatedPackages,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  Lead,
  SectionHeading,
  Rule,
  Pill,
  TextLink,
} from "@/components/site/primitives";
import { ImageHero, Breadcrumbs } from "@/components/site/heroes";
import { Gallery } from "@/components/site/Gallery";
import PackageCard from "@/components/site/PackageCard";
import { EnquiryForm } from "@/components/site/forms";
import BookingWidget from "@/components/site/BookingWidget";
import Reveal from "@/components/site/Reveal";
import { HScroll, HScrollItem } from "@/components/site/HScroll";
import StickyEnquireBar from "@/components/site/StickyEnquireBar";

export async function generateStaticParams() {
  const slugs = await getPackageSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/travelxl/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [pkg, settings] = await Promise.all([getPackageBySlug(slug), getSettings()]);

  if (!pkg) return { title: "Experience not found" };

  return buildMetadata({
    seo: pkg.seo,
    title: pkg.title,
    description: pkg.summary,
    path: `/travelxl/${pkg.slug}`,
    image: pkg.heroImage,
    settings,
  });
}

export default async function PackagePage({
  params,
}: PageProps<"/travelxl/[slug]">) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const [related, settings] = await Promise.all([
    getRelatedPackages(pkg, 3),
    getSettings(),
  ]);

  const trail = [
    { name: "Home", path: "/" },
    { name: "TravelXL", path: "/travelxl" },
    { name: pkg.title, path: `/travelxl/${pkg.slug}` },
  ];

  const tripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary ?? pkg.seo?.metaDescription,
    url: `${SITE_URL}/travelxl/${pkg.slug}`,
    ...(pkg.heroImage ? { image: pkg.heroImage } : {}),
    ...(pkg.destinationId
      ? {
          touristType: "Business",
          itinerary: {
            "@type": "ItemList",
            numberOfItems: pkg.itinerary.length,
            itemListElement: pkg.itinerary.map((day) => ({
              "@type": "ListItem",
              position: day.day,
              name: day.title,
              description: day.description,
            })),
          },
        }
      : {}),
    provider: {
      "@type": "Organization",
      name: settings.siteTitle,
      url: SITE_URL,
    },
  };

  return (
    <>
      <ImageHero
        image={pkg.heroImage}
        video={pkg.heroVideo}
        eyebrow={pkg.category}
        title={pkg.title}
        lead={pkg.summary}
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            {pkg.destinationId?.name && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {pkg.destinationId.name}
                {pkg.destinationId.region && `, ${pkg.destinationId.region}`}
              </span>
            )}
            {pkg.durationDays ? (
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4" /> {pkg.durationDays} days
              </span>
            ) : null}
            {pkg.rating ? (
              <span className="inline-flex items-center gap-2">
                <Tag className="size-4" /> {pkg.rating.toFixed(1)} rated
                {pkg.reviewCount ? ` · ${pkg.reviewCount} reviews` : ""}
              </span>
            ) : null}
          </div>
        }
      />

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          trail={trail.map((c) => ({ label: c.name, href: c.path }))}
        />
      </Container>

      {/* -------------------- Highlights and booking widget ----------------- */}
      <Section className="pt-4">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7 xl:col-span-8">
              {pkg.highlights.length > 0 && (
                <>
                  <Eyebrow>Highlights</Eyebrow>
                  <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {pkg.highlights.map((highlight) => (
                      <li key={highlight}>
                        <Rule className="mb-2.5" />
                        <p className="text-sm leading-snug text-ink sm:text-base">
                          {highlight}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <BookingWidget pkg={pkg} />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Gallery ----------------------------- */}
      {pkg.gallery.length > 0 && (
        <Section className="pt-0">
          <Container size="wide">
            <Reveal>
              <Gallery images={pkg.gallery} alt={pkg.title} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ----------------------------- Itinerary ---------------------------- */}
      {pkg.itinerary.length > 0 && (
        <Section className="bg-surface border-y border-line">
          <Container size="wide">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-4">
                {/* Sticky so the section title stays with the days on desktop. */}
                <div className="lg:sticky lg:top-32">
                  <Reveal>
                    <Eyebrow>Itinerary</Eyebrow>
                    <Display size="sm" className="mt-6">
                      Day by day.
                    </Display>
                    <p className="mt-5 text-sm leading-relaxed text-body max-w-xs">
                      An outline, not a contract — days move around to fit your
                      agenda.
                    </p>
                  </Reveal>
                </div>
              </div>

              <div className="lg:col-span-8">
                <ol className="flex flex-col">
                  {pkg.itinerary.map((day, index) => (
                    <Reveal key={day.day} delay={index * 60} as="li">
                      <div className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr] gap-6 border-t border-line py-9">
                        <span className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-gold leading-none tabular-nums">
                          {String(day.day).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink leading-snug">
                            {day.title}
                          </h3>
                          {day.description && (
                            <p className="mt-3 text-base leading-relaxed text-body max-w-2xl">
                              {day.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* ------------------- Inclusions and exclusions ----------------------- */}
      {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
        <Section>
          <Container size="wide">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              {pkg.inclusions.length > 0 && (
                <Reveal>
                  <Eyebrow>What is included</Eyebrow>
                  <ul className="mt-8 flex flex-col gap-4">
                    {pkg.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3.5">
                        <Check className="size-4 shrink-0 mt-1 text-green-700" />
                        <span className="text-base text-body leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {pkg.exclusions.length > 0 && (
                <Reveal delay={100}>
                  <Eyebrow>What is not</Eyebrow>
                  <ul className="mt-8 flex flex-col gap-4">
                    {pkg.exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3.5">
                        <X className="size-4 shrink-0 mt-1 text-muted" />
                        <span className="text-base text-body leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* --------------------------- Customisation -------------------------- */}
      <Section className="pt-0">
        <Container size="wide">
          <Reveal>
            <div className="border-l-2 border-gold pl-8 sm:pl-12 py-2 max-w-3xl">
              <Display size="sm" className="text-2xl sm:text-3xl">
                This is a customisable experience.
              </Display>
              <Lead className="mt-5">
                Tailor it to your team — swap the destination, compress the days,
                change the venue class, add a partner programme. Tell us the
                objective and we will rebuild it around that.
              </Lead>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------ Enquiry ----------------------------- */}
      <Section id="enquire" className="bg-surface border-y border-line">
        <Container size="wide">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <Eyebrow>Enquire</Eyebrow>
                <Display size="sm" className="mt-6">
                  Customise this experience.
                </Display>
                <p className="mt-6 text-base leading-relaxed text-body">
                  {settings.contact.responsePromise ||
                    "We respond within 24 hours"}
                  . A named producer will come back with an outline and an
                  indicative cost.
                </p>

                {pkg.destinationId?.name && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    <Pill>{pkg.category}</Pill>
                    <Pill>{pkg.destinationId.name}</Pill>
                    {pkg.durationDays ? (
                      <Pill>{pkg.durationDays} days</Pill>
                    ) : null}
                  </div>
                )}
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={100}>
                <EnquiryForm
                  source="TravelXL Package"
                  sourcePage={`/travelxl/${pkg.slug}`}
                  packageId={pkg._id}
                  packageTitle={pkg.title}
                  variant="package"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Related ----------------------------- */}
      {related.length > 0 && (
        <Section>
          <Container size="wide">
            <SectionHeading
              eyebrow="You may also like"
              title="Related experiences."
              action={<TextLink href="/travelxl">All experiences</TextLink>}
            />

            <HScroll className="mt-10 sm:mt-14" cardWidth="72vw">
              {related.map((item, index) => (
                <HScrollItem key={item._id}>
                  <Reveal delay={index * 80}>
                    <PackageCard pkg={item} />
                  </Reveal>
                </HScrollItem>
              ))}
            </HScroll>
          </Container>
        </Section>
      )}

      <StickyEnquireBar
        label={`Enquire about ${pkg.title}`}
        priceIndicator={pkg.priceIndicator}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(tripSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(trail))}
      />
    </>
  );
}
