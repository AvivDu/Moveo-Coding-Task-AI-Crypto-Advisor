import * as preferencesService from "../services/preferencesService.js";

export async function getPreferences(req, res, next) {
  try {
    const preferences = await preferencesService.getPreferences(req.userId);
    res.json({ preferences });
  } catch (err) {
    next(err);
  }
}

export async function savePreferences(req, res, next) {
  try {
    const preferences = await preferencesService.savePreferences(req.userId, req.body);
    res.json({ preferences });
  } catch (err) {
    next(err);
  }
}
