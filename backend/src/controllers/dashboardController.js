import * as newsService from "../services/newsService.js";
import * as pricesService from "../services/pricesService.js";
import * as insightService from "../services/insightService.js";

export async function getNews(req, res, next) {
  try {
    const result = await newsService.getNews();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPrices(req, res, next) {
  try {
    const result = await pricesService.getPrices(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getInsight(req, res, next) {
  try {
    const result = await insightService.getInsight(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
