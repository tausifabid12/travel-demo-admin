import type { Metadata } from "next";
import { getOfferingBySlug, getCaseStudies, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  Lead,
  SectionHeading,
  CTA,
  Rule,
  TextLink,
} from "@/components/site/primitives";
import { ImageHero } from "@/components/site/heroes";
import { CaseStudyCard } from "@/components/site/cards";
import Blocks from "@/components/site/Blocks";
import Reveal from "@/components/site/Reveal";
import { TwoUp } from "@/components/site/HScroll";

const DISCIPLINES = [
  {
    title: "Brand launches",
    body: "Product and brand moments built to be photographed, filmed and remembered.",
  },
  {
    title: "Retail experiences",
    body: "Store openings, pop-ups and in-store activations that give people a reason to walk in.",
  },
  {
    title: "Award nights",
    body: "Recognition programmes with the production values the achievement deserves.",
  },
  {
    title: "Conferences and summits",
    body: "Content, staging and delegate experience treated as one design problem.",
  },
  {
    title: "Roadshows",
    body: "One format, many cities, delivered identically in each of them.",
  },
  {
    title: "Films and content",
    body: "Capture on the day, cut into something you can use for the next twelve months.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const [settings, offering] = await Promise.all([
    getSettings(),
    getOfferingBySlug("experia"),
  ]);

  return buildMetadata({
    seo: offering?.seo,
    title: "Experia — Experience Design & Live Brand Events",
    description:
      "Experia is the live experience arm of Bhancer: brand launches, retail activations, award nights, roadshows and the content that comes out of them.",
    path: "/experia",
    image: offering?.heroImage,
    settings,
  });
}

export default async function ExperiaPage() {
  const [offering, caseStudies] = await Promise.all([
    getOfferingBySlug("experia"),
    getCaseStudies(),
  ]);

  const experiaWork = caseStudies
    .filter((c) => c.serviceCategory === "Experia")
    .slice(0, 3);
  const work = experiaWork.length > 0 ? experiaWork : caseStudies.slice(0, 3);

  return (
    <>
      <ImageHero
        image={offering?.heroImage}
        video={offering?.heroVideo}
        eyebrow="Experia"
        title="Live experiences, engineered."
        lead={
          offering?.summary ||
          "The experience design arm of Bhancer. Brand moments built from a concept through to strike, for audiences who have seen everything already."
        }
        actions={
          <CTA href="/contact" variant="light">
            Start a project
          </CTA>
        }
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <Eyebrow>The idea</Eyebrow>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={80}>
                <Display size="md">
                  Being seen is easy. Being remembered is the brief.
                </Display>
              </Reveal>
              <Reveal delay={160}>
                <Lead className="mt-8 max-w-2xl">
                  Experia exists for the moments where a brand has to land in a
                  room rather than in a feed. We design the idea, build the
                  production around it, and run the night itself.
                </Lead>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading eyebrow="What we make" title="Six things we do well." />

          <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {DISCIPLINES.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 80}>
                <Rule className="mb-5" />
                <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {offering?.blocks?.length ? <Blocks blocks={offering.blocks} /> : null}

      {work.length > 0 && (
        <Section>
          <Container size="wide">
            <SectionHeading
              eyebrow="Selected work"
              title="Recent projects."
              action={<TextLink href="/work">All work</TextLink>}
            />

            <TwoUp className="mt-10 sm:mt-14 lg:grid-cols-3">
              {work.map((study, index) => (
                <Reveal key={study._id} delay={index * 80}>
                  <CaseStudyCard study={study} />
                </Reveal>
              ))}
            </TwoUp>
          </Container>
        </Section>
      )}

      <Section className="bg-ink">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Eyebrow className="justify-center">Work with Experia</Eyebrow>
            <Display size="md" className="mt-7 text-white">
              Tell us what the room has to feel like.
            </Display>
            <Lead className="mx-auto mt-7 max-w-xl text-white/70">
              We will come back with a concept, a production plan and a number.
            </Lead>
            <div className="mt-10 flex justify-center">
              <CTA href="/contact" className="bg-white text-ink hover:bg-white/90">
                Start a project
              </CTA>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
