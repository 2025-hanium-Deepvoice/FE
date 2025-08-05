import { FaExclamationCircle } from "react-icons/fa";

const VoiceAlertCard = () => {
  return (
    <div className="voice-alert-card">
      <div className="icon-circle">
        <FaExclamationCircle className="icon" />
      </div>
      <div className="alert-info">
        <div className="alert-title">보이스피싱 의심됨</div>
        <div className="alert-sub">합성 음성+텍스트분석 73%</div>
        <div className="alert-date">2025.08.23  3분 15초</div>
      </div>
    </div>
  );
};

export default VoiceAlertCard;
