import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import LegalPage from "@/components/site/LegalPage";
import CookiePreferencesButton from "@/components/site/CookiePreferencesButton";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Cookie Policy",
    description: "Which cookies this site uses, and how to change your choices.",
    path: "/cookies",
    settings,
  });
}

export default async function CookiePolicyPage() {
  const settings = await getSettings();
  const email = settings.contact.email ?? "privacy@bhancer.com";

  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      updated="20 August 2026"
      sections={[
        {
          heading: "What cookies are",
          body: (
            <p>
              Cookies are small files a site stores in your browser. Some are
              needed for the site to work at all; others tell us how the site is
              being used. We only set the second kind if you tell us we may.
            </p>
          ),
        },
        {
          heading: "Strictly necessary",
          body: (
            <p>
              We store your cookie choice itself in your browser, so we do not
              have to ask again on every page. This cannot be switched off,
              because without it we could not remember that you declined.
            </p>
          ),
        },
        {
          heading: "Analytics",
          body: (
            <p>
              If you consent, we load Google Analytics with IP anonymisation
              enabled. It tells us which pages people read and where they arrived
              from, in aggregate. It does not tell us who you are. If you decline,
              the analytics script is never loaded — not loaded and blocked, but
              never requested at all.
            </p>
          ),
        },
        {
          heading: "Marketing",
          body: (
            <p>
              If you consent, tags may be set to measure the performance of
              campaigns that brought you here. If you decline, they are not set.
            </p>
          ),
        },
        {
          heading: "Changing your mind",
          body: (
            <>
              <p>
                You can change your choices at any time, and the change takes
                effect immediately.
              </p>
              <CookiePreferencesButton />
            </>
          ),
        },
        {
          heading: "Questions",
          body: (
            <p>
              Anything unclear, write to <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
