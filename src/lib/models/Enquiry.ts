import mongoose, { Schema, Document } from "mongoose";
import { ENQUIRY_STATUSES } from "@/lib/constants";

export { ENQUIRY_STATUSES, ENQUIRY_SOURCES } from "@/lib/constants";

export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  sourcePage?: string;
  packageId?: mongoose.Types.ObjectId;
  groupSize?: string;
  preferredDates?: string;
  budgetRange?: string;
  serviceInterest?: string;
  status: (typeof ENQUIRY_STATUSES)[number];
  ipAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    message: { type: String, required: true },
    source: { type: String, required: true },
    sourcePage: { type: String },
    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    groupSize: { type: String },
    preferredDates: { type: String },
    budgetRange: { type: String },
    serviceInterest: { type: String },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "New" },
    ipAddress: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

EnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Enquiry ||
  mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
