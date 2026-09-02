import mongoose, { Schema, Document } from "mongoose";
import { SeoSchema, STATUSES, type ISeo, type Status } from "./shared";

export interface ICaseStudy extends Document {
  title: string;
  clientName: string;
  industry: string;
  destinationId?: mongoose.Types.ObjectId;
  serviceCategory: string;
  tags: string[];
  slug: string;
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
  status: Status;
  isFeatured: boolean;
  order: number;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const CaseStudySchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    destinationId: { type: Schema.Types.ObjectId, ref: "Destination" },
    serviceCategory: { type: String, required: true, trim: true },
    tags: [{ type: String }],
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    heroImage: { type: String },
    gallery: [{ type: String }],
    videoUrl: { type: String },
    summary: { type: String },
    // Rich text (HTML from the editor)
    challenge: { type: String },
    solution: { type: String },
    results: { type: String },
    metrics: [{ _id: false, label: String, value: String }],
    testimonialQuote: { type: String },
    testimonialAuthor: { type: String },
    testimonialRole: { type: String },
    status: { type: String, enum: STATUSES, default: "draft" },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

CaseStudySchema.index({ status: 1, order: 1 });

export default mongoose.models.CaseStudy ||
  mongoose.model<ICaseStudy>("CaseStudy", CaseStudySchema);
