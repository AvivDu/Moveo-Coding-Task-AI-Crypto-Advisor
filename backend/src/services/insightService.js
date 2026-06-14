import { env } from "../config/env.js";
import { fetchExternal } from "../utils/fetchExternal.js";
import { Preferences } from "../models/Preferences.js";
import insightFallback from "../data/insightFallback.json" with { type: "json" };

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODELS = ["nvidia/nemotron-nano-9b-v2:free", "meta-llama/llama-3.3-70b-instruct:free"];

function getFallbackInsight(riskTolerance) {
  const pool = insightFallback[riskTolerance] || insightFallback.medium;
  const dayIndex = new Date().getDate() % pool.length;
  return {
    id: `insight-fallback-${riskTolerance}-${dayIndex}`,
    text: pool[dayIndex],
    generatedAt: new Date().toISOString(),
    source: "fallback",
  };
}

export async function getInsight(userId) {
  const preferences = await Preferences.findOne({ userId });
  const riskTolerance = preferences?.riskTolerance || "medium";

  if (!env.openRouterApiKey) {
    return getFallbackInsight(riskTolerance);
  }

  try {
    const prompt = `Give a short (2-3 sentence) crypto market insight for an investor with experience level "${
      preferences?.experienceLevel || "beginner"
    }", risk tolerance "${riskTolerance}", interests in ${
      preferences?.interests?.join(", ") || "general crypto"
    }, and a "${preferences?.investmentHorizon || "medium"}" investment horizon focused on "${
      preferences?.investmentGoal || "growth"
    }". Keep it general and educational, not financial advice.`;

    let text;
    for (const model of OPENROUTER_MODELS) {
      try {
        const data = await fetchExternal(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.openRouterApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
          }),
          timeoutMs: 20000,
        });

        text = data.choices?.[0]?.message?.content?.trim();
        if (text) break;
      } catch {
        continue;
      }
    }

    if (!text) {
      return getFallbackInsight(riskTolerance);
    }

    return {
      id: `insight-live-${Date.now()}`,
      text,
      generatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch {
    return getFallbackInsight(riskTolerance);
  }
}
