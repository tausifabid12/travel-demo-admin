import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import CookieConsent from "@/components/site/CookieConsent";
import MobileTabBar from "@/components/site/MobileTabBar";
import { getSettings } from "@/lib/queries";
import { SITE_URL, jsonLd, organizationSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.siteTitle} — Corporate Travel, MICE & Incentive Experiences`,
      template: `%s | ${settings.siteTitle}`,
    },
    description: settings.siteDescription,
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <div data-shell="site" className="min-h-screen flex flex-col antialiased">
      <SiteHeader
        nav={settings.navigation.header}
        siteTitle={settings.siteTitle}
        logoUrl={settings.logoUrl}
      />

      {/* pb clears the mobile tab bar, which is fixed to the bottom. */}
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>

      <SiteFooter settings={settings} />

      <MobileTabBar />

      <CookieConsent
        googleAnalyticsId={settings.googleAnalyticsId}
        gtmTag={settings.gtmTag}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(organizationSchema(settings))}
      />
    </div>
  );
}
