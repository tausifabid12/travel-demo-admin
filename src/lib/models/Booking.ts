import mongoose, { Schema, Document } from "mongoose";

import { BOOKING_STATUSES } from "@/lib/constants";

export { BOOKING_STATUSES } from "@/lib/constants";
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * A structured booking request. No payment is captured here — the gateway is
 * not wired up — so a booking starts life as "Requested" and the team converts
 * it to a quote and then a confirmation.
 */
export interface IBooking extends Document {
  reference: string;
  packageId: mongoose.Types.ObjectId;
  packageTitle: string;
  leadName: string;
  email: string;
  phone: string;
  company?: string;
  adults: number;
  children: number;
  travelDate?: Date;
  flexibleDates: boolean;
  roomPreference?: string;
  addOns: string[];
  specialRequests?: string;
  /** Price snapshot at the moment of request, so later edits do not rewrite history. */
  pricePerPerson?: number;
  currency: string;
  estimatedTotal?: number;
  status: BookingStatus;
  notes?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    packageTitle: { type: String, required: true },
    leadName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    adults: { type: Number, required: true, min: 1, default: 2 },
    children: { type: Number, min: 0, default: 0 },
    travelDate: { type: Date },
    flexibleDates: { type: Boolean, default: false },
    roomPreference: { type: String },
    addOns: [{ type: String }],
    specialRequests: { type: String },
    pricePerPerson: { type: Number },
    currency: { type: String, default: "INR" },
    estimatedTotal: { type: Number },
    status: { type: String, enum: BOOKING_STATUSES, default: "Requested" },
    notes: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true },
);

BookingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
