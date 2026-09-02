import mongoose, { Schema, Document } from "mongoose";
import { SeoSchema, STATUSES, type ISeo, type Status } from "./shared";

export { INSIGHT_CATEGORIES } from "@/lib/constants";

export interface IInsight extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage?: string;
  author: string;
  authorRole?: string;
  category: string;
  tags: string[];
  status: Status;
  /** When set in the future, the post stays hidden until this moment. */
  publishDate?: Date;
  readingMinutes?: number;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    featuredImage: { type: String },
    author: { type: String, required: true },
    authorRole: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: STATUSES, default: "draft" },
    publishDate: { type: Date },
    readingMinutes: { type: Number },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

InsightSchema.index({ status: 1, publishDate: -1 });

export default mongoose.models.Insight ||
  mongoose.model<IInsight>("Insight", InsightSchema);
