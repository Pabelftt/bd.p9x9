import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    ip: { type: String, default: "" },
    visitedAt: { type: Date, default: Date.now },
  },
  {
    collection: "visitors",
    timestamps: false,
  }
);

export default mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
