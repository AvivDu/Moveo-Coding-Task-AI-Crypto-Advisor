import { Newspaper } from "lucide-react";
import VoteButtons from "./VoteButtons.jsx";

export default function NewsCard({ data, votes, onVote }) {
  return (
    <section className="dashboard-card">
      <h2>
        <span className="card-icon">
          <Newspaper size={14} />
        </span>
        Market News
      </h2>
      {data.source === "fallback" && <p className="source-flag">Demo data</p>}
      <ul className="news-list">
        {data.items.map((item) => (
          <li key={item.id} className="news-item">
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            <div className="news-meta">
              <span>{item.source}</span>
              <VoteButtons section="news" itemId={item.id} value={votes[item.id]} onVote={onVote} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
