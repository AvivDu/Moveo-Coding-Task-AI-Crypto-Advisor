import { fetchExternal } from "../utils/fetchExternal.js";
import newsFallback from "../data/newsFallback.json" with { type: "json" };

const COINDESK_RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

function extractTag(itemXml, tag) {
  const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim();
}

function parseRssItems(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map((itemXml) => ({
    id: extractTag(itemXml, "guid"),
    title: extractTag(itemXml, "title"),
    url: extractTag(itemXml, "link"),
    source: "CoinDesk",
    publishedAt: extractTag(itemXml, "pubDate"),
  }));
}

export async function getNews() {
  try {
    const xml = await fetchExternal(COINDESK_RSS_URL, { responseType: "text" });
    const items = parseRssItems(xml)
      .filter((item) => item.id && item.title && item.url)
      .slice(0, 5);

    if (items.length === 0) {
      return { items: newsFallback, source: "fallback" };
    }

    return { items, source: "live" };
  } catch {
    return { items: newsFallback, source: "fallback" };
  }
}
