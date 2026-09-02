import { Container, Section, Display, Eyebrow } from "@/components/site/primitives";

/**
 * Shared shell for the three legal pages. The copy is a starting point drafted
 * for a corporate travel business — have a lawyer review it before launch.
 */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: { heading: string; body: React.ReactNode }[];
}) {
  return (
    <Section className="pt-32 sm:pt-40">
      <Container size="narrow">
        <Eyebrow>{eyebrow}</Eyebrow>

        <Display as="h1" size="md" className="mt-6">
          {title}
        </Display>

        <p className="mt-6 text-sm text-muted">Last updated {updated}</p>

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                {section.heading}
              </h2>
              <div className="prose-site mt-4 max-w-none">{section.body}</div>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}
