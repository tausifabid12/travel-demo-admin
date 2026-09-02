import "server-only";

import dbConnect from "@/lib/mongodb";
import Package from "@/lib/models/Package";
import Destination from "@/lib/models/Destination";
import CaseStudy from "@/lib/models/CaseStudy";
import Insight from "@/lib/models/Insight";
import Offering from "@/lib/models/Offering";
import Career from "@/lib/models/Career";
import Setting from "@/lib/models/Setting";

/**
 * The public site reads the database directly rather than going through
 * /api/*, which is authenticated and returns drafts. Every query here filters
 * to published content, so an unpublished item can never leak onto the site.
 */

/** Mongo documents carry ObjectIds and Dates; Client Components need plain JSON. */
function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const PUBLISHED = { status: "published" } as const;

/** Published, and not scheduled for a future date. */
function liveInsightFilter() {
  return {
    status: "published",
    $or: [
      { publishDate: { $lte: new Date() } },
      { publishDate: { $exists: false } },
      { publishDate: null },
    ],
  };
}

/* ------------------------------ Settings ------------------------------ */

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  defaultOgImage?: string;
  googleAnalyticsId?: string;
  gtmTag?: string;
  googleAdsId?: string;
  facebookPixelId?: string;
  searchConsoleCode?: string;
  firebaseConfig?: string;
  firebaseServiceAccount?: string;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    addressLines?: string[];
    mapEmbedUrl?: string;
    responsePromise?: string;
  };
  social: Record<string, string>;
  homepage: {
    heroHeadline?: string;
    heroSubheadline?: string;
    heroImageUrl?: string;
    heroVideoUrl?: string;
    featuredPackageIds?: string[];
    featuredCaseStudyIds?: string[];
    clientLogos?: { name: string; logoUrl: string }[];
    stats?: { label: string; value: string }[];
  };
  navigation: {
    header?: { label: string; href: string; children?: { label: string; href: string; description?: string }[] }[];
    footer?: { label: string; href: string; children?: { label: string; href: string }[] }[];
  };
};

const FALLBACK_SETTINGS: SiteSettings = {
  siteTitle: "Bhancer",
  siteDescription: "Corporate travel, MICE and incentive experiences.",
  contact: {},
  social: {},
  homepage: {},
  navigation: {},
};

export async function getSettings(): Promise<SiteSettings> {
  await dbConnect();
  const doc = await Setting.findOne({})
    .select("-phonePeSaltKey -pinggoApiKey")
    .lean<Record<string, unknown>>();
  if (!doc) return FALLBACK_SETTINGS;
  return serialize({ ...FALLBACK_SETTINGS, ...doc }) as SiteSettings;
}

/* ------------------------------ Packages ------------------------------ */

export type PublicPackage = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  heroImage?: string;
  heroVideo?: string;
  gallery: string[];
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  durationDays?: number;
  durationNights?: number;
  priceIndicator?: string;
  priceFrom?: number;
  strikePrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  tripType?: string;
  themes?: string[];
  isFeatured: boolean;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  destinationId?: { _id: string; name: string; region: string; heroImage?: string };
};

export async function getPackages(filter?: {
  category?: string;
  region?: string;
  destination?: string;
  tripType?: string;
  theme?: string;
}): Promise<PublicPackage[]> {
  await dbConnect();

  const query: Record<string, unknown> = { ...PUBLISHED };
  if (filter?.category) query.category = filter.category;
  if (filter?.tripType) query.tripType = filter.tripType;
  if (filter?.theme) query.themes = filter.theme;

  let packages = await Package.find(query)
    .populate("destinationId", "name region heroImage slug")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  // Region and destination live on the populated document, so they are
  // filtered after the join rather than in the query.
  if (filter?.region) {
    packages = packages.filter(
      (p) => (p.destinationId as { region?: string })?.region === filter.region,
    );
  }
  if (filter?.destination) {
    packages = packages.filter(
      (p) => (p.destinationId as { name?: string })?.name === filter.destination,
    );
  }

  return serialize(packages) as unknown as PublicPackage[];
}

