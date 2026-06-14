import { fetchExternal } from "../utils/fetchExternal.js";
import { Preferences } from "../models/Preferences.js";
import pricesFallback from "../data/pricesFallback.json" with { type: "json" };

const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets";
const DEFAULT_COINS = ["bitcoin", "ethereum", "solana", "cardano"];

export async function getPrices(userId) {
  const preferences = await Preferences.findOne({ userId });
  const coinIds = preferences?.favoriteCoins?.length ? preferences.favoriteCoins : DEFAULT_COINS;

  try {
    const url = `${COINGECKO_URL}?vs_currency=usd&ids=${coinIds.join(",")}`;
    const data = await fetchExternal(url);

    if (!Array.isArray(data) || data.length === 0) {
      return { items: pricesFallback, source: "fallback" };
    }

    const items = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      image: coin.image,
    }));

    return { items, source: "live" };
  } catch {
    return { items: pricesFallback, source: "fallback" };
  }
}
