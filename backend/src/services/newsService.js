import { env } from "../config/env.js";
import { fetchExternal } from "../utils/fetchExternal.js";
import newsFallback from "../data/newsFallback.json" with { type: "json" };

const CRYPTOPANIC_URL = "https://cryptopanic.com/api/v1/posts/";

export async function getNews() {
  if (!env.cryptoPanicApiKey) {
    return { items: newsFallback, source: "fallback" };
  }

  try {
    const url = `${CRYPTOPANIC_URL}?auth_token=${env.cryptoPanicApiKey}&public=true`;
    const data = await fetchExternal(url);

    const items = (data.results || []).slice(0, 5).map((post) => ({
      id: String(post.id),
      title: post.title,
      url: post.url,
      source: post.source?.title || "CryptoPanic",
      publishedAt: post.published_at,
    }));

    if (items.length === 0) {
      return { items: newsFallback, source: "fallback" };
    }

    return { items, source: "live" };
  } catch {
    return { items: newsFallback, source: "fallback" };
  }
}
