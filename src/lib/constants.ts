/**
 * Shared enums and option lists.
 *
 * These live apart from the Mongoose models on purpose: client components need
 * them to build dropdowns, and importing a model would pull mongoose (and with
 * it `net`/`tls`) into the browser bundle.
 */

export const PACKAGE_CATEGORIES = [
  "MICE",
  "Incentive",
  "Offsite",
  "Conference",
  "Corporate Experience",
] as const;
export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number];

export const REGIONS = [
  "Middle East",
  "Southeast Asia",
  "Europe",
  "India",
  "Americas",
  "Africa",
  "Oceania",
] as const;

export const INSIGHT_CATEGORIES = [
  "Corporate Travel Trends",
  "MICE",
  "Destination Guides",
  "Event Planning",
  "Company News",
] as const;

export const SERVICE_CATEGORIES = [
  "MICE",
  "Incentive",
  "Offsite",
  "Conference",
  "Corporate Experience",
  "Experia",
] as const;

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
] as const;

export const ENQUIRY_STATUSES = [
  "New",
  "In Progress",
  "Responded",
  "Converted",
  "Archived",
] as const;

export const ENQUIRY_SOURCES = [
  "TravelXL Package",
  "Contact Page",
  "Careers",
  "Newsletter",
  "Offering",
] as const;

export const APPLICATION_STATUSES = [
  "New",
  "Reviewed",
  "Shortlisted",
  "Rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const MEDIA_TYPES = ["image", "video", "document"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const BLOCK_TYPES = [
  "richText",
  "imageText",
  "cards",
  "stats",
  "timeline",
  "gallery",
  "quote",
  "cta",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const STATUSES = ["draft", "published"] as const;
export type Status = (typeof STATUSES)[number];

export const PURCHASE_STATUSES = [
  "Pending",
  "Completed",
  "Failed",
  "Refunded",
] as const;

/** Marketing flags shown as a corner ribbon on a package card. */
export const PACKAGE_BADGES = [
  "Bestseller",
  "New",
  "Limited seats",
  "Free cancellation",
  "Group discount",
] as const;
export type PackageBadge = (typeof PACKAGE_BADGES)[number];

/** Which side of the business a package belongs to. */
export const TRIP_TYPES = ["Holiday", "Corporate"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

/** Themes a holiday shopper filters by. */
export const HOLIDAY_THEMES = [
  "Beach",
  "Honeymoon",
  "Family",
  "Adventure",
  "Wildlife",
  "City break",
  "Cruise",
  "Wellness",
] as const;

export const BOOKING_STATUSES = [
  "Requested",
  "Quoted",
  "Confirmed",
  "Paid",
  "Cancelled",
] as const;

/** Optional extras a traveller can request at booking time. */
export const BOOKING_ADD_ONS = [
  "Airport transfers",
  "Travel insurance",
  "Visa assistance",
  "Airport lounge access",
  "Photographer for a day",
  "Anniversary or birthday setup",
] as const;

export const ROOM_PREFERENCES = [
  "Double / King",
  "Twin beds",
  "Family room",
  "Connecting rooms",
  "Private villa",
] as const;
