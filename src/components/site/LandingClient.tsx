"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------- Counter ------------------------------ */

/**
 * Counts up to `to` the first time it scrolls into view.
 *
 * The final value is what renders on the server and in the first client paint,
 * so the number is already correct without JavaScript and for screen readers —
 * the animation only ever replaces a value that was right to begin with.
 */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutCubic — quick off the mark, settles gently on the number.
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(to * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setValue(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* --------------------------- Tabbed schedule --------------------------- */

export type ScheduleSlot = {
  time: string;
  title: string;
  body: string;
  location?: string;
  people?: string[];
};

export type ScheduleTab = {
  id: string;
  label: string;
  sub?: string;
  slots: ScheduleSlot[];
  /** Optional photograph shown alongside the panel on wide screens. */
  image?: string;
  imageCaption?: string;
};

/** Day-by-day agenda with the days as tabs, the way a programme is read. */
export function TabbedSchedule({ tabs }: { tabs: ScheduleTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const baseId = useId();
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Programme"
        className="-mx-6 flex gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const selected = tab.id === current?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2.5 text-left transition-all duration-300",
                selected
                  ? "border-transparent bg-ink text-white shadow-[var(--shadow-md)]"
                  : "border-line bg-surface text-ink hover:border-ink/30",
              )}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              {tab.sub && (
                <span
                  className={cn(
                    "block text-[0.6875rem] tracking-wide",
                    selected ? "text-white/60" : "text-muted",
                  )}
                >
                  {tab.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${current.id}`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
          className={cn("mt-8", current.image && "lg:grid lg:grid-cols-12 lg:gap-10")}
        >
          {current.image && (
            <div className="lg:col-span-4">
              {/* Sticks with the reader while the longer slot list scrolls. */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] lg:sticky lg:top-28 lg:aspect-[3/4]">
                <Image
                  src={current.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-white/60">
                    {current.sub ?? current.label}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-white">
                    {current.imageCaption ?? current.label}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className={cn(
              "divide-y divide-line border-y border-line",
              current.image && "mt-8 lg:col-span-8 lg:mt-0",
            )}
          >
            {current.slots.map((slot) => (
              <div
                key={slot.title}
                className="grid gap-4 py-7 transition-colors duration-300 hover:bg-tint/60 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:px-4"
              >
                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    <Clock className="size-3.5" aria-hidden />
                    {slot.time}
                  </span>
                  {slot.location && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {slot.location}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-ink sm:text-xl">
                    {slot.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
                    {slot.body}
                  </p>
                  {slot.people?.length ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">
                      {slot.people.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Pricing ------------------------------ */

export type Plan = {
  name: string;
  blurb: string;
  prices: Record<string, { amount: string; unit: string; was?: string }>;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Plan cards with a billing switch. The two modes come from the caller, so the
 * same component covers "single event / season" and "pay per ride / monthly".
 */
export function PricingPlans({
  plans,
  modes,
  badge = "Most chosen",
}: {
  plans: Plan[];
  modes: { id: string; label: string; note?: string }[];
  badge?: string;
}) {
  const [mode, setMode] = useState(modes[0].id);

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Pricing basis"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-[var(--shadow-sm)]"
        >
          {modes.map((option) => {
            const selected = option.id === mode;
            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(option.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
                  selected ? "bg-ink text-white" : "text-body hover:text-ink",
                )}
              >
                {option.label}
                {option.note && (
                  <span
                    className={cn(
                      "ml-1.5 text-[0.6875rem]",
                      selected ? "text-gold" : "text-brand",
                    )}
                  >
                    {option.note}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.prices[mode] ?? Object.values(plan.prices)[0];
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-[var(--radius-lg)] border p-7 transition-all duration-300",
                plan.featured
                  ? "border-transparent bg-ink shadow-[var(--shadow-lg)] lg:-translate-y-3"
                  : "border-line bg-surface hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-white">
                  {badge}
                </span>
              )}

              <h3
                className={cn(
                  "font-[family-name:var(--font-display)] text-xl",
                  plan.featured ? "text-white" : "text-ink",
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  plan.featured ? "text-white/65" : "text-body",
                )}
              >
                {plan.blurb}
              </p>

              <p className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {price.was && (
                  <span
                    className={cn(
                      "text-sm line-through",
                      plan.featured ? "text-white/40" : "text-muted",
                    )}
                  >
                    {price.was}
                  </span>
                )}
                <span
                  className={cn(
                    "font-[family-name:var(--font-display)] text-3xl",
                    plan.featured ? "text-white" : "text-ink",
                  )}
                >
                  {price.amount}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    plan.featured ? "text-white/50" : "text-muted",
                  )}
                >
                  {price.unit}
                </span>
              </p>

              <ul
                className={cn(
                  "mt-7 flex flex-col gap-3 border-t pt-7",
                  plan.featured ? "border-white/15" : "border-line",
                )}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        plan.featured ? "text-gold" : "text-brand",
                      )}
                      aria-hidden
                    />
                    <span className={plan.featured ? "text-white/80" : "text-body"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="grow" />

              <a
                href={plan.ctaHref}
                className={cn(
                  "mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300",
                  plan.featured
                    ? "bg-white text-ink hover:bg-white/90"
                    : "bg-brand text-white hover:bg-brand-hover",
                )}
              >
                {plan.ctaLabel}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
