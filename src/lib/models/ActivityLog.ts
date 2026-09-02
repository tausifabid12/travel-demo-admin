import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  action: "created" | "updated" | "deleted" | "published" | "duplicated";
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Employee" },
    actorName: { type: String, default: "System" },
    action: {
      type: String,
      enum: ["created", "updated", "deleted", "published", "duplicated"],
      required: true,
    },
    entityType: { type: String, required: true },
    entityId: { type: String },
    entityLabel: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ActivityLogSchema.index({ createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
