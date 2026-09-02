import type { Metadata } from "next";
import { getSettings, getCaseStudies } from "@/lib/queries";
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
import Reveal from "@/components/site/Reveal";

const VALUES = [
  {
    title: "Precision",
    body: "A manifest is either right or it is not. We check, then we check again, because a delegate stranded at an airport is not a rounding error.",
  },
  {
    title: "Candour",
    body: "If a destination is wrong for your brief, or a budget will not stretch to the idea, you hear it from us before you hear it from a supplier.",
  },
  {
    title: "Ownership",
    body: "One named producer holds your programme from brief to strike. You never explain the same thing twice.",
  },
  {
    title: "Taste",
    body: "The difference between a good programme and a memorable one is judgement about a hundred small things. That is the part we care most about.",
  },
];

const MILESTONES = [
  { year: "2016", event: "Bhancer founded in Mumbai, running corporate offsites." },
  { year: "2018", event: "First international MICE programme delivered in Dubai." },
  { year: "2020", event: "TravelXL launched as the dedicated corporate travel arm." },
  { year: "2022", event: "Experia added, taking on live brand events and activations." },
  { year: "2024", event: "Retail and trade window opened to partner agencies." },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "About",
    description:
      "Who Bhancer is: a corporate travel and live experience company built around precision, candour and ownership.",
    path: "/about",
    settings,
  });
}

export default async function AboutPage() {
  const [settings, caseStudies] = await Promise.all([
    getSettings(),
    getCaseStudies(),
  ]);

  const heroImage =
    settings.homepage.heroImageUrl || caseStudies[0]?.heroImage;

  return (
    <>
      <ImageHero
        image={heroImage}
        eyebrow="Who we are"
        title="A travel company that thinks like a production company."
        lead="We plan corporate travel with the rigour of an operations team and the judgement of a creative one."
        height="medium"
      />

      {/* ------------------------- Mission and vision ----------------------- */}
      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <Eyebrow>Why we exist</Eyebrow>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={80}>
                <Display size="md">
                  Most corporate travel is bought. Very little of it is designed.
                </Display>
              </Reveal>

              <Reveal delay={160}>
                <Lead className="mt-8 max-w-2xl">
                  Bhancer exists because moving a team somewhere is the easy part.
                  Making the days there change how people work together, or how a
                  client sees you, takes a different kind of planning — and
                  somebody willing to own the outcome rather than the booking.
                </Lead>
              </Reveal>

              <Reveal delay={220}>
                <div className="mt-12 grid gap-10 sm:grid-cols-2">
                  <div>
                    <Rule className="mb-5" />
                    <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                      Our mission
                    </h3>
                    <p className="mt-3 leading-relaxed text-body">
                      To make every programme we run worth the time it takes out
                      of people&rsquo;s year.
                    </p>
                  </div>
                  <div>
                    <Rule className="mb-5" />
                    <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                      Our vision
                    </h3>
                    <p className="mt-3 leading-relaxed text-body">
                      To be the team Indian businesses call first when a moment
                      genuinely has to land.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Values ------------------------------ */}
      <Section className="border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading eyebrow="Values" title="What we hold to." />

          <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 sm:grid-cols-2">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={(index % 2) * 80}>
                <Rule className="mb-5" />
                <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  {value.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------- Timeline ----------------------------- */}
      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="lg:sticky lg:top-32">
                  <Eyebrow>Milestones</Eyebrow>
                  <Display size="sm" className="mt-6">
                    How we got here.
                  </Display>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <ol>
                {MILESTONES.map((milestone, index) => (
                  <Reveal key={milestone.year} delay={index * 60} as="li">
                    <div className="grid grid-cols-[4rem_1fr] gap-5 border-t border-line py-7 sm:grid-cols-[7rem_1fr] sm:gap-8">
                      <span className="font-[family-name:var(--font-display)] text-xl leading-none tabular-nums text-gold sm:text-2xl">
                        {milestone.year}
                      </span>
                      <p className="leading-relaxed text-body">{milestone.event}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Proof ------------------------------- */}
      {(settings.homepage.stats?.length ?? 0) > 0 && (
        <Section className="bg-ink">
          <Container size="wide">
            <Reveal>
              <Eyebrow>Track record</Eyebrow>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
              {settings.homepage.stats!.map((stat, index) => (
                <Reveal key={stat.label} delay={index * 80}>
                  <p className="font-[family-name:var(--font-display)] text-4xl leading-none tabular-nums text-white sm:text-6xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm text-white/60">{stat.label}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ------------------------------- CTA -------------------------------- */}
      <Section>
        <Container size="wide">
          <Reveal>
            <div className="grid items-end gap-8 border-t border-line pt-14 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Display size="sm">See what that looks like in practice.</Display>
                <div className="mt-6">
                  <TextLink href="/work">Read our case studies</TextLink>
                </div>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <CTA href="/contact">Start a conversation</CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
