import mongoose from "mongoose";

const NotificationDeliverySchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationCampaign",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PushSubscription",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "expired"],
      required: true,
      index: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    error: {
      type: String,
      default: "",
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

NotificationDeliverySchema.index({ campaignId: 1, createdAt: -1 });

export default mongoose.models.NotificationDelivery ||
  mongoose.model("NotificationDelivery", NotificationDeliverySchema);
