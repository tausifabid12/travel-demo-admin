import type { Metadata } from "next";
import { getInsights, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Container, Section, CTA } from "@/components/site/primitives";
import { PageHero } from "@/components/site/heroes";
import { InsightCard } from "@/components/site/cards";
import FilterBar from "@/components/site/FilterBar";
import Reveal from "@/components/site/Reveal";
import { TwoUp } from "@/components/site/HScroll";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Industry Insights",
    description:
      "Corporate travel trends, MICE thinking, destination guides and event planning notes from the Bhancer team.",
    path: "/insights",
    settings,
  });
}

export default async function InsightsPage({
  searchParams,
}: PageProps<"/insights">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;

  // The unfiltered set drives the filter options, so choosing one never hides
  // the option that would bring the others back.
  const [all, filtered] = await Promise.all([
    getInsights(),
    getInsights({ category }),
  ]);

  const categories = [...new Set(all.map((i) => i.category))].sort();

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="What we are seeing in corporate travel."
        lead="Notes from the work — trends, destination thinking and the operational detail nobody else writes about."
      />

      <Section>
        <Container size="wide">
          {categories.length > 1 && (
            <FilterBar
              groups={[{ param: "category", label: "Topic", options: categories }]}
              resultCount={filtered.length}
              noun="articles"
            />
          )}

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl text-ink">
                Nothing published here yet.
              </p>
              <div className="mt-8 flex justify-center">
                <CTA href="/contact">Ask us directly</CTA>
              </div>
            </div>
          ) : (
            <TwoUp className="mt-10 sm:mt-14 lg:grid-cols-3">
              {filtered.map((insight, index) => (
                <Reveal key={insight._id} delay={(index % 3) * 80}>
                  <InsightCard insight={insight} />
                </Reveal>
              ))}
            </TwoUp>
          )}
        </Container>
      </Section>
    </>
  );
}
