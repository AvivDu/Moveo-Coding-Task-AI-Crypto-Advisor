import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  };
}

export async function signup(name, email, password) {
  if (!name || !email || !password) {
    throw new AppError(400, "Name, email, and password are required");
  }
  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  return {
    token: signToken(user._id.toString()),
    user: toUserResponse(user),
  };
}

export async function login(email, password) {
  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  return {
    token: signToken(user._id.toString()),
    user: toUserResponse(user),
  };
}
