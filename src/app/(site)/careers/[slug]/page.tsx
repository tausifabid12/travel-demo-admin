import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import {
  getRoleBySlug,
  getRoleSlugs,
  getOpenRoles,
  getSettings,
} from "@/lib/queries";
import { buildMetadata, jsonLd, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  Pill,
  RichText,
  SectionHeading,
  TextLink,
  CTA,
} from "@/components/site/primitives";
import { PageHero } from "@/components/site/heroes";
import { RoleCard } from "@/components/site/cards";
import { ApplicationForm } from "@/components/site/forms";
import Reveal from "@/components/site/Reveal";

export async function generateStaticParams() {
  const slugs = await getRoleSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [role, settings] = await Promise.all([getRoleBySlug(slug), getSettings()]);
  if (!role) return { title: "Role not found" };

  return buildMetadata({
    seo: role.seo,
    title: `${role.jobTitle} — ${role.location}`,
    description: role.summary,
    path: `/careers/${role.slug}`,
    settings,
  });
}

export default async function RolePage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const role = await getRoleBySlug(slug);
  if (!role) notFound();

  const [others, settings] = await Promise.all([getOpenRoles(), getSettings()]);
  const otherRoles = others.filter((r) => r.slug !== role.slug).slice(0, 3);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
    { name: role.jobTitle, path: `/careers/${role.slug}` },
  ];

  const jobSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.jobTitle,
    description: role.description,
    employmentType: role.type.toUpperCase().replace("-", "_"),
    ...(role.applicationDeadline ? { validThrough: role.applicationDeadline } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: settings.siteTitle,
      sameAs: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: role.location },
    },
  };

  return (
    <>
      <PageHero
        eyebrow={role.department}
        title={role.jobTitle}
        lead={role.summary}
        breadcrumbs={trail.map((c) => ({ label: c.name, href: c.path }))}
        actions={<CTA href="#apply">Apply for this role</CTA>}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{role.type}</Pill>
                    <Pill>{role.location}</Pill>
                    <Pill>{role.department}</Pill>
                  </div>

                  {role.applicationDeadline && (
                    <p className="mt-6 text-sm text-muted">
                      Applications close{" "}
                      <span className="text-ink">
                        {formatDate(role.applicationDeadline)}
                      </span>
                    </p>
                  )}

                  <div className="mt-8 hidden lg:block">
                    <CTA href="#apply" variant="outline">
                      Apply now
                    </CTA>
                  </div>
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-8">
              <Reveal>
                <Eyebrow>The role</Eyebrow>
                <div className="mt-6">
                  <RichText html={role.description} />
                </div>
              </Reveal>

              {role.requirements.length > 0 && (
                <Reveal delay={80}>
                  <div className="mt-14">
                    <Eyebrow>What we are looking for</Eyebrow>
                    <ul className="mt-6 flex flex-col gap-4">
                      {role.requirements.map((item) => (
                        <li key={item} className="flex items-start gap-3.5">
                          <Check className="mt-1 size-4 shrink-0 text-gold" />
                          <span className="leading-relaxed text-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              {role.benefits.length > 0 && (
                <Reveal delay={120}>
                  <div className="mt-14">
                    <Eyebrow>What you get</Eyebrow>
                    <ul className="mt-6 flex flex-col gap-4">
                      {role.benefits.map((item) => (
                        <li key={item} className="flex items-start gap-3.5">
                          <Check className="mt-1 size-4 shrink-0 text-green-700" />
                          <span className="leading-relaxed text-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="apply" className="border-y border-line bg-surface">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <Reveal>
                <Eyebrow>Apply</Eyebrow>
                <Display size="sm" className="mt-6">
                  Tell us why this one.
                </Display>
                <p className="mt-6 leading-relaxed text-body">
                  We read every application ourselves. A short, specific note
                  goes a long way further than a long generic one.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={100}>
                <ApplicationForm careerId={role._id} jobTitle={role.jobTitle} />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {otherRoles.length > 0 && (
        <Section>
          <Container size="wide">
            <SectionHeading
              eyebrow="Other roles"
              title="Also hiring for."
              action={<TextLink href="/careers">All roles</TextLink>}
            />
            <div className="mt-10">
              {otherRoles.map((item, index) => (
                <Reveal key={item._id} delay={index * 60}>
                  <RoleCard role={item} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(jobSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(trail))}
      />
    </>
  );
}
