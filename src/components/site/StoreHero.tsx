import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Headphones } from "lucide-react";
import { Container } from "@/components/site/primitives";
import SearchBar from "@/components/site/SearchBar";

const TRUST = [
  { icon: ShieldCheck, label: "Handpicked stays" },
  { icon: Sparkles, label: "Customised, not templated" },
  { icon: Headphones, label: "On-trip support" },
];

/**
 * Storefront hero: a photograph, one promise, and a search box — the shape a
 * shopper expects on a booking site.
 */
export default function StoreHero({
  image,
  video,
  headline,
  subheadline,
  destinations,
  quickLinks,
}: {
  image?: string;
  video?: string;
  headline: string;
  subheadline: string;
  destinations: { name: string; region: string }[];
  quickLinks: { label: string; href: string }[];
}) {
  return (
    <section
      data-hero
      className="relative flex min-h-[26rem] items-end overflow-hidden bg-deep sm:min-h-[30rem] lg:min-h-[34rem]"
    >
      {video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={image}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : image ? (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      {/* Warm scrim: dark enough for white type, warm enough to feel like a holiday. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/75"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_80%_0%,rgb(255_77_48/0.35),transparent_60%)]"
        aria-hidden
      />

      <Container size="wide" className="relative w-full pb-8 pt-24 sm:pb-10 sm:pt-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            <Sparkles className="size-3" />
            Holidays, honeymoons and group getaways
          </span>

          <h1 className="mt-3.5 text-balance font-[family-name:var(--font-display)] text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em] text-white">
            {headline}
          </h1>

          <p className="mt-2.5 max-w-lg text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
            {subheadline}
          </p>
        </div>

        <div className="mt-5 sm:mt-6">
          <SearchBar destinations={destinations} />
        </div>

        {quickLinks.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <span className="hidden text-xs text-white/55 sm:inline">Popular:</span>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {TRUST.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 text-[0.6875rem] text-white/75 sm:text-xs"
            >
              <Icon className="size-3.5 text-gold" />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

