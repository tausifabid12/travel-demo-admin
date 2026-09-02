import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
