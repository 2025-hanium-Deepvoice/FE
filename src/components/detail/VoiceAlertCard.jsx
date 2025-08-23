// src/components/detail/VoiceAlertCard.jsx
import React from "react";
import { FiPlay, FiAlertTriangle } from "react-icons/fi";

const VoiceAlertCard = ({ name, date, duration, score }) => {
  return (
    <div className="record-card suspicious detail">
      <div className="avatar"><span aria-hidden>🙂</span></div>
      <div className="info">
        <p className="name">{name}</p>
        <p className="warning">
          <FiAlertTriangle className="warn-icon" aria-hidden />
          보이스피싱 의심 <strong>{score}%</strong>
        </p>
        <p className="date">{date}</p>
      </div>
      <div className="right">
        <p className="duration">{duration}</p>
        <button className="play-btn" aria-label="재생"><FiPlay /></button>
      </div>
    </div>
  );
};

export default VoiceAlertCard;
