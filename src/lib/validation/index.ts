import { z } from "zod";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_BADGES,
  TRIP_TYPES,
  HOLIDAY_THEMES,
  BOOKING_STATUSES,
  BOOKING_ADD_ONS,
  ROOM_PREFERENCES,
} from "@/lib/constants";
import { JOB_TYPES } from "@/lib/constants";
import { ENQUIRY_STATUSES } from "@/lib/constants";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { MEDIA_TYPES } from "@/lib/constants";
import { BLOCK_TYPES } from "@/lib/constants";
import { ROLES } from "@/lib/permissions";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const url = z.url().or(z.literal(""));
const optionalUrl = url.optional();
const status = z.enum(["draft", "published"]);

export const seoSchema = z
  .object({
    metaTitle: z.string().max(70).optional().or(z.literal("")),
    metaDescription: z.string().max(180).optional().or(z.literal("")),
    ogImage: optionalUrl,
  })
  .partial();

export const packageSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  summary: z.string().optional(),
  destinationId: objectId,
  category: z.enum(PACKAGE_CATEGORIES),
  heroImage: optionalUrl,
  heroVideo: optionalUrl,
  gallery: z.array(url).default([]),
  highlights: z.array(z.string()).default([]),
  itinerary: z
    .array(
      z.object({
        day: z.coerce.number().int().min(1),
        title: z.string(),
        description: z.string().optional().default(""),
      }),
    )
    .default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  durationDays: z.coerce.number().int().min(0).optional(),
  durationNights: z.coerce.number().int().min(0).optional(),
  priceIndicator: z.string().optional(),
  priceFrom: z.coerce.number().min(0).optional(),
  strikePrice: z.coerce.number().min(0).optional(),
  currency: z.string().default("INR"),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().int().min(0).optional(),
  badge: z.enum(PACKAGE_BADGES).optional().or(z.literal("")),
  tripType: z.enum(TRIP_TYPES).default("Holiday"),
  themes: z.array(z.enum(HOLIDAY_THEMES)).default([]),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  status: status.default("draft"),
  seo: seoSchema.optional(),
});

export const destinationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  region: z.string().min(2, "Region is required"),
  description: z.string().optional(),
  heroImage: optionalUrl,
  gallery: z.array(url).default([]),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  seo: seoSchema.optional(),
});

export const caseStudySchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  industry: z.string().min(1, "Industry is required"),
  destinationId: objectId.optional().or(z.literal("")),
  serviceCategory: z.string().min(1, "Service category is required"),
  tags: z.array(z.string()).default([]),
  heroImage: optionalUrl,
  gallery: z.array(url).default([]),
  videoUrl: optionalUrl,
  summary: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  testimonialQuote: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  testimonialRole: z.string().optional(),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  status: status.default("draft"),
  seo: seoSchema.optional(),
});

export const insightSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(10, "Excerpt is required"),
  body: z.string().min(1, "Body is required"),
  featuredImage: optionalUrl,
  author: z.string().min(1, "Author is required"),
  authorRole: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  publishDate: z.coerce.date().optional(),
  status: status.default("draft"),
  seo: seoSchema.optional(),
});

export const offeringSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  summary: z.string().optional(),
  heroImage: optionalUrl,
  heroVideo: optionalUrl,
  icon: z.string().optional(),
  blocks: z
    .array(
      z.object({
        type: z.enum(BLOCK_TYPES),
        heading: z.string().optional(),
        body: z.string().optional(),
        image: optionalUrl,
        items: z
          .array(
            z.object({
              title: z.string().optional(),
              description: z.string().optional(),
              image: optionalUrl,
              value: z.string().optional(),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
  order: z.coerce.number().default(0),
  status: status.default("draft"),
  seo: seoSchema.optional(),
});

export const careerSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  slug: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(JOB_TYPES),
  summary: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  applicationDeadline: z.coerce.date().optional(),
  status: z.enum(["active", "closed"]).default("active"),
  seo: seoSchema.optional(),
});

export const mediaSchema = z.object({
  url: z.url("A valid URL is required"),
  type: z.enum(MEDIA_TYPES).default("image"),
  title: z.string().optional(),
  alt: z.string().optional(),
  folder: z.string().default("Uncategorised"),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .omit({ password: true })
  .extend({ password: z.string().min(8).optional().or(z.literal("")) });

/* ---------------- Public-facing forms ---------------- */

// Bots fill hidden fields; humans leave them empty. This accepts any value so
// the submission validates, then the service silently discards it — telling a
// bot it failed only teaches it to adapt.
const honeypot = z.string().optional();

export const enquirySchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Please tell us a little more"),
  source: z.string().default("Contact Page"),
  sourcePage: z.string().optional(),
  packageId: objectId.optional().or(z.literal("")),
  groupSize: z.string().optional(),
  preferredDates: z.string().optional(),
  budgetRange: z.string().optional(),
  serviceInterest: z.string().optional(),
  website: honeypot,
});

export const enquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  notes: z.string().optional(),
});

export const applicationSchema = z.object({
  careerId: objectId,
  name: z.string().min(2, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().optional(),
  linkedinUrl: optionalUrl,
  resumeUrl: z.url("Please link to your CV"),
  coverLetter: z.string().optional(),
  website: honeypot,
});

export const applicationUpdateSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  packageId: objectId,
  leadName: z.string().min(2, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().min(6, "Please enter a contact number"),
  company: z.string().optional(),
  adults: z.coerce.number().int().min(1, "At least one adult").max(200),
  children: z.coerce.number().int().min(0).max(200).default(0),
  travelDate: z.coerce.date().optional(),
  flexibleDates: z.coerce.boolean().default(false),
  roomPreference: z.enum(ROOM_PREFERENCES).optional().or(z.literal("")),
  addOns: z.array(z.enum(BOOKING_ADD_ONS)).default([]),
  specialRequests: z.string().optional(),
  website: honeypot,
});

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const reorderSchema = z.object({
  ids: z.array(objectId).min(1),
});

export type PackageInput = z.infer<typeof packageSchema>;
export type DestinationInput = z.infer<typeof destinationSchema>;
export type CaseStudyInput = z.infer<typeof caseStudySchema>;
export type InsightInput = z.infer<typeof insightSchema>;
export type OfferingInput = z.infer<typeof offeringSchema>;
export type CareerInput = z.infer<typeof careerSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
