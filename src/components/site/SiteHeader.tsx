"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrolledPast } from "@/hooks/client";

export type NavChild = { label: string; href: string; description?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

const DEFAULT_NAV: NavItem[] = [
  {
    label: "Packages",
    href: "/travelxl",
    children: [
      {
        label: "All packages",
        href: "/travelxl",
        description: "Filter by destination, budget, duration and theme",
      },
      {
        label: "Honeymoons",
        href: "/travelxl?theme=Honeymoon",
        description: "Private villas and itineraries with room to breathe",
      },
      {
        label: "Family holidays",
        href: "/travelxl?theme=Family",
        description: "Trips built around what children actually enjoy",
      },
      {
        label: "Beach escapes",
        href: "/travelxl?theme=Beach",
        description: "Islands, coastlines and somewhere to do nothing",
      },
    ],
  },
  { label: "Destinations", href: "/destinations" },
  { label: "Deals", href: "/deals" },
  {
    label: "Corporate",
    href: "/travelxl?tripType=Corporate",
    children: [
      {
        label: "TravelXL for business",
        href: "/travelxl?tripType=Corporate",
        description: "MICE, incentives, offsites and conferences",
      },
      {
        label: "Experia",
        href: "/experia",
        description: "Experience design and live brand events",
      },
      {
        label: "Phase1World",
        href: "/phase1world",
        description: "Curated business summits, with delegate travel handled",
      },
      {
        label: "Cabexperiences",
        href: "/cabexperiences",
        description: "Chauffeur transfers, cars at disposal and event fleets",
      },
      {
        label: "Our work",
        href: "/work",
        description: "Case studies and the results they delivered",
      },
    ],
  },
  { label: "Guides", href: "/insights" },
  { label: "About", href: "/about" },
];

export default function SiteHeader({
  nav,
  siteTitle,
  logoUrl,
}: {
  nav?: NavItem[];
  siteTitle: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const items = nav?.length ? nav : DEFAULT_NAV;

  const scrolled = useScrolledPast(24);
  // Keying the open/closed state on the pathname makes every menu close on
  // navigation without an effect that resets state after the fact.
  const [menuState, setMenuState] = useState({
    path: pathname,
    mobileOpen: false,
    desktop: null as string | null,
    mobileGroup: null as string | null,
  });

  const current =
    menuState.path === pathname
      ? menuState
      : { path: pathname, mobileOpen: false, desktop: null, mobileGroup: null };

  const mobileOpen = current.mobileOpen;
  const openMenu = current.desktop;
  const openMobileGroup = current.mobileGroup;

  const setMobileOpen = (value: boolean | ((prev: boolean) => boolean)) =>
    setMenuState({
      ...current,
      mobileOpen: typeof value === "function" ? value(current.mobileOpen) : value,
    });

  const setOpenMenu = (value: string | null) =>
    setMenuState({ ...current, desktop: value });

  const setOpenMobileGroup = (
    value: string | null | ((prev: string | null) => string | null),
  ) =>
    setMenuState({
      ...current,
      mobileGroup:
        typeof value === "function" ? value(current.mobileGroup) : value,
    });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Whether the header may sit transparently over a hero is decided in CSS
  // with :has([data-hero]) — the DOM knows, so JS does not need to look.
  const atTop = !scrolled && !mobileOpen;

  return (
    <header
      data-site-header
      data-at-top={atTop ? "true" : "false"}
      className="site-header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            className="site-header__brand font-[family-name:var(--font-display)] text-xl tracking-tight transition-colors sm:text-2xl"
          >
            {logoUrl ? (
              // Editor-supplied host, so a plain img rather than next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteTitle} className="h-7 w-auto" />
            ) : (
              siteTitle
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {items.map((item) => {
              const active =
                item.href !== "/" && pathname.startsWith(item.href);
              const hasChildren = Boolean(item.children?.length);

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(hasChildren ? item.label : null)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={hasChildren ? openMenu === item.label : undefined}
                    className={cn(
                      "site-header__link inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                      active && "is-active",
                    )}
                  >
                    {item.label}
                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-300",
                          openMenu === item.label && "rotate-180",
                        )}
                      />
                    )}
                  </Link>

                  {hasChildren && openMenu === item.label && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3">
                      <div className="w-[26rem] rounded-lg border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(14,21,32,0.25)]">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-md px-4 py-3.5 transition-colors hover:bg-canvas"
                          >
                            <span className="block text-sm font-medium text-ink">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="block text-xs text-muted mt-0.5 leading-relaxed">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="site-header__cta hidden items-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 sm:inline-flex"
            >
              Enquire
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="site-header__brand -mr-2 grid size-10 place-items-center transition-colors lg:hidden"
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — a bottom sheet, so it sits within thumb reach */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="Menu"
        aria-hidden={!mobileOpen}
        // inert keeps the closed sheet out of the tab order and the a11y tree.
        inert={!mobileOpen}
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto",
          "rounded-t-3xl border-t border-line bg-canvas",
          "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
          "transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          mobileOpen
            ? "translate-y-0"
            : "pointer-events-none invisible translate-y-full",
        )}
      >
        {/* Grab handle */}
        <div className="sticky top-0 bg-canvas pt-3 pb-2">
          <span
            className="mx-auto block h-1 w-10 rounded-full bg-line"
            aria-hidden
          />
        </div>

        <nav className="px-6 pt-2" aria-label="Mobile">
          {items.map((item) => (
            <div key={item.label} className="border-b border-line last:border-0">
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="flex-1 py-4 font-[family-name:var(--font-display)] text-xl text-ink"
                >
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <button
                    onClick={() =>
                      setOpenMobileGroup((prev) =>
                        prev === item.label ? null : item.label,
                      )
                    }
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-expanded={openMobileGroup === item.label}
                    className="p-3 -mr-3 text-muted"
                  >
                    <ChevronDown
                      className={cn(
                        "size-5 transition-transform duration-300",
                        openMobileGroup === item.label && "rotate-180",
                      )}
                    />
                  </button>
                ) : null}
              </div>

              {item.children?.length && openMobileGroup === item.label ? (
                <div className="pb-4 flex flex-col gap-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="rounded-lg bg-surface px-4 py-3 text-sm text-body"
                    >
                      <span className="block text-ink">{child.label}</span>
                      {child.description && (
                        <span className="mt-0.5 block text-xs text-muted">
                          {child.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <Link
            href="/contact"
            className="mt-6 flex items-center justify-center rounded-full bg-ink px-7 py-4 text-sm font-medium text-canvas"
          >
            Enquire now
          </Link>
        </nav>
      </div>

    </header>
  );
}
