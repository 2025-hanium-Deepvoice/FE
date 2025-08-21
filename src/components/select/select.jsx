export default function ProfileSelectCard({
  profile,
  onSelect,
  isActive = false,
}) {
  const { emoji, avatarUrl, relation, name } = profile;

  return (
    <button
      type="button"
      className={`profile-card ${isActive ? "is-active" : ""}`}
      onClick={() => onSelect?.(profile)}
      aria-label={`${relation} | ${name} 선택`}
    >
      <div className="left">
        <div className="avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${relation} 아바타`} />
          ) : (
            <span className="emoji" aria-hidden>
              {emoji || "👤"}
            </span>
          )}
        </div>

        <div className="meta">
          <span className="relation">{relation}</span>
          <span className="bar"> | </span>
          <span className="name">{name}</span>
        </div>
      </div>
    </button>
  );
}
