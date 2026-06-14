import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../api/useApi.js";
import NewsCard from "../components/NewsCard.jsx";
import PricesCard from "../components/PricesCard.jsx";
import InsightCard from "../components/InsightCard.jsx";
import MemeCard from "../components/MemeCard.jsx";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const api = useApi();

  const [news, setNews] = useState(null);
  const [prices, setPrices] = useState(null);
  const [insight, setInsight] = useState(null);
  const [meme, setMeme] = useState(null);
  const [votes, setVotes] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [newsRes, pricesRes, insightRes, memeRes, votesRes] = await Promise.all([
          api("/api/dashboard/news"),
          api("/api/dashboard/prices"),
          api("/api/dashboard/insight"),
          api("/api/dashboard/meme"),
          api("/api/votes"),
        ]);

        setNews(newsRes);
        setPrices(pricesRes);
        setInsight(insightRes);
        setMeme(memeRes);

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
        <h1>Your Daily Crypto Dashboard</h1>
        <div>
          <span className="user-email">{user?.email}</span>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <div className="dashboard-grid">
        <NewsCard data={news} votes={votes} onVote={handleVote} />
        <PricesCard data={prices} votes={votes} onVote={handleVote} />
        <InsightCard data={insight} votes={votes} onVote={handleVote} />
        <MemeCard data={meme} votes={votes} onVote={handleVote} />
      </div>
    </div>
  );
}
