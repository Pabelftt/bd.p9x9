import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    keys: {
      p256dh: { type: String, required: true, trim: true },
      auth: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
      index: true,
    },
    permissionState: {
      type: String,
      enum: ["granted", "default", "denied"],
      default: "granted",
    },
    source: {
      type: String,
      default: "homepage",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastSuccessfulSendAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PushSubscriptionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);
