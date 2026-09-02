import mongoose, { Schema, Document } from "mongoose";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_BADGES,
  TRIP_TYPES,
  type PackageCategory,
} from "@/lib/constants";
import { SeoSchema, STATUSES, type ISeo, type Status } from "./shared";

export {
  PACKAGE_CATEGORIES,
  PACKAGE_BADGES,
  TRIP_TYPES,
  type PackageCategory,
} from "@/lib/constants";

export interface IPackage extends Document {
  title: string;
  slug: string;
  summary?: string;
  destinationId: mongoose.Types.ObjectId;
  category: PackageCategory;
  heroImage?: string;
  heroVideo?: string;
  gallery: string[];
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  durationDays?: number;
  durationNights?: number;
  status: Status;
  priceIndicator?: string;
  /** Lead-in price, per person, in `currency`. Drives the card price block. */
  priceFrom?: number;
  /** Was-price used to show a saving. Ignored unless higher than priceFrom. */
  strikePrice?: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  tripType: string;
  themes: string[];
  isFeatured: boolean;
  order: number;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, trim: true },
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    category: { type: String, enum: PACKAGE_CATEGORIES, required: true },
    heroImage: { type: String },
    heroVideo: { type: String },
    gallery: [{ type: String }],
    highlights: [{ type: String }],
    itinerary: [
      {
        _id: false,
        day: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    durationDays: { type: Number },
    durationNights: { type: Number },
    status: { type: String, enum: STATUSES, default: "draft" },
    priceIndicator: { type: String },
    priceFrom: { type: Number },
    strikePrice: { type: Number },
    currency: { type: String, default: "INR" },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, min: 0 },
    badge: { type: String, enum: [...PACKAGE_BADGES, ""], default: "" },
    tripType: { type: String, enum: TRIP_TYPES, default: "Holiday" },
    themes: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

PackageSchema.index({ status: 1, tripType: 1, order: 1 });
PackageSchema.index({ title: "text", summary: "text" });

export default mongoose.models.Package ||
  mongoose.model<IPackage>("Package", PackageSchema);
