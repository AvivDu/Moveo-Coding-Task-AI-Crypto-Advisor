import { useEffect, useState } from "react";
import { Coins, Plus, Search } from "lucide-react";
import { useApi } from "../api/useApi.js";

export const COIN_OPTIONS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "solana", name: "Solana", symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "binancecoin", name: "BNB", symbol: "BNB", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: "ripple", name: "XRP", symbol: "XRP", image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  { id: "cardano", name: "Cardano", symbol: "ADA", image: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
];

const CUSTOM_ID_PATTERN = /^[a-z0-9-]+$/;

export default function CoinPicker({ selectedCoins, onChange }) {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      api(`/api/dashboard/coins/search?query=${encodeURIComponent(trimmed)}`)
        .then((res) => setResults(res.items || []))
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, api]);

  function toggleCoin(id) {
    const next = selectedCoins.includes(id)
      ? selectedCoins.filter((c) => c !== id)
      : [...selectedCoins, id];
    onChange(next);
  }

  function addCoin(id) {
    if (!selectedCoins.includes(id)) {
      onChange([...selectedCoins, id]);
    }
    setQuery("");
    setResults([]);
    setSearchError("");
  }

  function handleAddCustom() {
    const trimmed = query.trim();
    if (!CUSTOM_ID_PATTERN.test(trimmed)) {
      setSearchError("Use lowercase letters, numbers, and hyphens only");
      return;
    }
    addCoin(trimmed);
  }

  const customCoins = selectedCoins.filter((id) => !COIN_OPTIONS.some((c) => c.id === id));
  const trimmedQuery = query.trim();
  const showCustomAction = trimmedQuery.length > 0 && !results.some((r) => r.id === trimmedQuery);

  return (
    <div className="coin-picker">
      <div className="coin-grid">
        {COIN_OPTIONS.map((coin) => (
          <div
            key={coin.id}
            className={`coin-tile${selectedCoins.includes(coin.id) ? " selected" : ""}`}
            onClick={() => toggleCoin(coin.id)}
          >
            <img src={coin.image} alt={coin.name} />
            <div className="check-dot">✓</div>
            <div className="coin-tile-name">{coin.name}</div>
            <div className="coin-tile-ticker">{coin.symbol}</div>
          </div>
        ))}

        {customCoins.map((id) => (
          <div
            key={id}
            className="coin-tile coin-tile-other selected"
            onClick={() => toggleCoin(id)}
          >
            <div className="coin-tile-other-icon">
              <Coins size={20} />
            </div>
            <div className="check-dot">✓</div>
            <div className="coin-tile-name">{id}</div>
            <div className="coin-tile-ticker">Custom</div>
          </div>
        ))}

        <div className="coin-tile coin-tile-other">
          <div className="coin-tile-other-icon">
            <Plus size={20} />
          </div>
          <div className="coin-tile-name">Other</div>
          <div className="coin-tile-ticker">Search below</div>
        </div>
      </div>

      <div className="coin-search">
        <div className="coin-search-input">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search any coin (e.g. polkadot)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchError("");
            }}
          />
        </div>

        {results.length > 0 && (
          <ul className="coin-search-results">
            {results.map((coin) => (
              <li key={coin.id} className="price-item coin-search-result" onClick={() => addCoin(coin.id)}>
                <img src={coin.image} alt={coin.name} className="coin-icon" />
                <div className="price-info">
                  <span className="coin-name">
                    {coin.name} <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {trimmedQuery.length >= 2 && results.length === 0 && showCustomAction && (
          <button type="button" className="coin-search-add" onClick={handleAddCustom}>
            Add "{trimmedQuery}" as custom coin
          </button>
        )}

        {searchError && <p className="form-error">{searchError}</p>}
      </div>
    </div>
  );
}
