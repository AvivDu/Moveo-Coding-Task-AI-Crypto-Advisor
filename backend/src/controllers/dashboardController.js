import * as newsService from "../services/newsService.js";
import * as pricesService from "../services/pricesService.js";
import * as insightService from "../services/insightService.js";
import * as memeService from "../services/memeService.js";
import * as searchService from "../services/searchService.js";

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

export function getMeme(req, res, next) {
  try {
    const result = memeService.getMeme();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCoinSearch(req, res, next) {
  try {
    const query = (req.query.query || "").trim();
    if (query.length < 2) return res.json({ items: [] });
    const items = await searchService.searchCoins(query);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
