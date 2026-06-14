import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TOKEN_EXPIRY = "7d";

export function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
