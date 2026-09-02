import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
  getCaseStudies,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema } from "@/lib/seo";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  Lead,
  SectionHeading,
  RichText,
  Pill,
  CTA,
  TextLink,
} from "@/components/site/primitives";
import { ImageHero, Breadcrumbs } from "@/components/site/heroes";
import { Gallery, VideoLightbox } from "@/components/site/Gallery";
import { CaseStudyCard } from "@/components/site/cards";
import Reveal from "@/components/site/Reveal";
import { HScroll, HScrollItem } from "@/components/site/HScroll";

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [study, settings] = await Promise.all([
    getCaseStudyBySlug(slug),
    getSettings(),
  ]);
  if (!study) return { title: "Case study not found" };

  return buildMetadata({
    seo: study.seo,
    title: study.title,
    description: study.summary,
    path: `/work/${study.slug}`,
    image: study.heroImage,
    settings,
    type: "article",
  });
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  const others = (await getCaseStudies())
    .filter((c) => c.slug !== study.slug)
    .slice(0, 3);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: study.title, path: `/work/${study.slug}` },
  ];

  const chapters = [
    { label: "Challenge", html: study.challenge },
    { label: "Solution", html: study.solution },
    { label: "Results", html: study.results },
  ].filter((c) => c.html);

  return (
    <>
      <ImageHero
        image={study.heroImage}
        eyebrow={study.serviceCategory}
        title={study.title}
        lead={study.summary}
        height="medium"
        meta={
          <div className="flex flex-wrap gap-2">
            <Pill className="border-white/25 bg-white/10 text-white">
              {study.clientName}
            </Pill>
            <Pill className="border-white/25 bg-white/10 text-white">
              {study.industry}
            </Pill>
            {study.destinationId?.name && (
              <Pill className="border-white/25 bg-white/10 text-white">
                {study.destinationId.name}
              </Pill>
            )}
          </div>
        }
      />

      <Container size="wide" className="pt-8">
        <Breadcrumbs trail={trail.map((c) => ({ label: c.name, href: c.path }))} />
      </Container>

      {/* ----------------------------- Metrics ------------------------------ */}
      {study.metrics?.length > 0 && (
        <Section className="pt-4 pb-0">
          <Container size="wide">
            <Reveal>
              <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-y border-line py-10 sm:gap-x-8 sm:gap-y-12 sm:py-14 lg:grid-cols-4">
                {study.metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-ink leading-none tabular-nums">
                      {metric.value}
                    </p>
                    <p className="mt-2.5 text-sm text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ---------------------- Challenge / Solution / Results -------------- */}
      {chapters.map((chapter, index) => (
        <Section key={chapter.label} className={index === 0 ? "pt-20" : "pt-0"}>
          <Container size="wide">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-20">
              <div className="lg:col-span-4">
                <Reveal>
                  <div className="lg:sticky lg:top-32">
                    <Eyebrow>{chapter.label}</Eyebrow>
                  </div>
                </Reveal>
              </div>
              <div className="lg:col-span-8">
                <Reveal delay={80}>
                  <RichText html={chapter.html} />
                </Reveal>
              </div>
            </div>
          </Container>
        </Section>
      ))}

      {/* ------------------------------- Video ------------------------------ */}
      {study.videoUrl && (
        <Section className="pt-0">
          <Container size="wide">
            <Reveal>
              <VideoLightbox url={study.videoUrl} poster={study.heroImage} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ------------------------------ Gallery ----------------------------- */}
      {study.gallery.length > 0 && (
        <Section className="pt-0">
          <Container size="wide">
            <Reveal>
              <Gallery images={study.gallery} alt={study.title} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ---------------------------- Testimonial --------------------------- */}
      {study.testimonialQuote && (
        <Section className="bg-ink">
          <Container size="narrow" className="text-center">
            <Reveal>
              <blockquote>
                <Display size="sm" className="text-white text-balance">
                  &ldquo;{study.testimonialQuote}&rdquo;
                </Display>

                {study.testimonialAuthor && (
                  <footer className="mt-10 text-sm text-white/60">
                    <span className="block text-white">
                      {study.testimonialAuthor}
                    </span>
                    {study.testimonialRole && (
                      <span className="block mt-0.5">{study.testimonialRole}</span>
                    )}
                  </footer>
                )}
              </blockquote>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ------------------------------- CTA -------------------------------- */}
      <Section>
        <Container size="wide">
          <Reveal>
            <div className="grid lg:grid-cols-12 gap-10 items-end border-t border-line pt-14">
              <div className="lg:col-span-7">
                <Display size="sm">Planning something similar?</Display>
                <Lead className="mt-5 max-w-xl">
                  Send us the brief. We will tell you honestly whether we are the
                  right team for it.
                </Lead>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <CTA href="/contact">Start a conversation</CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------ Related ----------------------------- */}
      {others.length > 0 && (
        <Section className="bg-surface border-y border-line">
          <Container size="wide">
            <SectionHeading
              eyebrow="More work"
              title="Other programmes."
              action={<TextLink href="/work">All work</TextLink>}
            />
            <HScroll className="mt-10 sm:mt-14" cardWidth="72vw">
              {others.map((item, index) => (
                <HScrollItem key={item._id}>
                  <Reveal delay={index * 80}>
                    <CaseStudyCard study={item} />
                  </Reveal>
                </HScrollItem>
              ))}
            </HScroll>
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
