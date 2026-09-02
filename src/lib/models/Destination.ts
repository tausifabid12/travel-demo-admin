import mongoose, { Schema, Document } from "mongoose";
import { SeoSchema, type ISeo } from "./shared";

export { REGIONS } from "@/lib/constants";

export interface IDestination extends Document {
  name: string;
  slug: string;
  region: string;
  description?: string;
  heroImage?: string;
  gallery: string[];
  isFeatured: boolean;
  order: number;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    region: { type: String, required: true, trim: true },
    description: { type: String },
    heroImage: { type: String },
    gallery: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.models.Destination ||
  mongoose.model<IDestination>("Destination", DestinationSchema);
