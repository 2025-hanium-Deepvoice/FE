import { FaExclamationCircle } from "react-icons/fa";

// props로 점수/날짜/길이 받도록 변경
const VoiceAlertCard = ({ score, detectedAt, durationLabel }) => {
  return (
    <div className="voice-alert-card">
      <div className="icon-circle">
        <FaExclamationCircle className="icon" />
      </div>
      <div className="alert-info">
        <div className="alert-title">보이스피싱 의심됨</div>
        <div className="alert-sub">합성 음성+텍스트분석 {score ?? "–"}%</div>
        <div className="alert-date">
          {detectedAt} {durationLabel ? `  ${durationLabel}` : ""}
        </div>
      </div>
    </div>
  );
};

export default VoiceAlertCard;
