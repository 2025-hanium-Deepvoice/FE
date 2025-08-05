import { FiPhoneCall, FiDownload } from 'react-icons/fi';

const VoiceAnalysisInfo = ({ messages, type, tips }) => {
  return (
    <div className="voice-analysis-info">
      <section className="chat-section">
        <h3>전체 대화 보기</h3>
        {messages.map((msg, index) => (
          <div key={index} className="chat-bubble">
            <p className="chat-text">
              ⚠️ {msg.text}
            </p>
            {msg.sub && <p className="chat-sub">{msg.sub}</p>}
          </div>
        ))}
      </section>

      <section className="analysis-section">
        <h3>분석 유형</h3>
        <div className="analysis-box">
          <p>사기 유형 : {type.scamType}</p>
          <p>텍스트 특징 : {type.features}</p>
        </div>
      </section>

      <section className="tips-section">
        <h3>대응 방법</h3>
        <div className="tips-box">
          {tips.map((tip, i) => (
            <p key={i}>• {tip}</p>
          ))}
        </div>
      </section>

      <div className="button-row">
        <button className="report-btn">
          <FiPhoneCall />
          신고하기
        </button>
        <button className="save-btn">
          <FiDownload />
          결과 저장
        </button>
      </div>
    </div>
  );
};

export default VoiceAnalysisInfo;
