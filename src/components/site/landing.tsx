import Image from "next/image";
import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Container,
  Display,
  Eyebrow,
  Lead,
  Section,
  SectionHeading,
  CTA,
} from "@/components/site/primitives";
import Reveal from "@/components/site/Reveal";
import { Counter } from "@/components/site/LandingClient";

/* -------------------------------- Media ------------------------------- */

/**
 * Builds an Unsplash CDN URL from a photo id.
 *
 * Landing-page imagery is referenced by id rather than by full URL so the
 * width and quality stay consistent everywhere, and so a page can swap the
 * whole set by changing one list.
 */
export function unsplash(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/* ------------------------------- Marquee ------------------------------ */

/**
 * Endless phrase strip that separates two sections. The track is duplicated
 * because the `marquee` keyframes translate by exactly -50%.
 */
export function Marquee({
  items,
  tone = "dark",
}: {
  items: string[];
  tone?: "dark" | "light";
}) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "marquee overflow-hidden border-y py-5",
        tone === "dark" ? "border-white/10 bg-ink" : "border-line bg-tint",
      )}
    >
      <div className="marquee-track flex w-max items-center gap-10 pr-10">
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={cn(
              "flex shrink-0 items-center gap-10 font-[family-name:var(--font-display)] text-xl sm:text-2xl",
              tone === "dark" ? "text-white/80" : "text-ink",
            )}
          >
            {item}
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Stat band ----------------------------- */

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note?: string;
};

