import mongoose, { Schema, Document } from "mongoose";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";

export { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";

export interface IJobApplication extends Document {
  careerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  /** A link to the CV. Media in this phase is URL-based, not uploaded. */
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    careerId: { type: Schema.Types.ObjectId, ref: "Career", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    coverLetter: { type: String },
    status: { type: String, enum: APPLICATION_STATUSES, default: "New" },
    notes: { type: String },
  },
  { timestamps: true },
);

JobApplicationSchema.index({ careerId: 1, status: 1, createdAt: -1 });

export default mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