export async function getPackageBySlug(slug: string): Promise<PublicPackage | null> {
  await dbConnect();
  const doc = await Package.findOne({ slug, ...PUBLISHED })
    .populate("destinationId", "name region heroImage")
    .lean();
  return doc ? (serialize(doc) as unknown as PublicPackage) : null;
}

export async function getFeaturedPackages(ids?: string[], limit = 4) {
  await dbConnect();
  // Prefer the explicit homepage selection; fall back to the isFeatured flag.
  if (ids?.length) {
    const docs = await Package.find({ _id: { $in: ids }, ...PUBLISHED })
      .populate("destinationId", "name region")
      .lean();
    return serialize(docs) as unknown as PublicPackage[];
  }
  const docs = await Package.find({ isFeatured: true, ...PUBLISHED })
    .populate("destinationId", "name region")
    .sort({ order: 1 })
    .limit(limit)
    .lean();
  return serialize(docs) as unknown as PublicPackage[];
}

export async function getRelatedPackages(pkg: PublicPackage, limit = 3) {
  await dbConnect();
  const docs = await Package.find({
    _id: { $ne: pkg._id },
    ...PUBLISHED,
    $or: [
      { category: pkg.category },
      { destinationId: pkg.destinationId?._id },
    ],
  })
    .populate("destinationId", "name region")
    .limit(limit)
    .lean();
  return serialize(docs) as unknown as PublicPackage[];
}

