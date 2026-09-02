import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  transactionId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { 
      type: String, 
      enum: ["Pending", "Completed", "Failed", "Refunded"], 
      default: "Pending" 
    },
    transactionId: { type: String },
    paymentMethod: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);
