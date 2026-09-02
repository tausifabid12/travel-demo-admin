import Link from "next/link";
import { Check, Clock, MapPin, ShieldCheck, MessageCircle } from "lucide-react";
import { PriceBlock, Rating } from "@/components/site/PackageCard";
import type { PublicPackage } from "@/lib/queries";

/**
 * The buy box. Sticky on desktop so the price and the primary action stay in
 * view while the itinerary is read.
 */
export default function BookingWidget({ pkg }: { pkg: PublicPackage }) {
  const nights = pkg.durationNights ?? (pkg.durationDays ? pkg.durationDays - 1 : 0);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-md)]">
        <div className="border-b border-line p-4">
          <PriceBlock pkg={pkg} />
          {pkg.priceFrom ? (
            <p className="mt-0.5 text-[0.6875rem] text-muted">
              per person, twin sharing
            </p>
          ) : null}

          {pkg.rating ? (
            <Rating
              rating={pkg.rating}
              reviewCount={pkg.reviewCount}
              className="mt-2"
            />
          ) : null}
        </div>

        <ul className="flex flex-col gap-2 border-b border-line p-4 text-sm text-body">
          {nights > 0 && (
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 shrink-0 text-brand" />
              {nights} nights / {pkg.durationDays ?? nights + 1} days
            </li>
          )}
          {pkg.destinationId?.name && (
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-brand" />
              {pkg.destinationId.name}
              {pkg.destinationId.region ? `, ${pkg.destinationId.region}` : ""}
            </li>
          )}
          <li className="flex items-center gap-2.5">
            <Check className="size-4 shrink-0 text-leaf" />
            Fully customisable itinerary
          </li>
        </ul>

        <div className="flex flex-col gap-2 p-4">
          <Link
            href={`/book/${pkg.slug}`}
            className="w-full rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Request to book
          </Link>
          <Link
            href="#enquire"
            className="w-full rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Ask a question first
          </Link>

          <p className="mt-1 flex items-start gap-2 text-[0.6875rem] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-leaf" />
            No payment now. A consultant confirms availability and sends a firm
            quote before anything is booked.
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <MessageCircle className="size-3.5" />
        Prefer to talk it through? <Link href="/contact" className="font-semibold text-brand hover:underline">Call us</Link>
      </p>
    </div>
  );
}
