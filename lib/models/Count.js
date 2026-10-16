import mongoose from "mongoose";

const CountSchema = new mongoose.Schema({
  random: { type: Number, default: 1 },
  count: { type: Number, default: 0 },
});

export default mongoose.models.CountModel || mongoose.model("CountModel", CountSchema);
