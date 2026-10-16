import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    hadding: { type: String, required: true },
    img: { type: String, default: "" },
    play: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

MovieSchema.index({ hadding: "text" });

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
