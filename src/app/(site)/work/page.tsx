import type { Metadata } from "next";
import { getCaseStudies, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Container, Section, CTA } from "@/components/site/primitives";
import { PageHero } from "@/components/site/heroes";
import { CaseStudyCard } from "@/components/site/cards";
import FilterBar from "@/components/site/FilterBar";
import Reveal from "@/components/site/Reveal";
import { TwoUp } from "@/components/site/HScroll";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Our Work",
    description:
      "Case studies from Bhancer: corporate programmes, MICE, incentive travel and live experiences, with the results they delivered.",
    path: "/work",
    settings,
  });
}

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const params = await searchParams;
  const industry = typeof params.industry === "string" ? params.industry : undefined;
  const service = typeof params.service === "string" ? params.service : undefined;

  // The unfiltered set drives the filter options, so a filter never hides
  // the very option that would bring the others back.
  const [all, filtered] = await Promise.all([
    getCaseStudies(),
    getCaseStudies({ industry, service }),
  ]);

  const industries = [...new Set(all.map((c) => c.industry))].sort();
  const services = [...new Set(all.map((c) => c.serviceCategory))].sort();

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="What we have built, and what it changed."
        lead="Every programme here started as a business problem. The travel was the answer, not the brief."
      />

      <Section>
        <Container size="wide">
          <FilterBar
            groups={[
              { param: "service", label: "Service", options: services },
              { param: "industry", label: "Industry", options: industries },
            ]}
            resultCount={filtered.length}
            noun="case studies"
          />

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl text-ink">
                No case studies match those filters.
              </p>
              <div className="mt-8 flex justify-center">
                <CTA href="/contact">Tell us about your programme</CTA>
              </div>
            </div>
          ) : (
            <TwoUp className="mt-10 sm:mt-14 lg:grid-cols-3">
              {filtered.map((study, index) => (
                <Reveal key={study._id} delay={(index % 3) * 80}>
                  <CaseStudyCard study={study} />
                </Reveal>
              ))}
            </TwoUp>
          )}
        </Container>
      </Section>
    </>
  );
}
