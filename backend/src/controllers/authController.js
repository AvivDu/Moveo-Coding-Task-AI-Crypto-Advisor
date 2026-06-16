import * as authService from "../services/authService.js";

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
