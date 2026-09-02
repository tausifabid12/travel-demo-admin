import Link from "next/link";
import Image from "next/image";
import {
  Waves,
  Heart,
  Users,
  Mountain,
  Binoculars,
  Building2,
  Ship,
  Flower2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/site/primitives";
import { formatPrice } from "@/components/site/PackageCard";
import type { PublicDestination, PublicPackage } from "@/lib/queries";

/* ------------------------------ Theme row ----------------------------- */

const THEME_ICONS: Record<string, { icon: LucideIcon; tint: string }> = {
  Beach: { icon: Waves, tint: "bg-[#e0f4fb] text-[#0b7c8c]" },
  Honeymoon: { icon: Heart, tint: "bg-[#fde7f2] text-berry" },
  Family: { icon: Users, tint: "bg-[#fff1e2] text-[#c9740a]" },
  Adventure: { icon: Mountain, tint: "bg-[#e8f8ef] text-leaf" },
  Wildlife: { icon: Binoculars, tint: "bg-[#eef3e2] text-[#5c7a29]" },
  "City break": { icon: Building2, tint: "bg-[#eeeafc] text-grape" },
  Cruise: { icon: Ship, tint: "bg-[#e3f0ff] text-[#1e63c4]" },
  Wellness: { icon: Flower2, tint: "bg-[#fff0ec] text-brand" },
};

/** Icon shortcuts, the row every booking site puts under its hero. */
export function ThemeRow({ themes }: { themes: string[] }) {
  return (
    <div
      className={cn(
        // Swipeable on a phone, evenly spread from sm up.
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "-mx-4 px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible sm:px-0 lg:grid-cols-8",
      )}
    >
      {themes.map((theme) => {
        const meta = THEME_ICONS[theme] ?? {
          icon: Waves,
          tint: "bg-elevated text-brand",
        };
        const Icon = meta.icon;
        return (
          <Link
            key={theme}
            href={`/travelxl?theme=${encodeURIComponent(theme)}`}
            className="group flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-auto"
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 sm:size-12",
                meta.tint,
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <span className="text-center text-[0.625rem] font-medium leading-tight text-ink sm:text-[0.6875rem]">
              {theme}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* --------------------------- Destination tile ------------------------- */

export function DestinationTile({
  destination,
  packages,
  large,
  href,
}: {
  destination: PublicDestination;
  packages: PublicPackage[];
  large?: boolean;
  /** Defaults to the filtered listing; pass a slug URL for the detail page. */
  href?: string;
}) {
  const mine = packages.filter(
    (p) => p.destinationId?.name === destination.name,
  );
  const cheapest = mine
    .map((p) => p.priceFrom)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b)[0];

  return (
    <Link
      href={href ?? `/travelxl?destination=${encodeURIComponent(destination.name)}`}
      className={cn(
        "group relative block overflow-hidden rounded-[var(--radius-card)]",
        large ? "aspect-4/5 sm:aspect-4/3" : "aspect-4/5",
      )}
    >
      {destination.heroImage ? (
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          sizes={large ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-grape" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-white/70">
          {destination.region}
        </p>
        <p
          className={cn(
            "mt-0.5 font-[family-name:var(--font-display)] text-white",
            large ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
          )}
        >
          {destination.name}
        </p>

        <div className="mt-1 flex items-center gap-2">
          {cheapest ? (
            <span className="rounded bg-white/95 px-1.5 py-0.5 text-[0.625rem] font-semibold text-brand">
              from {formatPrice(cheapest, "INR")}
            </span>
          ) : mine.length > 0 ? (
            <span className="rounded bg-white/95 px-1.5 py-0.5 text-[0.625rem] font-semibold text-ink">
              {mine.length} {mine.length === 1 ? "package" : "packages"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------ Deal strip ---------------------------- */

/** A coloured promo band, used to break up long runs of white cards. */
export function PromoBand({
  eyebrow,
  title,
  body,
  href,
  cta,
  image,
  tone = "brand",
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image?: string;
  tone?: "brand" | "accent" | "grape" | "berry";
}) {
  const tones = {
    brand: "from-[#ff6a4d] to-[#ff4d30]",
    accent: "from-[#0f9aad] to-[#0b7c8c]",
    grape: "from-[#8358e0] to-[#6d3bd4]",
    berry: "from-[#e8479f] to-[#c01f78]",
  };

  return (
    <Container size="wide">
      <div
        className={cn(
          "relative grid overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br lg:grid-cols-2",
          tones[tone],
        )}
      >
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-white/75">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-balance font-[family-name:var(--font-display)] text-xl leading-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-white/85 sm:text-sm">
            {body}
          </p>
          <Link
            href={href}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-transform duration-300 hover:translate-x-0.5"
          >
            {cta}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {image && (
          <div className="relative min-h-[9rem] lg:min-h-full">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Feathers the photo into the gradient rather than butting against it. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent lg:bg-gradient-to-r lg:from-[rgba(0,0,0,0.35)] lg:to-transparent" />
          </div>
        )}
      </div>
    </Container>
  );
}

/* ---------------------------- Section header -------------------------- */

export function ShelfHeader({
  title,
  subtitle,
  href,
  linkLabel = "See all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-5 sm:mb-5">
      <div>
        <h2 className="text-balance font-[family-name:var(--font-display)] text-lg leading-tight text-ink sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[0.8125rem] text-body sm:text-sm">{subtitle}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="shrink-0 whitespace-nowrap text-[0.8125rem] font-semibold text-brand hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
