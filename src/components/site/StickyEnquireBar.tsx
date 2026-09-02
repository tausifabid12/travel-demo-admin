"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile-only action bar that rides just above the tab bar, the way an app
 * keeps its primary action permanently in reach. Appears once the hero has
 * scrolled away, and steps aside when the enquiry form itself is on screen.
 */
export default function StickyEnquireBar({
  label,
  priceIndicator,
  targetId = "enquire",
}: {
  label: string;
  priceIndicator?: string;
  targetId?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const target = document.getElementById(targetId);
    if (!target) return () => window.removeEventListener("scroll", onScroll);

    // Once the form is in view the bar would only cover it.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && window.scrollY > 400),
      { threshold: 0.15 },
    );
    observer.observe(target);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [targetId]);

  return (
    <div
      className={cn(
        "lg:hidden fixed inset-x-0 z-40 px-4",
        // Sits directly above the tab bar.
        "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]",
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <a
        href={`#${targetId}`}
        className="flex items-center gap-3 rounded-full bg-brand py-3 pl-5 pr-3 shadow-[var(--shadow-lg)]"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.6875rem] uppercase tracking-[0.16em] text-white/50">
            {priceIndicator || "Fully customisable"}
          </span>
          <span className="block truncate text-sm text-white">{label}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white">
          <ArrowRight className="size-4 text-brand" />
        </span>
      </a>
    </div>
  );
}
