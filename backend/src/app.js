import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { authRoutes } from "./routes/authRoutes.js";
import { preferencesRoutes } from "./routes/preferencesRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

app.use("/api/preferences", preferencesRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
