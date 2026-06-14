import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as dashboardController from "../controllers/dashboardController.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/news", dashboardController.getNews);
dashboardRoutes.get("/prices", dashboardController.getPrices);
