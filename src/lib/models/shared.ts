import { Schema } from "mongoose";

export interface ISeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

/** Reused verbatim by every publishable content model. */
export const SeoSchema = new Schema<ISeo>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false },
);

export { STATUSES, type Status } from "@/lib/constants";
