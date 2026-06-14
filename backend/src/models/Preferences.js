import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  experienceLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  riskTolerance: { type: String, enum: ["low", "medium", "high"], required: true },
  favoriteCoins: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  investmentHorizon: { type: String, enum: ["short", "medium", "long"], required: true },
  investmentGoal: { type: String, enum: ["growth", "income", "learning"], required: true },
}, { timestamps: true });

export const Preferences = mongoose.model("Preferences", preferencesSchema);
