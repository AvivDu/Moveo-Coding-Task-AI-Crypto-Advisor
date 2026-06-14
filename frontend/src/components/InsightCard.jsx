import VoteButtons from "./VoteButtons.jsx";

export default function InsightCard({ data, votes, onVote }) {
  return (
    <section className="dashboard-card">
      <h2>AI Insight of the Day</h2>
      {data.source === "fallback" && <p className="source-flag">Demo data</p>}
      <p className="insight-text">{data.text}</p>
      <VoteButtons section="insight" itemId={data.id} value={votes[data.id]} onVote={onVote} />
    </section>
  );
}
