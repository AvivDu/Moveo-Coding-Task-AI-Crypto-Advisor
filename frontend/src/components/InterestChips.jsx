export default function InterestChips({ options, value, onChange }) {
  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="interest-grid">
      {options.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className={`interest-chip${value.includes(id) ? " selected" : ""}`}
          onClick={() => toggle(id)}
        >
          <Icon size={14} />
          {label}
        </div>
      ))}
    </div>
  );
}
