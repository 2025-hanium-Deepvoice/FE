// src/components/detail/VoiceRecordCard.jsx
import React from "react";
import { FiPlay, FiAlertTriangle } from "react-icons/fi";

const VoiceRecordCard = ({ record }) => {
  const { suspicious, score, name, date, duration, emoji, avatarUrl } = record;

  return (
    <div className={`record-card ${suspicious ? "suspicious" : ""}`}>
      {/* 아바타 */}
      <div className="avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" aria-hidden />
        ) : (
          <span aria-hidden>{emoji || "🙂"}</span>
        )}
      </div>

      {/* 정보 */}
      <div className="info">
        <p className="name">{name}</p>

        {suspicious && (
          <p className="warning" role="status">
            <FiAlertTriangle className="warn-icon" aria-hidden />
            보이스피싱 의심 <strong>{score}%</strong>
          </p>
        )}

        <p className="date">{date}</p>
      </div>

      {/* 우측 영역 */}
      <div className="right">
        <p className="duration">{duration}</p>
        <button className="play-btn" aria-label="재생">
          <FiPlay />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordCard;
