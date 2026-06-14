import VoteButtons from "./VoteButtons.jsx";

export default function MemeCard({ data, votes, onVote }) {
  return (
    <section className="dashboard-card">
      <h2>Crypto Meme</h2>
      <img src={data.imageUrl} alt={data.caption} className="meme-image" />
      <p className="meme-caption">{data.caption}</p>
      <VoteButtons section="meme" itemId={data.id} value={votes[data.id]} onVote={onVote} />
    </section>
  );
}
