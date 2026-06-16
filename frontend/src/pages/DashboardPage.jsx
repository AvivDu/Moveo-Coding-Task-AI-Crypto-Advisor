import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bitcoin, LogOut, Sparkles, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../api/useApi.js";
import NewsCard from "../components/NewsCard.jsx";
import PricesCard from "../components/PricesCard.jsx";
import InsightCard from "../components/InsightCard.jsx";
import MemeCard from "../components/MemeCard.jsx";

const EXPERIENCE_LABELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const RISK_LABELS = { low: "Conservative", medium: "Balanced", high: "Aggressive" };
const GOAL_LABELS = { growth: "Growth", income: "Income", learning: "Learning" };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [prices, setPrices] = useState(null);
  const [insight, setInsight] = useState(null);
  const [meme, setMeme] = useState(null);
  const [votes, setVotes] = useState({});
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [newsRes, pricesRes, insightRes, memeRes, votesRes, preferencesRes] = await Promise.all([
          api("/api/dashboard/news"),
          api("/api/dashboard/prices"),
          api("/api/dashboard/insight"),
          api("/api/dashboard/meme"),
          api("/api/votes"),
          api("/api/preferences"),
        ]);

        setNews(newsRes);
        setPrices(pricesRes);
        setInsight(insightRes);
        setMeme(memeRes);
        setPreferences(preferencesRes.preferences);

        const voteMap = {};
        for (const vote of votesRes.votes) {
          voteMap[vote.itemId] = vote.value;
        }
        setVotes(voteMap);
      } catch (err) {
        setError(err.message);
      }
    }

    loadDashboard();
  }, [api]);

  async function handleVote(section, itemId, value) {
    setVotes((prev) => ({ ...prev, [itemId]: value }));

    try {
      await api("/api/votes", { method: "POST", body: { section, itemId, value } });
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!news || !prices || !insight || !meme) {
    return <p className="loading">Loading your dashboard...</p>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <span className="brand-logo">
            <Bitcoin size={18} />
          </span>
          <h1>CryptoAdvisor</h1>
        </div>
        <div>
          <span className="user-email">{user?.name || user?.email}</span>
          <button type="button" onClick={logout}>
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </header>

      {preferences && (
        <div className="dashboard-welcome">
          <p>
            Profile: <strong>{EXPERIENCE_LABELS[preferences.experienceLevel] ?? preferences.experienceLevel}</strong> ·
            {" "}Risk: <strong>{RISK_LABELS[preferences.riskTolerance] ?? preferences.riskTolerance}</strong> ·
            {" "}Goal: <strong>{GOAL_LABELS[preferences.investmentGoal] ?? preferences.investmentGoal}</strong>
            {preferences.favoriteCoins?.length > 0 && (
              <>
                {" "}· Tracking <strong>{preferences.favoriteCoins.join(", ")}</strong>
              </>
            )}
          </p>
          <div className="dashboard-welcome-actions">
            <button type="button" className="btn-edit-preferences" onClick={() => navigate("/preferences/edit")}>
              <Settings size={12} />
              Edit preferences
            </button>
            <div className="dashboard-welcome-badge">
              <Sparkles size={11} />
              AI-personalized
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <NewsCard data={news} votes={votes} onVote={handleVote} />
        <PricesCard data={prices} votes={votes} onVote={handleVote} />
        <InsightCard data={insight} votes={votes} onVote={handleVote} />
        <MemeCard data={meme} votes={votes} onVote={handleVote} />
      </div>
    </div>
  );
}
