import mongoose, { Schema, Document } from "mongoose";

export interface ISeoMeta extends Document {
  urlPath: string; // e.g. /about, /destinations
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SeoMetaSchema: Schema = new Schema(
  {
    urlPath: { type: String, required: true, unique: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    ogImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SeoMeta || mongoose.model<ISeoMeta>("SeoMeta", SeoMetaSchema);
