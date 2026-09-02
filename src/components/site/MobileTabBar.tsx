"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Layers, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Experiences", href: "/travelxl", icon: Compass },
  { label: "Work", href: "/work", icon: Layers },
  { label: "Insights", href: "/insights", icon: BookOpen },
  { label: "Enquire", href: "/contact", icon: MessageCircle },
];

/**
 * Native-app style bottom navigation, mobile only. Hides while scrolling down
 * and reappears on scroll up, the way an app chrome behaves.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      // Ignore small jitter, and always show near the top of the page.
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0 && y > 120);
        lastY = y;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "lg:hidden fixed inset-x-3 z-50",
        // Floats clear of the screen edge and the iOS home indicator.
        "bottom-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "rounded-2xl border border-line/80 bg-surface/80 backdrop-blur-2xl",
        "shadow-[var(--shadow-lg)]",
        "transition-all duration-300 ease-out",
        hidden
          ? "translate-y-[150%] opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-colors",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl transition-all duration-300",
                    active && "bg-brand-soft",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[1.15rem] transition-transform duration-300",
                      active && "scale-110",
                    )}
                    strokeWidth={active ? 2.2 : 1.7}
                  />
                </span>
                <span className="text-[0.5625rem] font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
