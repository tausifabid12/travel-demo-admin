import mongoose, { Schema, Document } from "mongoose";
import { JOB_TYPES } from "@/lib/constants";
import { SeoSchema, type ISeo } from "./shared";

export { JOB_TYPES } from "@/lib/constants";

export interface ICareer extends Document {
  jobTitle: string;
  slug: string;
  department: string;
  location: string;
  type: (typeof JOB_TYPES)[number];
  summary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: Date;
  status: "active" | "closed";
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema: Schema = new Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: JOB_TYPES, required: true },
    summary: { type: String },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    applicationDeadline: { type: Date },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.models.Career ||
  mongoose.model<ICareer>("Career", CareerSchema);
