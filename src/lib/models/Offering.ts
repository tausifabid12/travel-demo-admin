import mongoose, { Schema, Document } from "mongoose";
import { BLOCK_TYPES, type BlockType } from "@/lib/constants";
import { SeoSchema, STATUSES, type ISeo, type Status } from "./shared";

/** Rearrangeable content blocks the editor composes a service page from. */
export { BLOCK_TYPES, type BlockType } from "@/lib/constants";

export interface IBlock {
  type: BlockType;
  heading?: string;
  body?: string;
  image?: string;
  items: { title?: string; description?: string; image?: string; value?: string }[];
}

const BlockSchema = new Schema<IBlock>(
  {
    type: { type: String, enum: BLOCK_TYPES, required: true },
    heading: { type: String },
    body: { type: String },
    image: { type: String },
    items: [
      {
        _id: false,
        title: String,
        description: String,
        image: String,
        value: String,
      },
    ],
  },
  { _id: false },
);

export interface IOffering extends Document {
  title: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  heroVideo?: string;
  icon?: string;
  blocks: IBlock[];
  order: number;
  status: Status;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const OfferingSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String },
    heroImage: { type: String },
    heroVideo: { type: String },
    icon: { type: String },
    blocks: { type: [BlockSchema], default: [] },
    order: { type: Number, default: 0 },
    status: { type: String, enum: STATUSES, default: "draft" },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.models.Offering ||
  mongoose.model<IOffering>("Offering", OfferingSchema);
