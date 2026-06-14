import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  section: { type: String, enum: ["news", "prices", "insight", "meme"], required: true },
  itemId: { type: String, required: true },
  value: { type: String, enum: ["up", "down"], required: true },
}, { timestamps: true });

voteSchema.index({ userId: 1, section: 1, itemId: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);
