import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bitcoin,
  Sprout,
  BarChart2,
  Zap,
  TrendingUp,
  Wallet,
  BookOpen,
  Shield,
  Sliders,
  Flame,
  Clock,
  CalendarClock,
  CalendarRange,
  ArrowRight,
  Sparkles,
  Link2,
  Image as ImageIcon,
  LineChart,
  Newspaper,
  Scale,
  Cpu,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../api/useApi.js";

const EXPERIENCE_OPTIONS = [
  { id: "beginner", icon: Sprout, title: "Beginner", desc: "Just getting started with crypto" },
  { id: "intermediate", icon: BarChart2, title: "Intermediate", desc: "Know the basics, exploring more" },
  { id: "advanced", icon: Zap, title: "Advanced", desc: "Active trader or developer" },
];

const GOAL_OPTIONS = [
  { id: "growth", icon: TrendingUp, title: "Growth", desc: "Maximize portfolio value" },
  { id: "income", icon: Wallet, title: "Income", desc: "Generate passive returns" },
  { id: "learning", icon: BookOpen, title: "Learning", desc: "Understand the space better" },
];

const RISK_OPTIONS = [
  { id: "low", icon: Shield, title: "Conservative", desc: "Preserve capital, steady gains" },
  { id: "medium", icon: Sliders, title: "Balanced", desc: "Mix of growth and stability" },
  { id: "high", icon: Flame, title: "Aggressive", desc: "Max upside, higher volatility" },
];

const HORIZON_OPTIONS = [
  { id: "short", icon: Clock, title: "Short term", desc: "Weeks to a few months" },
  { id: "medium", icon: CalendarRange, title: "Medium term", desc: "Several months to a year" },
  { id: "long", icon: CalendarClock, title: "Long term", desc: "A year or more" },
];

const COIN_OPTIONS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "solana", name: "Solana", symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "binancecoin", name: "BNB", symbol: "BNB", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: "ripple", name: "XRP", symbol: "XRP", image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  { id: "cardano", name: "Cardano", symbol: "ADA", image: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
];

