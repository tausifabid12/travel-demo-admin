import type { Metadata } from "next";
import { getOpenRoles, getSettings } from "@/lib/queries";
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
import { RoleCard } from "@/components/site/cards";
import FilterBar from "@/components/site/FilterBar";
import Reveal from "@/components/site/Reveal";

const CULTURE = [
  {
    title: "Ownership, not escalation",
    body: "When something breaks at 2am in another timezone, the person closest to it decides. We back that decision afterwards.",
  },
  {
    title: "Small teams, big programmes",
    body: "You will not be the fourteenth name on a project. Most programmes run with three or four people who each hold a real part of it.",
  },
  {
    title: "We travel",
    body: "Recces, site visits and live delivery. If you want a desk job, this is not one.",
  },
  {
    title: "Straight feedback",
    body: "Delivered in private, quickly, and about the work. Nobody here finds out how they are doing at appraisal time.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Careers",
    description:
      "Open roles at Bhancer, and what it is actually like to work on corporate travel and live experience programmes here.",
    path: "/careers",
    settings,
  });
}

export default async function CareersPage({
  searchParams,
}: PageProps<"/careers">) {
  const params = await searchParams;
  const department =
    typeof params.department === "string" ? params.department : undefined;
  const location = typeof params.location === "string" ? params.location : undefined;

  const [all, filtered] = await Promise.all([
    getOpenRoles(),
    getOpenRoles({ department, location }),
  ]);

  const departments = [...new Set(all.map((r) => r.department))].sort();
  const locations = [...new Set(all.map((r) => r.location))].sort();

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join Bhancer."
        lead="We hire people who would rather own a problem than escalate it — and who care whether the room felt right."
        actions={<CTA href="#roles">See open roles</CTA>}
      />

      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow="Life at Bhancer"
            title="What it is actually like."
          />

          <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 sm:grid-cols-2">
            {CULTURE.map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 80}>
                <Rule className="mb-5" />
                <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="roles" className="bg-surface border-y border-line">
        <Container size="wide">
          <SectionHeading eyebrow="Open positions" title="Roles we are hiring for." />

          {all.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-ink">
                Nothing open right now.
              </p>
              <p className="mt-3 text-body">
                Send us your CV anyway — we keep good people on file.
              </p>
              <div className="mt-8 flex justify-center">
                <CTA href="/contact">Introduce yourself</CTA>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-10">
                <FilterBar
                  groups={[
                    { param: "department", label: "Team", options: departments },
                    { param: "location", label: "Location", options: locations },
                  ]}
                  resultCount={filtered.length}
                  noun="roles"
                />
              </div>

              <div className="mt-4">
                {filtered.map((role, index) => (
                  <Reveal key={role._id} delay={index * 60}>
                    <RoleCard role={role} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>

      <Section className="bg-ink">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Eyebrow className="justify-center">Nothing quite right?</Eyebrow>
            <Display size="sm" className="mt-6 text-white">
              Tell us what you would want to do here.
            </Display>
            <Lead className="mt-6 text-white/70">
              We have built roles around people before. If you can make a clear
              case, we will read it.
            </Lead>
            <div className="mt-9 flex justify-center">
              <CTA href="/contact" className="bg-white text-ink hover:bg-white/90">
                Get in touch
              </CTA>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
