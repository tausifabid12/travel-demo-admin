import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, MapPin, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type {
  PublicPackage,
  PublicCaseStudy,
  PublicInsight,
  PublicCareer,
} from "@/lib/queries";

/* ------------------------------ Building blocks ----------------------- */

function CardImage({
  src,
  alt,
  ratio = "4/3",
  priority,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw",
  className,
}: {
  src?: string;
  alt: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-elevated", className)}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-elevated to-gold/15" />
      )}
    </div>
  );
}

/** Category chip that floats over an image. */
function ImageBadge({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "gold";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] backdrop-blur-md",
        tone === "gold"
          ? "bg-gold/90 text-white"
          : "bg-white/85 text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Package card -------------------------- */

export function PackageCard({
  pkg,
  priority,
}: {
  pkg: PublicPackage;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/travelxl/${pkg.slug}`}
      className="lift group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-sm)]"
    >
      <div className="relative">
        <CardImage src={pkg.heroImage} alt={pkg.title} priority={priority} />

        {/* Scrim keeps the chips legible whatever the photograph does. */}
        <div className="scrim pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
          <ImageBadge tone="gold">{pkg.category}</ImageBadge>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-white/90 sm:inset-x-4 sm:bottom-4">
          {pkg.destinationId?.name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3" /> {pkg.destinationId.name}
            </span>
          )}
          {pkg.durationDays ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" /> {pkg.durationDays} days
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug text-ink text-balance sm:text-xl">
          <span className="underline-sweep">{pkg.title}</span>
        </h3>

        {pkg.summary && (
          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-body sm:text-sm">
            {pkg.summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <span className="text-xs font-medium text-accent sm:text-sm">
            {pkg.priceIndicator || "On request"}
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------- Case study card ------------------------- */

export function CaseStudyCard({
  study,
  large,
}: {
  study: PublicCaseStudy;
  large?: boolean;
}) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className="lift group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-sm)]"
    >
      <div className="relative">
        <CardImage
          src={study.heroImage}
          alt={study.title}
          ratio={large ? "16/10" : "4/3"}
          sizes={
            large
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 640px) 50vw, 33vw"
          }
        />
        <div className="scrim pointer-events-none absolute inset-x-0 bottom-0 h-3/4" />

        <div className="absolute left-2 top-2">
          <ImageBadge>{study.serviceCategory}</ImageBadge>
        </div>

        <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-gold">
            {study.industry}
          </p>
          <h3
            className={cn(
              "mt-1.5 font-[family-name:var(--font-display)] leading-snug text-white text-balance",
              large ? "text-2xl sm:text-4xl" : "text-lg sm:text-2xl",
            )}
          >
            {study.title}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-xs text-muted sm:text-sm">{study.clientName}</p>

        {study.summary && (
          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-body sm:text-sm">
            {study.summary}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent sm:text-sm">
          Read the story
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

/* ----------------------------- Insight card --------------------------- */

export function InsightCard({ insight }: { insight: PublicInsight }) {
  return (
    <Link
      href={`/insights/${insight.slug}`}
      className="lift group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-sm)]"
    >
      <div className="relative">
        <CardImage src={insight.featuredImage} alt={insight.title} ratio="3/2" />
        <div className="absolute left-2 top-2">
          <ImageBadge>{insight.category}</ImageBadge>
        </div>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap items-center gap-x-2.5 text-[0.5625rem] uppercase tracking-[0.12em] text-muted">
          <span>{formatDate(insight.publishDate)}</span>
          {insight.readingMinutes ? (
            <span className="text-brand">{insight.readingMinutes} min read</span>
          ) : null}
        </div>

        <h3 className="mt-2 line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-ink sm:text-sm">
          <span className="underline-sweep">{insight.title}</span>
        </h3>

        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-body sm:text-sm">
          {insight.excerpt}
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent sm:text-sm">
          Read article
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------- Role card ---------------------------- */

export function RoleCard({ role }: { role: PublicCareer }) {
  return (
    <Link
      href={`/careers/${role.slug}`}
      className="lift group flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center sm:gap-8 sm:p-7"
    >
      <div className="flex-1">
        <h3 className="font-[family-name:var(--font-display)] text-xl leading-snug text-ink sm:text-2xl">
          <span className="underline-sweep">{role.jobTitle}</span>
        </h3>
        {role.summary && (
          <p className="mt-2 max-w-2xl text-sm text-body">{role.summary}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-64">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.6875rem] font-medium text-accent">
          {role.department}
        </span>
        <span className="rounded-full bg-elevated px-3 py-1 text-[0.6875rem] text-body">
          {role.location}
        </span>
        <span className="rounded-full bg-gold-soft px-3 py-1 text-[0.6875rem] font-medium text-gold">
          {role.type}
        </span>
      </div>

      <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white sm:grid">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}

/* --------------------------- Destination tile ------------------------- */

export function DestinationTile({
  name,
  region,
  image,
  href,
  count,
}: {
  name: string;
  region: string;
  image?: string;
  href: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="lift group relative block overflow-hidden rounded-[var(--radius-card)]"
      style={{ aspectRatio: "3/4" }}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-plum" />
      )}

      <div className="scrim absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-[0.625rem] uppercase tracking-[0.16em] text-gold">
          {region}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">
          {name}
        </p>
        {count !== undefined && count > 0 && (
          <p className="mt-1 text-xs text-white/70">
            {count} {count === 1 ? "experience" : "experiences"}
          </p>
        )}
      </div>
    </Link>
  );
}
