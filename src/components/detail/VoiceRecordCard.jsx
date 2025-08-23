import { FiPlay } from "react-icons/fi";

const VoiceRecordCard = ({ record }) => {
  return (
    <div className={`record-card ${record.suspicious ? "suspicious" : ""}`}>
      {/* 왼쪽 영역 */}
      <div className="left">
        <div className="avatar">{record.emoji || "🙂"}</div>
        <div className="info">
          {/* 파일명 */}
          <p className={`name ${!record.suspicious ? "no-warning" : ""}`}>
            {record.name}
          </p>

          {/* 보이스피싱 의심 표시 */}
          {record.suspicious && (
            <p className="warning">
              ⚠️ 보이스피싱 의심 {record.score}%
            </p>
          )}

          {/* 날짜 */}
          <p className="date">{record.date}</p>
        </div>
      </div>

      {/* 오른쪽 영역 */}
      <div className="right">
        <p className="duration">{record.duration}</p>
        <button className="play-btn" aria-label="재생">
          <FiPlay />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordCard;
