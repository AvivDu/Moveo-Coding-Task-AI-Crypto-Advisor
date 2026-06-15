import { fetchExternal } from "../utils/fetchExternal.js";

const COINGECKO_SEARCH_URL = "https://api.coingecko.com/api/v3/search";

export async function searchCoins(query) {
  const url = `${COINGECKO_SEARCH_URL}?query=${encodeURIComponent(query)}`;
  const data = await fetchExternal(url);
  return (data.coins || []).slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    image: c.thumb,
  }));
}
