import { Vote } from "../models/Vote.js";
import { AppError } from "../utils/AppError.js";

const SECTIONS = ["news", "prices", "insight", "meme"];
const VALUES = ["up", "down"];

export async function saveVote(userId, data) {
  const { section, itemId, value } = data;

  if (!SECTIONS.includes(section)) {
    throw new AppError(400, "Invalid section");
  }
  if (!itemId) {
    throw new AppError(400, "itemId is required");
  }
  if (!VALUES.includes(value)) {
    throw new AppError(400, "Invalid value");
  }

  const vote = await Vote.findOneAndUpdate(
    { userId, section, itemId },
    { value },
    { new: true, upsert: true }
  );

  return vote;
}

export async function getVotes(userId) {
  return Vote.find({ userId });
}
