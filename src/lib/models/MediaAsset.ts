import mongoose, { Schema, Document } from "mongoose";
import { MEDIA_TYPES, type MediaType } from "@/lib/constants";

export { MEDIA_TYPES, type MediaType } from "@/lib/constants";

/**
 * A registry of externally hosted media. This phase stores pasted URLs
 * rather than uploading files, so every asset is a link plus its metadata.
 */
export interface IMediaAsset extends Document {
  url: string;
  type: MediaType;
  title?: string;
  alt?: string;
  folder: string;
  width?: number;
  height?: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema: Schema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: MEDIA_TYPES, default: "image" },
    title: { type: String, trim: true },
    alt: { type: String, trim: true },
    folder: { type: String, default: "Uncategorised", trim: true },
    width: { type: Number },
    height: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true },
);

MediaAssetSchema.index({ folder: 1, createdAt: -1 });

export default mongoose.models.MediaAsset ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
