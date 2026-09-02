"use client";

import Script from "next/script";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHydrated, useLocalStorage, writeLocalStorage } from "@/hooks/client";

const STORAGE_KEY = "bhancer-cookie-consent";

type Preferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const ALL_ACCEPTED: Preferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};
const ONLY_NECESSARY: Preferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function parse(raw: string | null): Preferences | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Preferences;
  } catch {
    return null;
  }
}

/**
 * GDPR banner. Analytics scripts only mount once the visitor has actively
 * consented — nothing is loaded before a choice is made.
 */
export default function CookieConsent({
  googleAnalyticsId,
  gtmTag,
}: {
  googleAnalyticsId?: string;
  gtmTag?: string;
}) {
  const ready = useHydrated();
  const prefs = parse(useLocalStorage(STORAGE_KEY));
  const [customising, setCustomising] = useState(false);
  const [draft, setDraft] = useState<Preferences>(ONLY_NECESSARY);

  const persist = (next: Preferences) => {
    writeLocalStorage(STORAGE_KEY, JSON.stringify(next));
    setCustomising(false);
  };

  const analyticsAllowed = prefs?.analytics === true;

  return (
    <>
      {analyticsAllowed && googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {analyticsAllowed && gtmTag && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmTag}');`}
        </Script>
      )}

      {ready && !prefs && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className={cn(
            "fixed inset-x-0 z-100 p-4 sm:p-6",
            // Clears the floating mobile tab bar; sits on the floor on desktop.
            "bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-0",
          )}
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-lg)] sm:p-6">
            {!customising ? (
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm text-body leading-relaxed">
                    We use cookies to keep the site working and, with your
                    permission, to understand how it is used. Read our{" "}
                    <Link
                      href="/cookies"
                      className="text-ink underline underline-offset-2"
                    >
                      cookie policy
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => setCustomising(true)}
                    className="text-sm text-body underline underline-offset-4 hover:text-ink transition-colors px-2"
                  >
                    Manage preferences
                  </button>
                  <button
                    onClick={() => persist(ONLY_NECESSARY)}
                    className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                  >
                    Necessary only
                  </button>
                  <button
                    onClick={() => persist(ALL_ACCEPTED)}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-accent"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
                  Cookie preferences
                </h2>

                <ToggleRow
                  title="Strictly necessary"
                  description="Required for the site to function. These cannot be turned off."
                  checked
                  disabled
                />
                <ToggleRow
                  title="Analytics"
                  description="Helps us understand which pages are useful. Nothing identifies you personally."
                  checked={draft.analytics}
                  onChange={(analytics) => setDraft({ ...draft, analytics })}
                />
                <ToggleRow
                  title="Marketing"
                  description="Used to measure the performance of campaigns that bring people here."
                  checked={draft.marketing}
                  onChange={(marketing) => setDraft({ ...draft, marketing })}
                />

                <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-line">
                  <button
                    onClick={() => setCustomising(false)}
                    className="px-4 py-2.5 text-sm text-body hover:text-ink transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => persist(draft)}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-accent"
                  >
                    Save preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-muted mt-0.5 max-w-lg leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
