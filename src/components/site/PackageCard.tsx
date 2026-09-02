import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicPackage } from "@/lib/queries";

/** Whole rupees — a holiday price with decimals looks like an invoice. */
export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const BADGE_TONES: Record<string, string> = {
  Bestseller: "bg-brand text-white",
  New: "bg-grape text-white",
  "Limited seats": "bg-gold text-ink",
  "Free cancellation": "bg-leaf text-white",
  "Group discount": "bg-accent text-white",
};

export function PriceBlock({
  pkg,
  size = "md",
}: {
  pkg: PublicPackage;
  size?: "sm" | "md";
}) {
  // A written note (e.g. "On request") always wins over a number.
  if (pkg.priceIndicator) {
    return (
      <span
        className={cn(
          "font-semibold text-accent",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {pkg.priceIndicator}
      </span>
    );
  }

  if (!pkg.priceFrom) return null;

  const hasSaving = Boolean(pkg.strikePrice && pkg.strikePrice > pkg.priceFrom);
  const saving = hasSaving
    ? Math.round(((pkg.strikePrice! - pkg.priceFrom) / pkg.strikePrice!) * 100)
    : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-[0.6875rem] text-muted">from</span>
      <span
        className={cn(
          "font-bold tracking-tight text-brand",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {formatPrice(pkg.priceFrom, pkg.currency)}
      </span>
      {hasSaving && (
        <>
          <span className="text-xs text-muted line-through">
            {formatPrice(pkg.strikePrice!, pkg.currency)}
          </span>
          <span className="rounded bg-leaf-soft px-1.5 py-0.5 text-[0.625rem] font-semibold text-leaf">
            {saving}% off
          </span>
        </>
      )}
    </div>
  );
}

export function Rating({
  rating,
  reviewCount,
  className,
}: {
  rating?: number;
  reviewCount?: number;
  className?: string;
}) {
  if (!rating) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star className="size-3.5 fill-gold text-gold" />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      {reviewCount ? (
        <span className="text-muted">({reviewCount.toLocaleString()})</span>
      ) : null}
    </span>
  );
}

export default function PackageCard({
  pkg,
  priority,
}: {
  pkg: PublicPackage;
  priority?: boolean;
}) {
  const nights = pkg.durationNights ?? (pkg.durationDays ? pkg.durationDays - 1 : 0);

  return (
    <Link
      href={`/travelxl/${pkg.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface",
        "border border-line shadow-[var(--shadow-sm)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-md)]",
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-elevated">
        {pkg.heroImage ? (
          <Image
            src={pkg.heroImage}
            alt={pkg.title}
            fill
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-accent/20" />
        )}

        {pkg.badge && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide shadow-sm",
              BADGE_TONES[pkg.badge] ?? "bg-ink text-white",
            )}
          >
            {pkg.badge}
          </span>
        )}

        {nights > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[0.625rem] font-medium text-white backdrop-blur-sm">
            <Moon className="size-3" />
            {nights}N / {pkg.durationDays ?? nights + 1}D
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {pkg.destinationId?.name && (
          <span className="mb-1 inline-flex items-center gap-1 text-[0.625rem] font-medium text-accent">
            <MapPin className="size-3" />
            {pkg.destinationId.name}
          </span>
        )}

        <h3 className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-ink group-hover:text-brand sm:text-sm">
          {pkg.title}
        </h3>

        {pkg.rating ? (
          <Rating
            rating={pkg.rating}
            reviewCount={pkg.reviewCount}
            className="mt-1.5"
          />
        ) : null}

        {/* mt-auto pins the price to the bottom so a row of cards aligns. */}
        <div className="mt-auto pt-2.5">
          <PriceBlock pkg={pkg} />
          {pkg.priceFrom ? (
            <p className="text-[0.625rem] text-muted">per person</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