export async function getPackageSlugs() {
  try {
    await dbConnect();
    const docs = await Package.find(PUBLISHED).select("slug updatedAt").lean();
    return serialize(docs) as unknown as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}

/* ---------------------------- Destinations ---------------------------- */

export type PublicDestination = {
  _id: string;
  name: string;
  slug?: string;
  region: string;
  description?: string;
  heroImage?: string;
  gallery: string[];
  isFeatured: boolean;
};

export async function getDestinations(): Promise<PublicDestination[]> {
  await dbConnect();
  const docs = await Destination.find({}).sort({ order: 1, name: 1 }).lean();
  return serialize(docs) as unknown as PublicDestination[];
}

export async function getDestinationBySlug(slug: string) {
  await dbConnect();
  // Older rows predate the slug field, so fall back to a name match.
  const doc = await Destination.findOne({
    $or: [{ slug }, { name: new RegExp(`^${slug.replace(/-/g, "[ -]")}$`, "i") }],
  }).lean();
  return doc ? (serialize(doc) as unknown as PublicDestination) : null;
}

export async function getDestinationSlugs() {
  try {
    await dbConnect();
    const docs = await Destination.find({}).select("slug name updatedAt").lean();
    return serialize(docs) as unknown as {
      slug?: string;
      name: string;
      updatedAt: string;
    }[];
  } catch {
    return [];
  }
}

/* ---------------------------- Case studies ---------------------------- */

export type PublicCaseStudy = {
  _id: string;
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  serviceCategory: string;
  tags: string[];
  heroImage?: string;
  gallery: string[];
  videoUrl?: string;
  summary?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  metrics: { label: string; value: string }[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  destinationId?: { _id: string; name: string; region: string };
};

export async function getCaseStudies(filter?: {
  industry?: string;
  service?: string;
}): Promise<PublicCaseStudy[]> {
  await dbConnect();
  const query: Record<string, unknown> = { ...PUBLISHED };
  if (filter?.industry) query.industry = filter.industry;
  if (filter?.service) query.serviceCategory = filter.service;

  const docs = await CaseStudy.find(query)
    .populate("destinationId", "name region")
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return serialize(docs) as unknown as PublicCaseStudy[];
}

export async function getCaseStudyBySlug(slug: string) {
  await dbConnect();
  const doc = await CaseStudy.findOne({ slug, ...PUBLISHED })
    .populate("destinationId", "name region")
    .lean();
  return doc ? (serialize(doc) as unknown as PublicCaseStudy) : null;
}

export async function getFeaturedCaseStudies(ids?: string[], limit = 2) {
  await dbConnect();
  if (ids?.length) {
    const docs = await CaseStudy.find({ _id: { $in: ids }, ...PUBLISHED }).lean();
    return serialize(docs) as unknown as PublicCaseStudy[];
  }
  const docs = await CaseStudy.find({ isFeatured: true, ...PUBLISHED })
    .sort({ order: 1 })
    .limit(limit)
    .lean();
  return serialize(docs) as unknown as PublicCaseStudy[];
}

export async function getCaseStudySlugs() {
  try {
    await dbConnect();
    const docs = await CaseStudy.find(PUBLISHED).select("slug updatedAt").lean();
    return serialize(docs) as unknown as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}

/* ------------------------------ Insights ------------------------------ */

export type PublicInsight = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage?: string;
  author: string;
  authorRole?: string;
  category: string;
  tags: string[];
  publishDate?: string;
  readingMinutes?: number;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
};

export async function getInsights(filter?: { category?: string }) {
  await dbConnect();
  const query: Record<string, unknown> = liveInsightFilter();
  if (filter?.category) query.category = filter.category;

  const docs = await Insight.find(query).sort({ publishDate: -1 }).lean();
  return serialize(docs) as unknown as PublicInsight[];
}

export async function getInsightBySlug(slug: string) {
  await dbConnect();
  const doc = await Insight.findOne({ slug, ...liveInsightFilter() }).lean();
  return doc ? (serialize(doc) as unknown as PublicInsight) : null;
}

export async function getRelatedInsights(insight: PublicInsight, limit = 3) {
  await dbConnect();
  const docs = await Insight.find({
    _id: { $ne: insight._id },
    ...liveInsightFilter(),
    category: insight.category,
  })
    .sort({ publishDate: -1 })
    .limit(limit)
    .lean();
  return serialize(docs) as unknown as PublicInsight[];
}

export async function getInsightSlugs() {
  try {
    await dbConnect();
    const docs = await Insight.find(liveInsightFilter())
      .select("slug updatedAt")
      .lean();
    return serialize(docs) as unknown as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}

/* ------------------------------ Offerings ----------------------------- */

export type PublicBlock = {
  type: string;
  heading?: string;
  body?: string;
  image?: string;
  items: { title?: string; description?: string; image?: string; value?: string }[];
};

export type PublicOffering = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  heroVideo?: string;
  blocks: PublicBlock[];
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
};

export async function getOfferings() {
  await dbConnect();
  const docs = await Offering.find(PUBLISHED).sort({ order: 1, title: 1 }).lean();
  return serialize(docs) as unknown as PublicOffering[];
}

export async function getOfferingBySlug(slug: string) {
  await dbConnect();
  const doc = await Offering.findOne({ slug, ...PUBLISHED }).lean();
  return doc ? (serialize(doc) as unknown as PublicOffering) : null;
}

export async function getOfferingSlugs() {
  try {
    await dbConnect();
    const docs = await Offering.find(PUBLISHED).select("slug updatedAt").lean();
    return serialize(docs) as unknown as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}

/* ------------------------------- Careers ------------------------------ */

export type PublicCareer = {
  _id: string;
  jobTitle: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  summary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

export async function getOpenRoles(filter?: {
  department?: string;
  location?: string;
}) {
  await dbConnect();
  const query: Record<string, unknown> = { status: "active" };
  if (filter?.department) query.department = filter.department;
  if (filter?.location) query.location = filter.location;

  const docs = await Career.find(query).sort({ createdAt: -1 }).lean();
  return serialize(docs) as unknown as PublicCareer[];
}

export async function getRoleBySlug(slug: string) {
  await dbConnect();
  const doc = await Career.findOne({ slug, status: "active" }).lean();
  return doc ? (serialize(doc) as unknown as PublicCareer) : null;
}

export async function getRoleSlugs() {
  try {
    await dbConnect();
    const docs = await Career.find({ status: "active" })
      .select("slug updatedAt")
      .lean();
    return serialize(docs) as unknown as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}
