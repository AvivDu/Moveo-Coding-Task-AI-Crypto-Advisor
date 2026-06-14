import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as voteController from "../controllers/voteController.js";

export const voteRoutes = Router();

voteRoutes.use(requireAuth);
voteRoutes.get("/", voteController.getVotes);
voteRoutes.post("/", voteController.saveVote);
