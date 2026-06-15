import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bitcoin, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../api/useApi.js";
import OptionCardGroup from "../components/OptionCardGroup.jsx";
import InterestChips from "../components/InterestChips.jsx";
import CoinPicker from "../components/CoinPicker.jsx";
import {
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  RISK_OPTIONS,
  HORIZON_OPTIONS,
  INTEREST_OPTIONS,
} from "../constants/preferencesOptions.js";

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

            <OptionCardGroup
              options={EXPERIENCE_OPTIONS}
              value={form.experienceLevel}
              onChange={(id) => setField("experienceLevel", id)}
              cols={3}
            />

            <div className="section-label">Investment goal</div>

            <OptionCardGroup
              options={GOAL_OPTIONS}
              value={form.investmentGoal}
              onChange={(id) => setField("investmentGoal", id)}
              cols={3}
            />

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

            <CoinPicker
              selectedCoins={form.favoriteCoins}
              onChange={(coins) => setField("favoriteCoins", coins)}
            />

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

            <InterestChips
              options={INTEREST_OPTIONS}
              value={form.interests}
              onChange={(interests) => setField("interests", interests)}
            />

            <div className="section-label">Risk tolerance</div>

            <OptionCardGroup
              options={RISK_OPTIONS}
              value={form.riskTolerance}
              onChange={(id) => setField("riskTolerance", id)}
              cols={3}
            />

            <div className="section-label">Investment horizon</div>

            <OptionCardGroup
              options={HORIZON_OPTIONS}
              value={form.investmentHorizon}
              onChange={(id) => setField("investmentHorizon", id)}
              cols={3}
            />

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