const INTEREST_OPTIONS = [
  { id: "defi", icon: Link2, label: "DeFi" },
  { id: "nfts", icon: ImageIcon, label: "NFTs" },
  { id: "trading", icon: LineChart, label: "Trading" },
  { id: "news", icon: Newspaper, label: "Market News" },
  { id: "regulation", icon: Scale, label: "Regulation" },
  { id: "technology", icon: Cpu, label: "Technology" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const api = useApi();
  const { setHasCompletedOnboarding } = useAuth();

  const [step, setStep] = useState(1);
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

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleListValue(field, value) {
    setForm((prev) => {
      const list = prev[field];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      await api("/api/preferences", { method: "PUT", body: form });
      setHasCompletedOnboarding(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-shell">
        <div className="brand">
          <span className="brand-logo">
            <Bitcoin size={18} />
          </span>
          CryptoAdvisor
        </div>

        <div className="step-progress">
          <div className={`step-node${step === 1 ? " active" : step > 1 ? " done" : ""}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <div className={`step-connector${step >= 2 ? " done" : ""}`} />
          <div className={`step-node${step === 2 ? " active" : step > 2 ? " done" : ""}`}>
            {step > 2 ? "✓" : "2"}
          </div>
          <div className={`step-connector${step >= 3 ? " done" : ""}`} />
          <div className={`step-node${step === 3 ? " active" : ""}`}>3</div>
        </div>

        {step === 1 && (
          <div className="step">
            <div className="step-header">
              <p className="step-label">Step 1 of 3 · Your Profile</p>
              <h1>How experienced are you?</h1>
              <p>We calibrate AI insight complexity to match your level.</p>
            </div>

            <div className="option-cards cols-3">
              {EXPERIENCE_OPTIONS.map(({ id, icon: Icon, title, desc }) => (
                <div
                  key={id}
                  className={`option-card${form.experienceLevel === id ? " selected" : ""}`}
                  onClick={() => setField("experienceLevel", id)}
                >
                  <div className="option-card-icon">
                    <Icon size={18} />
                  </div>
                  <div className="check-dot">✓</div>
                  <div className="option-card-title">{title}</div>
                  <div className="option-card-desc">{desc}</div>
                </div>
              ))}
            </div>

            <div className="section-label">Investment goal</div>

            <div className="option-cards cols-3">
              {GOAL_OPTIONS.map(({ id, icon: Icon, title, desc }) => (
                <div
                  key={id}
                  className={`option-card${form.investmentGoal === id ? " selected" : ""}`}
                  onClick={() => setField("investmentGoal", id)}
                >
                  <div className="option-card-icon">
                    <Icon size={18} />
                  </div>
                  <div className="check-dot">✓</div>
                  <div className="option-card-title">{title}</div>
                  <div className="option-card-desc">{desc}</div>
                </div>
              ))}
            </div>

            <div className="step-nav">
              <div className="social-proof">
                <div className="social-proof-avatars">
                  <span style={{ background: "#7c3aed" }}>A</span>
                  <span style={{ background: "#06b6d4" }}>M</span>
                  <span style={{ background: "#16a34a" }}>J</span>
                  <span style={{ background: "#f59e0b" }}>K</span>
                </div>
                <span>50,000+ traders trust CryptoAdvisor</span>
              </div>
              <button type="button" className="btn-next" onClick={() => setStep(2)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <div className="step-header">
              <p className="step-label">Step 2 of 3 · Your Coins</p>
              <h1>Which coins do you follow?</h1>
              <p>Pick as many as you like. Your dashboard and prices are built around these.</p>
            </div>

            <div className="coin-grid">
              {COIN_OPTIONS.map((coin) => (
                <div
                  key={coin.id}
                  className={`coin-tile${form.favoriteCoins.includes(coin.id) ? " selected" : ""}`}
                  onClick={() => toggleListValue("favoriteCoins", coin.id)}
                >
                  <img src={coin.image} alt={coin.name} />
                  <div className="check-dot">✓</div>
                  <div className="coin-tile-name">{coin.name}</div>
                  <div className="coin-tile-ticker">{coin.symbol}</div>
                </div>
              ))}
            </div>

            <div className="step-nav">
              <button type="button" className="btn-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn-next" onClick={() => setStep(3)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <div className="step-header">
              <p className="step-label">Step 3 of 3 · Your Interests</p>
              <h1>What do you care about?</h1>
              <p>Your AI news feed is shaped around these topics.</p>
            </div>

            <div className="interest-grid">
              {INTEREST_OPTIONS.map(({ id, icon: Icon, label }) => (
                <div
                  key={id}
                  className={`interest-chip${form.interests.includes(id) ? " selected" : ""}`}
                  onClick={() => toggleListValue("interests", id)}
                >
                  <Icon size={14} />
                  {label}
                </div>
              ))}
            </div>

            <div className="section-label">Risk tolerance</div>

            <div className="option-cards cols-3">
              {RISK_OPTIONS.map(({ id, icon: Icon, title, desc }) => (
                <div
                  key={id}
                  className={`option-card${form.riskTolerance === id ? " selected" : ""}`}
                  onClick={() => setField("riskTolerance", id)}
                >
                  <div className="option-card-icon">
                    <Icon size={18} />
                  </div>
                  <div className="check-dot">✓</div>
                  <div className="option-card-title">{title}</div>
                  <div className="option-card-desc">{desc}</div>
                </div>
              ))}
            </div>

            <div className="section-label">Investment horizon</div>

            <div className="option-cards cols-3">
              {HORIZON_OPTIONS.map(({ id, icon: Icon, title, desc }) => (
                <div
                  key={id}
                  className={`option-card${form.investmentHorizon === id ? " selected" : ""}`}
                  onClick={() => setField("investmentHorizon", id)}
                >
                  <div className="option-card-icon">
                    <Icon size={18} />
                  </div>
                  <div className="check-dot">✓</div>
                  <div className="option-card-title">{title}</div>
                  <div className="option-card-desc">{desc}</div>
                </div>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="step-nav">
              <button type="button" className="btn-back" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button type="button" className="btn-finish" onClick={handleFinish} disabled={loading}>
                {loading ? "Saving..." : "Build my dashboard"} <Sparkles size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
