import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bitcoin, Sparkles } from "lucide-react";
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

export default function EditPreferencesPage() {
  const navigate = useNavigate();
  const api = useApi();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await api("/api/preferences");
        const prefs = res.preferences;
        setForm({
          experienceLevel: prefs?.experienceLevel ?? "beginner",
          riskTolerance: prefs?.riskTolerance ?? "medium",
          investmentHorizon: prefs?.investmentHorizon ?? "medium",
          investmentGoal: prefs?.investmentGoal ?? "growth",
          favoriteCoins: prefs?.favoriteCoins ?? ["bitcoin", "ethereum"],
          interests: prefs?.interests ?? ["news"],
        });
      } catch (err) {
        setError(err.message);
      }
    }

    loadPreferences();
  }, [api]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      await api("/api/preferences", { method: "PUT", body: form });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!form) {
    return <p className="loading">Loading your preferences...</p>;
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

        <div className="step">
          <div className="step-header">
            <p className="step-label">Edit preferences</p>
            <h1>Update your profile</h1>
            <p>Change any answers below — your dashboard updates right away.</p>
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

          <div className="section-label">Favorite coins</div>

          <CoinPicker
            selectedCoins={form.favoriteCoins}
            onChange={(coins) => setField("favoriteCoins", coins)}
          />

          <div className="section-label">Interests</div>

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
            <button type="button" className="btn-back" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button type="button" className="btn-finish" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save changes"} <Sparkles size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
