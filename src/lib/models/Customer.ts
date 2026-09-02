import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICustomer extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  isActive: boolean;
  role: "Customer";
  fcmTokens?: string[];
  comparePassword: (candidate: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "Customer" },
    fcmTokens: [{ type: String }],
  },
  { timestamps: true }
);

CustomerSchema.pre<ICustomer>("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

CustomerSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
