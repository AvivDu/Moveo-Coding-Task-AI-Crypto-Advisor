import * as newsService from "../services/newsService.js";

export async function getNews(req, res, next) {
  try {
    const result = await newsService.getNews();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
