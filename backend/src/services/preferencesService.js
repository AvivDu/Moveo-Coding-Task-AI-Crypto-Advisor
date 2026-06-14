import { Preferences } from "../models/Preferences.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const RISK_TOLERANCES = ["low", "medium", "high"];
const INVESTMENT_HORIZONS = ["short", "medium", "long"];
const INVESTMENT_GOALS = ["growth", "income", "learning"];

export async function getPreferences(userId) {
  const preferences = await Preferences.findOne({ userId });
  return preferences;
}

export async function savePreferences(userId, data) {
  const {
    experienceLevel,
    riskTolerance,
    favoriteCoins,
    interests,
    investmentHorizon,
    investmentGoal,
  } = data;

  if (!EXPERIENCE_LEVELS.includes(experienceLevel)) {
    throw new AppError(400, "Invalid experienceLevel");
  }
  if (!RISK_TOLERANCES.includes(riskTolerance)) {
    throw new AppError(400, "Invalid riskTolerance");
  }
  if (!INVESTMENT_HORIZONS.includes(investmentHorizon)) {
    throw new AppError(400, "Invalid investmentHorizon");
  }
  if (!INVESTMENT_GOALS.includes(investmentGoal)) {
    throw new AppError(400, "Invalid investmentGoal");
  }

  const preferences = await Preferences.findOneAndUpdate(
    { userId },
    {
      experienceLevel,
      riskTolerance,
      favoriteCoins: Array.isArray(favoriteCoins) ? favoriteCoins : [],
      interests: Array.isArray(interests) ? interests : [],
      investmentHorizon,
      investmentGoal,
    },
    { new: true, upsert: true }
  );

  await User.findByIdAndUpdate(userId, { hasCompletedOnboarding: true });

  return preferences;
}
