import { FiPlay } from 'react-icons/fi';

const VoiceRecordCard = ({ record }) => {
  return (
    <div className={`record-card ${record.suspicious ? 'suspicious' : ''}`}>
      <div className="left">
        <div className="avatar">{record.emoji}</div>
        <div className="info">
          <p className={`name ${!record.suspicious ? 'no-warning' : ''}`}>
            {record.name}
          </p>
          {record.suspicious && (
            <p className="warning">⚠️ 보이스피싱 의심 {record.score}%</p>
          )}
          <p className="date">{record.date}</p>
        </div>
      </div>
      <div className="right">
        <p className="duration">{record.duration}</p>
        <button className="play-btn"><FiPlay /></button>
      </div>
    </div>
  );
};

export default VoiceRecordCard;
