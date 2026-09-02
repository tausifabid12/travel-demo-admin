import Link from "next/link";
import { Container, Section, Display, Eyebrow, Lead, CTA } from "@/components/site/primitives";

const SUGGESTIONS = [
  { label: "Experiences", href: "/travelxl" },
  { label: "Our work", href: "/work" },
  { label: "Insights", href: "/insights" },
  { label: "Careers", href: "/careers" },
];

export default function NotFound() {
  return (
    <Section className="pt-36 sm:pt-44">
      <Container size="narrow" className="text-center">
        <Eyebrow className="justify-center">404</Eyebrow>

        <Display as="h1" size="md" className="mt-7">
          That page has moved on.
        </Display>

        <Lead className="mx-auto mt-7 max-w-md">
          The link may be old, or the experience may have been retired. Here is
          where most people are heading.
        </Lead>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-line px-5 py-2.5 text-sm text-body transition-colors hover:border-ink hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <CTA href="/">Back to the homepage</CTA>
        </div>
      </Container>
    </Section>
  );
}
