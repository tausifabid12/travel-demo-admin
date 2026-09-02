import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/queries";
import dbConnect from "@/lib/mongodb";
import SeoMeta from "@/lib/models/SeoMeta";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type Seo = { metaTitle?: string; metaDescription?: string; ogImage?: string };

/**
 * Builds page metadata from a record's SEO sub-document, falling back to the
 * record's own title and the global site settings.
 */
export async function buildMetadata({
  seo,
  title,
  description,
  path,
  image,
  settings,
  type = "website",
  publishedTime,
  authors,
}: {
  seo?: Seo;
  title: string;
  description?: string;
  path: string;
  image?: string;
  settings?: SiteSettings;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}): Promise<Metadata> {
  await dbConnect();
  const override = await SeoMeta.findOne({ urlPath: path }).lean();

  const resolvedTitle = override?.metaTitle || seo?.metaTitle || title;
  const resolvedDescription =
    override?.metaDescription || seo?.metaDescription || description || settings?.siteDescription;
  const resolvedImage = override?.ogImage || seo?.ogImage || image || settings?.defaultOgImage;

  const url = `${SITE_URL}${path}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: settings?.siteTitle ?? "Bhancer",
      type,
      ...(resolvedImage ? { images: [{ url: resolvedImage }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  };
}

/** Serialises structured data for a <script type="application/ld+json"> tag. */
export function jsonLd(data: Record<string, unknown>) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}

export function organizationSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteTitle,
    description: settings.siteDescription,
    url: SITE_URL,
    ...(settings.logoUrl ? { logo: settings.logoUrl } : {}),
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
    ...(settings.contact.addressLines?.length
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.contact.addressLines.join(", "),
          },
        }
      : {}),
    sameAs: Object.values(settings.social ?? {}).filter(Boolean),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}
