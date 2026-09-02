import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getOfferingBySlug,
  getOfferingSlugs,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema } from "@/lib/seo";
import { Container, Section, Display, Lead, CTA } from "@/components/site/primitives";
import { ImageHero, Breadcrumbs } from "@/components/site/heroes";
import Blocks from "@/components/site/Blocks";
import Reveal from "@/components/site/Reveal";

/** These two have hand-built pages; the generic template redirects to them. */
const DEDICATED_ROUTES: Record<string, string> = {
  travelxl: "/travelxl",
  experia: "/experia",
};

export async function generateStaticParams() {
  const slugs = await getOfferingSlugs();
  return slugs
    .filter(({ slug }) => !DEDICATED_ROUTES[slug])
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/offerings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [offering, settings] = await Promise.all([
    getOfferingBySlug(slug),
    getSettings(),
  ]);
  if (!offering) return { title: "Offering not found" };

  return buildMetadata({
    seo: offering.seo,
    title: offering.title,
    description: offering.summary,
    path: `/offerings/${offering.slug}`,
    image: offering.heroImage,
    settings,
  });
}

export default async function OfferingPage({
  params,
}: PageProps<"/offerings/[slug]">) {
  const { slug } = await params;

  if (DEDICATED_ROUTES[slug]) redirect(DEDICATED_ROUTES[slug]);

  const offering = await getOfferingBySlug(slug);
  if (!offering) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Offerings", path: "/offerings" },
    { name: offering.title, path: `/offerings/${offering.slug}` },
  ];

  return (
    <>
      <ImageHero
        image={offering.heroImage}
        video={offering.heroVideo}
        eyebrow="Offering"
        title={offering.title}
        lead={offering.summary}
        height="medium"
      />

      <Container size="wide" className="pt-8">
        <Breadcrumbs trail={trail.map((c) => ({ label: c.name, href: c.path }))} />
      </Container>

      <Blocks blocks={offering.blocks} />

      <Section className="bg-ink">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Display size="sm" className="text-white">
              Interested in {offering.title}?
            </Display>
            <Lead className="mx-auto mt-6 max-w-xl text-white/70">
              Send us the brief and we will come back with an outline and an
              indicative cost.
            </Lead>
            <div className="mt-9 flex justify-center">
              <CTA href="/contact" className="bg-white text-ink hover:bg-white/90">
                Enquire now
              </CTA>
            </div>
          </Reveal>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(trail))}
      />
    </>
  );
}
