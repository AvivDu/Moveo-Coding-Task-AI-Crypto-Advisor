import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../api/useApi.js";

const INTEREST_OPTIONS = ["defi", "nfts", "trading", "news", "regulation", "technology"];

const COIN_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
  { id: "solana", label: "Solana (SOL)" },
  { id: "cardano", label: "Cardano (ADA)" },
  { id: "dogecoin", label: "Dogecoin (DOGE)" },
  { id: "ripple", label: "XRP" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const api = useApi();
  const { setHasCompletedOnboarding } = useAuth();

  const [form, setForm] = useState({
    experienceLevel: "beginner",
    riskTolerance: "medium",
    investmentHorizon: "medium",
    investmentGoal: "growth",
    favoriteCoins: ["bitcoin", "ethereum"],
    interests: ["news"],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleListValue(field, value) {
    setForm((prev) => {
      const list = prev[field];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/preferences", { method: "PUT", body: form });
      setHasCompletedOnboarding(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-page">
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <h1>Tell us about you</h1>
        <p>This shapes the news, prices, and AI insight on your dashboard.</p>

        <label>
          Experience level
          <select
            value={form.experienceLevel}
            onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label>
          Risk tolerance
          <select
            value={form.riskTolerance}
            onChange={(e) => setForm({ ...form, riskTolerance: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          Investment horizon
          <select
            value={form.investmentHorizon}
            onChange={(e) => setForm({ ...form, investmentHorizon: e.target.value })}
          >
            <option value="short">Short term</option>
            <option value="medium">Medium term</option>
            <option value="long">Long term</option>
          </select>
        </label>

        <label>
          Investment goal
          <select
            value={form.investmentGoal}
            onChange={(e) => setForm({ ...form, investmentGoal: e.target.value })}
          >
            <option value="growth">Growth</option>
            <option value="income">Income</option>
            <option value="learning">Learning</option>
          </select>
        </label>

        <fieldset>
          <legend>Favorite coins</legend>
          <div className="checkbox-grid">
            {COIN_OPTIONS.map((coin) => (
              <label key={coin.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={form.favoriteCoins.includes(coin.id)}
                  onChange={() => toggleListValue("favoriteCoins", coin.id)}
                />
                {coin.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Interests</legend>
          <div className="checkbox-grid">
            {INTEREST_OPTIONS.map((interest) => (
              <label key={interest} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={form.interests.includes(interest)}
                  onChange={() => toggleListValue("interests", interest)}
                />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}
