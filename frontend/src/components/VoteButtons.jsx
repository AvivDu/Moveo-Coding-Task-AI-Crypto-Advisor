import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function VoteButtons({ section, itemId, value, onVote }) {
  return (
    <div className="vote-buttons">
      <button
        type="button"
        className={value === "up" ? "vote-btn up active" : "vote-btn up"}
        onClick={() => onVote(section, itemId, "up")}
        aria-label="Thumbs up"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        type="button"
        className={value === "down" ? "vote-btn down active" : "vote-btn down"}
        onClick={() => onVote(section, itemId, "down")}
        aria-label="Thumbs down"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}
