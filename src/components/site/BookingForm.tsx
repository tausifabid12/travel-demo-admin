"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Check, AlertCircle, Minus, Plus, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { INITIAL_FORM_STATE } from "@/app/actions";
import { submitPurchase } from "@/app/actions/purchase";
import { BOOKING_ADD_ONS, ROOM_PREFERENCES } from "@/lib/constants";
import { formatPrice } from "@/components/site/PackageCard";
import type { PublicPackage } from "@/lib/queries";

const FIELD = [
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink",
  "placeholder:text-muted/70 transition-colors",
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15",
].join(" ");

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-body"
    >
      {children}
      {required && <span className="ml-0.5 text-brand">*</span>}
    </label>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-brand">{errors[0]}</p>;
}

/** Plus/minus stepper — faster than a keyboard on a phone. */
function Stepper({
  name,
  label,
  value,
  min,
  onChange,
}: {
  name: string;
  label: string;
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="grid size-7 place-items-center rounded-full border border-line text-body transition-colors hover:border-brand hover:text-brand disabled:opacity-35"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums text-ink">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label}`}
          onClick={() => onChange(value + 1)}
          className="grid size-7 place-items-center rounded-full border border-line text-body transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function SubmitButton({ total }: { total?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
    >
      {pending ? "Sending…" : total ? `Request to book · ${total}` : "Request to book"}
    </button>
  );
}

