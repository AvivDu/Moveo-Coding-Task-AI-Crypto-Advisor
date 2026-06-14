import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  cryptoPanicApiKey: process.env.CRYPTOPANIC_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
