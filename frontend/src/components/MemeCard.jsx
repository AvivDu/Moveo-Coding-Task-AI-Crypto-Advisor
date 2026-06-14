import { Smile } from "lucide-react";
import VoteButtons from "./VoteButtons.jsx";

export default function MemeCard({ data, votes, onVote }) {
  return (
    <section className="dashboard-card">
      <h2>
        <span className="card-icon card-icon-amber">
          <Smile size={14} />
        </span>
        Crypto Meme
      </h2>
      <img src={data.imageUrl} alt={data.caption} className="meme-image" />
      <p className="meme-caption">{data.caption}</p>
      <VoteButtons section="meme" itemId={data.id} value={votes[data.id]} onVote={onVote} />
    </section>
  );
}