export default function BookingForm({ pkg }: { pkg: PublicPackage }) {
  const [state, action] = useActionState(submitPurchase, INITIAL_FORM_STATE);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [addOns, setAddOns] = useState<string[]>([]);

  const errors = state.fieldErrors ?? {};
  const travellers = adults + children;
  const total = pkg.priceFrom ? pkg.priceFrom * travellers : undefined;

  if (state.status === "success" && state.reference) {
    return <Confirmation reference={state.reference} pkg={pkg} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-8">
      <form action={action} className="order-2 lg:order-1">
        <input type="hidden" name="packageId" value={pkg._id} />
        <div aria-hidden className="absolute left-[-9999px] size-px overflow-hidden">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {state.status === "error" && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-brand/25 bg-brand-soft p-3.5 text-sm text-ink"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand" />
            {state.message}
          </div>
        )}

        {/* -------------------------- Who is travelling ------------------- */}
        <fieldset className="rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-ink">
            Who is travelling
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Stepper
              name="adults"
              label="Adults"
              value={adults}
              min={1}
              onChange={setAdults}
            />
            <Stepper
              name="children"
              label="Children"
              value={children}
              min={0}
              onChange={setChildren}
            />
          </div>
          <FieldError errors={errors.adults} />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="travelDate">Preferred start date</Label>
              <input
                id="travelDate"
                name="travelDate"
                type="date"
                className={FIELD}
              />
              <FieldError errors={errors.travelDate} />
            </div>
            <div>
              <Label htmlFor="roomPreference">Room preference</Label>
              <select id="roomPreference" name="roomPreference" className={FIELD}>
                <option value="">No preference</option>
                {ROOM_PREFERENCES.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-body">
            <input
              type="checkbox"
              name="flexibleDates"
              className="size-4 rounded border-line accent-[var(--color-brand)]"
            />
            My dates are flexible — show me the best price
          </label>
        </fieldset>

        {/* ------------------------------ Add-ons ------------------------- */}
        <fieldset className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-ink">
            Add to your trip
          </legend>
          <p className="mt-1 text-xs text-muted">
            Optional. We will price these into your quote.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {BOOKING_ADD_ONS.map((addOn) => {
              const on = addOns.includes(addOn);
              return (
                <label
                  key={addOn}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    on
                      ? "border-brand bg-brand-soft text-ink"
                      : "border-line text-body hover:border-brand/40",
                  )}
                >
                  <input
                    type="checkbox"
                    name="addOns"
                    value={addOn}
                    checked={on}
                    onChange={() =>
                      setAddOns(
                        on ? addOns.filter((x) => x !== addOn) : [...addOns, addOn],
                      )
                    }
                    className="size-4 rounded border-line accent-[var(--color-brand)]"
                  />
                  {addOn}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ---------------------------- Your details ---------------------- */}
        <fieldset className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-ink">
            Your details
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="leadName" required>
                Full name
              </Label>
              <input id="leadName" name="leadName" required className={FIELD} />
              <FieldError errors={errors.leadName} />
            </div>
            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={FIELD}
              />
              <FieldError errors={errors.email} />
            </div>
            <div>
              <Label htmlFor="phone" required>
                Phone
              </Label>
              <input id="phone" name="phone" type="tel" required className={FIELD} />
              <FieldError errors={errors.phone} />
            </div>
            <div>
              <Label htmlFor="company">Company (optional)</Label>
              <input id="company" name="company" className={FIELD} />
            </div>
          </div>

          <div className="mt-3">
            <Label htmlFor="specialRequests">Anything else we should know</Label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={3}
              placeholder="Dietary requirements, accessibility needs, a birthday to mark…"
              className={cn(FIELD, "resize-y")}
            />
          </div>
        </fieldset>

        <div className="mt-5 lg:hidden">
          <SubmitButton total={total ? formatPrice(total, pkg.currency) : undefined} />
        </div>
      </form>

      {/* ----------------------------- Summary ---------------------------- */}
      <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
          <div className="border-b border-line p-4">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
              You are booking
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-ink">
              {pkg.title}
            </p>
            {pkg.destinationId?.name && (
              <p className="mt-0.5 text-xs text-muted">
                {pkg.destinationId.name}
                {pkg.durationNights ? ` · ${pkg.durationNights} nights` : ""}
              </p>
            )}
          </div>

          <div className="p-4">
            {pkg.priceFrom ? (
              <>
                <Row
                  label={`${formatPrice(pkg.priceFrom, pkg.currency)} × ${travellers} ${
                    travellers === 1 ? "traveller" : "travellers"
                  }`}
                  value={formatPrice(total!, pkg.currency)}
                />
                {addOns.length > 0 && (
                  <Row label={`${addOns.length} add-on(s)`} value="Quoted" />
                )}
                <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-sm font-semibold text-ink">
                    Indicative total
                  </span>
                  <span className="text-lg font-bold text-brand">
                    {formatPrice(total!, pkg.currency)}
                  </span>
                </div>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-muted">
                  An estimate from the lead-in price. Your final quote depends on
                  dates, availability and anything you add.
                </p>
              </>
            ) : (
              <p className="text-sm text-body">
                This package is priced on request. Send the details and we will
                come back with a costed proposal.
              </p>
            )}

            <div className="mt-4 hidden lg:block">
              <SubmitButton
                total={total ? formatPrice(total, pkg.currency) : undefined}
              />
            </div>

            <ul className="mt-4 space-y-2 text-[0.6875rem] leading-relaxed text-muted">
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-leaf" />
                No payment is taken now — this sends a request, not a charge.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-leaf" />
                A named consultant replies with a firm quote before anything is
                confirmed.
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className="text-body">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function Confirmation({
  reference,
  pkg,
}: {
  reference: string;
  pkg: PublicPackage;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-line bg-white p-6 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-leaf-soft text-leaf">
        <Check className="size-6" />
      </span>

      <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-ink">
        Request received
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-body">
        We have your request for <strong className="text-ink">{pkg.title}</strong>.
        A consultant will come back with a firm quote and availability.
      </p>

      <div className="mt-5 rounded-lg border border-dashed border-line bg-elevated px-4 py-3">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Your reference
        </p>
        <p className="mt-1 font-mono text-lg font-bold tracking-wider text-brand">
          {reference}
        </p>
      </div>

      <p className="mt-4 text-xs text-muted">
        Quote it in any email or call and we will find your file instantly.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Link
          href="/dashboard"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand"
        >
          View Dashboard
        </Link>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
