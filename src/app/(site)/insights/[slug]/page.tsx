import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getInsightBySlug,
  getInsightSlugs,
  getRelatedInsights,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  SectionHeading,
  RichText,
  Pill,
  TextLink,
} from "@/components/site/primitives";
import { Breadcrumbs } from "@/components/site/heroes";
import { InsightCard } from "@/components/site/cards";
import ShareLinks from "@/components/site/ShareLinks";
import Reveal from "@/components/site/Reveal";
import { TwoUp } from "@/components/site/HScroll";

export async function generateStaticParams() {
  const slugs = await getInsightSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [insight, settings] = await Promise.all([
    getInsightBySlug(slug),
    getSettings(),
  ]);
  if (!insight) return { title: "Article not found" };

  return buildMetadata({
    seo: insight.seo,
    title: insight.title,
    description: insight.excerpt,
    path: `/insights/${insight.slug}`,
    image: insight.featuredImage,
    settings,
    type: "article",
    publishedTime: insight.publishDate,
    authors: [insight.author],
  });
}

export default async function InsightPage({
  params,
}: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);
  if (!insight) notFound();

  const [related, settings] = await Promise.all([
    getRelatedInsights(insight, 3),
    getSettings(),
  ]);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
    { name: insight.title, path: `/insights/${insight.slug}` },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.excerpt,
    ...(insight.featuredImage ? { image: insight.featuredImage } : {}),
    datePublished: insight.publishDate,
    author: { "@type": "Person", name: insight.author },
    publisher: {
      "@type": "Organization",
      name: settings.siteTitle,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/insights/${insight.slug}`,
  };

  return (
    <>
      <article>
        <Section className="pb-0 pt-32 sm:pt-40">
          <Container size="narrow">
            <Breadcrumbs
              trail={trail.map((c) => ({ label: c.name, href: c.path }))}
            />

            <Eyebrow>{insight.category}</Eyebrow>

            <Display as="h1" size="md" className="mt-6">
              {insight.title}
            </Display>

            <p className="mt-6 text-lg leading-relaxed text-body text-pretty">
              {insight.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-5 text-sm text-muted">
              <span className="text-ink">{insight.author}</span>
              {insight.authorRole && <span>{insight.authorRole}</span>}
              <span>{formatDate(insight.publishDate)}</span>
              {insight.readingMinutes ? (
                <span>{insight.readingMinutes} min read</span>
              ) : null}
            </div>
          </Container>
        </Section>

        {insight.featuredImage && (
          <Section className="py-8 sm:py-12">
            <Container size="default">
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                <Image
                  src={insight.featuredImage}
                  alt={insight.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 72rem"
                  className="object-cover"
                />
              </div>
            </Container>
          </Section>
        )}

        <Section className="pt-8 sm:pt-12">
          <Container size="narrow">
            <RichText html={insight.body} className="max-w-none" />

            {insight.tags?.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <Pill key={tag}>{tag}</Pill>
                ))}
              </div>
            )}

            <div className="mt-12 border-t border-line pt-8">
              <ShareLinks
                url={`${SITE_URL}/insights/${insight.slug}`}
                title={insight.title}
              />
            </div>
          </Container>
        </Section>
      </article>

      {related.length > 0 && (
        <Section className="border-t border-line bg-surface">
          <Container size="wide">
            <SectionHeading
              eyebrow="Keep reading"
              title="Related articles."
              action={<TextLink href="/insights">All insights</TextLink>}
            />

            <TwoUp className="mt-10 sm:mt-14 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item._id} delay={index * 80}>
                  <InsightCard insight={item} />
                </Reveal>
              ))}
            </TwoUp>
          </Container>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(articleSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(trail))}
      />
    </>
  );
}
