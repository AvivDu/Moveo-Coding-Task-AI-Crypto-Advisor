import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as preferencesController from "../controllers/preferencesController.js";

export const preferencesRoutes = Router();

preferencesRoutes.use(requireAuth);
preferencesRoutes.get("/", preferencesController.getPreferences);
preferencesRoutes.put("/", preferencesController.savePreferences);
