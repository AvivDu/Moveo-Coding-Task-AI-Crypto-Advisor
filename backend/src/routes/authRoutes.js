import { Router } from "express";
import * as authController from "../controllers/authController.js";

export const authRoutes = Router();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/login", authController.login);
