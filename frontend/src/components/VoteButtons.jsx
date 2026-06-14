export default function VoteButtons({ section, itemId, value, onVote }) {
  return (
    <div className="vote-buttons">
      <button
        type="button"
        className={value === "up" ? "vote-btn active" : "vote-btn"}
        onClick={() => onVote(section, itemId, "up")}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        type="button"
        className={value === "down" ? "vote-btn active" : "vote-btn"}
        onClick={() => onVote(section, itemId, "down")}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  );
}
