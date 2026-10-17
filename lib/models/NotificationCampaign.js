import mongoose from "mongoose";

const NotificationCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    destinationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    actionLabel: {
      type: String,
      default: "View Now",
      trim: true,
    },
    createdBy: {
      type: String,
      default: "admin",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "queued", "processing", "completed", "failed", "partial"],
      default: "queued",
      index: true,
    },
    totalTargets: {
      type: Number,
      default: 0,
    },
    successfulPushRequests: {
      type: Number,
      default: 0,
    },
    failedPushRequests: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

NotificationCampaignSchema.index({ createdAt: -1 });

export default mongoose.models.NotificationCampaign ||
  mongoose.model("NotificationCampaign", NotificationCampaignSchema);
