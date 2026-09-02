import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getOfferings, getSettings } from "@/lib/queries";
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
} from "@/components/site/primitives";
import { PageHero } from "@/components/site/heroes";
import Reveal from "@/components/site/Reveal";

const CAPABILITIES = [
  "MICE",
  "Incentive Travel",
  "Corporate Offsites",
  "Conferences",
  "Corporate Travel",
  "Business Travel",
  "Live Brand Events",
  "Retail Window",
];

const PROCESS = [
  {
    title: "Brief",
    body: "We start with the objective, not the destination. What has to be true when everyone flies home?",
  },
  {
    title: "Design",
    body: "Destination, venue, format and run of show, costed properly and presented as options rather than a single take-it-or-leave-it.",
  },
  {
    title: "Build",
    body: "Contracting, manifests, production, collateral, delegate comms. The unglamorous months.",
  },
  {
    title: "Deliver",
    body: "We are on the ground with you. Decisions get made in the room, not over email.",
  },
  {
    title: "Debrief",
    body: "What worked, what did not, what it cost against what it was meant to achieve.",
  },
];

/** Offerings that have a dedicated hand-built page rather than a block page. */
const DEDICATED_ROUTES: Record<string, string> = {
  travelxl: "/travelxl",
  experia: "/experia",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Our Offerings",
    description:
      "What Bhancer does: corporate travel and MICE through TravelXL, and live brand experiences through Experia.",
    path: "/offerings",
    settings,
  });
}

export default async function OfferingsPage() {
  const offerings = await getOfferings();

  return (
    <>
      <PageHero
        eyebrow="Our offerings"
        title="What we do."
        lead="Two arms, one team. Corporate travel and MICE through TravelXL; live brand experiences through Experia."
      />

      {offerings.length > 0 && (
        <Section className="pt-14 sm:pt-20">
          <Container size="wide">
            <div className="grid gap-px bg-line md:grid-cols-2">
              {offerings.map((offering, index) => (
                <Reveal key={offering._id} delay={index * 100} className="bg-canvas">
                  <Link
                    href={
                      DEDICATED_ROUTES[offering.slug] ?? `/offerings/${offering.slug}`
                    }
                    className="group flex h-full flex-col p-6 transition-colors hover:bg-surface sm:p-10 lg:p-14"
                  >
                    {offering.heroImage && (
                      <div
                        className="relative mb-6 overflow-hidden sm:mb-10"
                        style={{ aspectRatio: "16/10" }}
                      >
                        <Image
                          src={offering.heroImage}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                      </div>
                    )}

                    <Display size="sm" className="text-2xl sm:text-4xl">
                      {offering.title}
                    </Display>

                    {offering.summary && (
                      <p className="mt-4 flex-1 leading-relaxed text-body">
                        {offering.summary}
                      </p>
                    )}

                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink">
                      Explore {offering.title}
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* --------------------------- Capabilities --------------------------- */}
      <Section className="border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything we deliver."
            lead="Whichever arm it sits under, the same team plans and runs it."
          />

          <div className="mt-10 flex flex-wrap gap-2.5 sm:mt-14">
            {CAPABILITIES.map((capability, index) => (
              <Reveal key={capability} delay={index * 40}>
                <span className="inline-flex rounded-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink sm:px-5 sm:py-3">
                  {capability}
                </span>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------ Process ----------------------------- */}
      <Section>
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="lg:sticky lg:top-32">
                  <Eyebrow>Process</Eyebrow>
                  <Display size="sm" className="mt-6">
                    How we design an experience.
                  </Display>
                  <Lead className="mt-6 max-w-xs text-base">
                    Five stages, and you have the same producer through all of
                    them.
                  </Lead>
                </div>
              </Reveal>
            </div>

            <ol className="lg:col-span-8">
              {PROCESS.map((step, index) => (
                <Reveal key={step.title} delay={index * 60} as="li">
                  <div className="grid grid-cols-[2.5rem_1fr] gap-5 border-t border-line py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-9">
                    <span className="font-[family-name:var(--font-display)] text-xl leading-none tabular-nums text-gold sm:text-3xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 leading-relaxed text-body">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Rule className="mx-auto mb-10 w-16 bg-gold" />
            <Display size="sm" className="text-white">
              Not sure which arm you need?
            </Display>
            <Lead className="mx-auto mt-6 max-w-xl text-white/70">
              Describe the moment you are planning. We will tell you which team
              should run it, or whether it needs both.
            </Lead>
            <div className="mt-9 flex justify-center">
              <CTA href="/contact" className="bg-white text-ink hover:bg-white/90">
                Talk it through
              </CTA>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
