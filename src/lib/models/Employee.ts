import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, type Role } from "@/lib/permissions";

// "Manager" and "Finance" are the pre-existing values; they are kept in the
// enum so old rows still load and are mapped forward by normalizeRole().
const ROLE_ENUM = [...ROLES, "Manager", "Finance"];

export interface IEmployee extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role | "Manager" | "Finance";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_ENUM, default: "Editor" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

EmployeeSchema.pre<IEmployee>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

EmployeeSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