export function StatBand({
  eyebrow,
  title,
  lead,
  stats,
  image,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  stats: Stat[];
  image?: string;
}) {
  return (
    <Section className="border-y border-line bg-surface">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
              <Display size="md" className="mt-6">
                {title}
              </Display>
              <Lead className="mt-6 max-w-xl">{lead}</Lead>
            </Reveal>

            {image && (
              <Reveal delay={120}>
                <div className="relative mt-9 aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)]">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    className="object-cover"
                  />
                  <div className="scrim absolute inset-0" aria-hidden />
                </div>
              </Reveal>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:col-span-6">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 80}>
                <p className="font-[family-name:var(--font-display)] text-4xl leading-none text-ink sm:text-5xl">
                  <Counter
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-3 text-sm font-semibold text-ink">{stat.label}</p>
                {stat.note && (
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {stat.note}
                  </p>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Pillar grid ---------------------------- */

export type Pillar = { title: string; body: string };

/** Numbered capability cards — the "what makes us different" block. */
export function PillarGrid({
  eyebrow,
  title,
  lead,
  action,
  items,
  media,
  columns = "lg:grid-cols-3",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  items: Pillar[];
  /** Optional photo tile that takes the first cell of the grid. */
  media?: { image: string; caption?: string };
  columns?: string;
}) {
  return (
    <Section>
      <Container size="wide">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} action={action} />

        <div className={cn("mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2", columns)}>
          {media && (
            <Reveal className="sm:col-span-2 lg:col-span-1">
              <div className="group relative h-full min-h-[15rem] overflow-hidden rounded-[var(--radius-lg)]">
                <Image
                  src={media.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
                  aria-hidden
                />
                {media.caption && (
                  <p className="absolute inset-x-0 bottom-0 p-6 font-[family-name:var(--font-display)] text-xl text-white">
                    {media.caption}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          {items.map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) * 80}>
              <div className="group h-full rounded-[var(--radius-lg)] border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-md)]">
                <span className="font-[family-name:var(--font-display)] text-sm text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------- Split feature --------------------------- */

export function SplitFeature({
  image,
  eyebrow,
  title,
  body,
  points,
  action,
  reverse,
}: {
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  points: { title: string; body: string }[];
  action?: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <Section>
      <Container size="wide">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className={cn(reverse && "lg:order-2")}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
              <div className="scrim absolute inset-0" aria-hidden />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <Display size="md" className="mt-6">
              {title}
            </Display>
            <Lead className="mt-6">{body}</Lead>

            <dl className="mt-9 flex flex-col divide-y divide-line border-y border-line">
              {points.map((point) => (
                <div key={point.title} className="py-5">
                  <dt className="text-sm font-semibold text-ink">{point.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-body">
                    {point.body}
                  </dd>
                </div>
              ))}
            </dl>

            {action && <div className="mt-9">{action}</div>}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- People grid ---------------------------- */

export type Person = { name: string; role: string; note?: string; image?: string };

/**
 * Speaker / chauffeur cards. A portrait fills the tile when one is supplied
 * and a typographic monogram stands in when it is not, so the section still
 * reads as designed before the real photography arrives.
 */
export function PeopleGrid({
  eyebrow,
  title,
  lead,
  people,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  people: Person[];
}) {
  return (
    <Section className="border-y border-line bg-tint">
      <Container size="wide">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-3">
          {people.map((person, index) => (
            <Reveal key={person.name} delay={(index % 3) * 80}>
              <div className="group h-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[radial-gradient(24rem_16rem_at_30%_0%,rgb(255_77_48/0.16),transparent_70%),linear-gradient(140deg,#16181d,#1f2733)] sm:aspect-[4/3]">
                  {person.image ? (
                    <>
                      <Image
                        src={person.image}
                        alt={person.name}
                        fill
                        sizes="(min-width: 1024px) 24vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-4xl text-white/90 sm:text-5xl">
                      {person.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-ink">
                    {person.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-brand">
                    {person.role}
                  </p>
                  {person.note && (
                    <p className="mt-3 text-sm leading-relaxed text-body">
                      {person.note}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Testimonials --------------------------- */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};

export function Testimonials({
  eyebrow,
  title,
  items,
  trustLine,
}: {
  eyebrow: string;
  title: string;
  items: Testimonial[];
  trustLine?: string;
}) {
  return (
    <Section>
      <Container size="wide">
        <SectionHeading eyebrow={eyebrow} title={title} align="center" />

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.name} delay={(index % 2) * 80}>
              <figure className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-7">
                <Quote className="size-6 text-brand/40" aria-hidden />
                <blockquote className="mt-5 grow text-sm leading-relaxed text-body">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-line pt-5">
                  {item.avatar && (
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      {item.name}
                    </span>
                    <span className="block text-xs text-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {trustLine && (
          <p className="mt-10 flex items-center justify-center gap-2 text-sm text-body">
            <span className="flex" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-4 fill-gold text-gold" />
              ))}
            </span>
            {trustLine}
          </p>
        )}
      </Container>
    </Section>
  );
}

/* ------------------------------- Mosaic ------------------------------- */

export type MosaicItem = {
  image: string;
  title: string;
  note?: string;
  href?: string;
};

/**
 * Asymmetric photo grid — the first tile runs tall and the rest fill in
 * around it, which breaks up a page that would otherwise be all text blocks.
 */
export function ImageMosaic({
  eyebrow,
  title,
  lead,
  action,
  items,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  items: MosaicItem[];
}) {
  if (items.length === 0) return null;

  return (
    <Section>
      <Container size="wide">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} action={action} />

        <div className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:mt-14 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4">
          {items.slice(0, 5).map((item, index) => (
            <Reveal
              key={item.title}
              delay={(index % 3) * 80}
              className={cn(
                // The lead tile is twice the height and, on wide screens,
                // twice the width — everything else tiles around it.
                index === 0 && "col-span-2 row-span-2",
              )}
            >
              <MosaicTile item={item} large={index === 0} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function MosaicTile({ item, large }: { item: MosaicItem; large?: boolean }) {
  const inner = (
    <>
      <Image
        src={item.image}
        alt=""
        fill
        sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p
          className={cn(
            "font-[family-name:var(--font-display)] text-white",
            large ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {item.title}
        </p>
        {item.note && (
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/60">
            {item.note}
          </p>
        )}
      </div>
    </>
  );

  const className =
    "group relative block size-full overflow-hidden rounded-[var(--radius-card)]";

  return item.href ? (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/* --------------------------------- FAQ -------------------------------- */

export type FaqItem = { q: string; a: string };

/**
 * Numbered accordion. Built on `<details>`, so it opens without client
 * JavaScript and stays keyboard- and search-friendly.
 */
export function Faq({
  eyebrow,
  title,
  lead,
  action,
  items,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  items: FaqItem[];
}) {
  return (
    <Section className="border-y border-line bg-surface">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
              <Display size="md" className="mt-6">
                {title}
              </Display>
              {lead && <Lead className="mt-6 max-w-md">{lead}</Lead>}
              {action && <div className="mt-8">{action}</div>}
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-line border-y border-line">
              {items.map((item, index) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start gap-4 text-ink [&::-webkit-details-marker]:hidden">
                    <span className="mt-0.5 font-[family-name:var(--font-display)] text-sm text-brand">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="grow text-sm font-semibold sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className="relative mt-1.5 size-3.5 shrink-0 text-brand"
                      aria-hidden
                    >
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="mt-3 pl-9 pr-8 text-sm leading-relaxed text-body">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------- CTA band ----------------------------- */

export function CtaBand({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  image,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Optional photograph behind the band, dimmed so the copy stays legible. */
  image?: string;
}) {
  return (
    <Section className="relative overflow-hidden bg-ink">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-ink/55" aria-hidden />
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,rgb(255_77_48/0.28),transparent_65%),radial-gradient(50rem_34rem_at_100%_110%,rgb(11_124_140/0.35),transparent_60%)]"
        aria-hidden
      />
      <Container size="narrow" className="relative text-center">
        <Reveal>
          <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
          <Display size="md" className="mt-7 text-white">
            {title}
          </Display>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {lead}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <CTA href={primary.href} className="bg-white text-ink hover:bg-white/90">
              {primary.label}
            </CTA>
            {secondary && (
              <CTA href={secondary.href} variant="light">
                {secondary.label}
              </CTA>
            )}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
