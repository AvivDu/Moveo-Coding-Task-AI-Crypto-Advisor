export default function OptionCardGroup({ options, value, onChange, cols = 3 }) {
  return (
    <div className={`option-cards cols-${cols}`}>
      {options.map(({ id, icon: Icon, title, desc }) => (
        <div
          key={id}
          className={`option-card${value === id ? " selected" : ""}`}
          onClick={() => onChange(id)}
        >
          <div className="option-card-icon">
            <Icon size={18} />
          </div>
          <div className="check-dot">✓</div>
          <div className="option-card-title">{title}</div>
          <div className="option-card-desc">{desc}</div>
        </div>
      ))}
    </div>
  );
}
