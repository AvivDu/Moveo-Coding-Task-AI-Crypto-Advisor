import { TrendingUp } from "lucide-react";
import VoteButtons from "./VoteButtons.jsx";

export default function PricesCard({ data, votes, onVote }) {
  return (
    <section className="dashboard-card">
      <h2>
        <span className="card-icon card-icon-teal">
          <TrendingUp size={14} />
        </span>
        Coin Prices
      </h2>
      {data.source === "fallback" && <p className="source-flag">Demo data</p>}
      <ul className="prices-list">
        {data.items.map((item) => (
          <li key={item.id} className="price-item">
            <img src={item.image} alt={item.name} className="coin-icon" />
            <div className="price-info">
              <span className="coin-name">
                {item.name} <span className="coin-symbol">{item.symbol.toUpperCase()}</span>
              </span>
              <span className="coin-price">${item.price.toLocaleString()}</span>
              <span className={item.change24h >= 0 ? "change-positive" : "change-negative"}>
                {item.change24h.toFixed(2)}%
              </span>
            </div>
            <VoteButtons section="prices" itemId={item.id} value={votes[item.id]} onVote={onVote} />
          </li>
        ))}
      </ul>
    </section>
  );
}
