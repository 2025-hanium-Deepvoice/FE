import React, { useState, useRef } from 'react';
import { Mic, User, Pencil, X } from 'lucide-react';
import '../assets/sass/setting/_voice-upload.scss';

const VoiceUpload = () => {
  const [profiles, setProfiles] = useState([
    { name: '', relation: '', audioURL: '', isRecorded: false, image: null },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);

  const handleChange = (index, field, value) => {
    const updated = [...profiles];
    updated[index][field] = value;
    setProfiles(updated);
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    const updated = [...profiles];
    updated[index].image = URL.createObjectURL(file);
    setProfiles(updated);
  };

  const clearImage = (index) => {
    const updated = [...profiles];
    updated[index].image = null;
    setProfiles(updated);
  };

  const handleRecord = (index) => {
    setCurrentIndex(index);
    setShowPopup(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        audioChunks.current = [];

        const updated = [...profiles];
        updated[currentIndex].audioURL = url;
        updated[currentIndex].isRecorded = true;
        setProfiles(updated);
        setShowPopup(false);

        // 마이크 스트림 해제
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('음성 녹음 권한이 거부되었습니다:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
    setIsRecording(false);
  };

  const addProfile = () => {
    setProfiles((prev) => [
      ...prev,
      { name: '', relation: '', audioURL: '', isRecorded: false, image: null },
    ]);
  };

  return (
    <div className="voice-wrap container2">
      <div className="voice-upload">
        <h2>프로필 등록</h2>
        <p className="description">가까운 사람들의 프로필을 등록합니다.</p>

        {profiles.map((profile, index) => (
          <div key={index} className="profile-box">
            {/* 프로필 이미지 */}
            <div className="profile-image">
              <label className="image-hit-area">
                {profile.image ? (
                  <img src={profile.image} alt="profile" className="preview-image" />
                ) : (
                  <div className="placeholder">
                    <User size={36} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                />
                <span className="edit-badge" title="사진 변경">
                  <Pencil size={14} />
                </span>
              </label>

              {profile.image && (
                <button
                  type="button"
                  className="image-clear"
                  onClick={() => clearImage(index)}
                  title="사진 제거"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 텍스트 입력 */}
            <div className="input-group">
              <label>이름</label>
              <input
                type="text"
                placeholder="ex ) 홍길동"
                value={profile.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>관계</label>
              <input
                type="text"
                placeholder="ex ) 엄마"
                value={profile.relation}
                onChange={(e) => handleChange(index, 'relation', e.target.value)}
              />
            </div>

            {/* 녹음 영역 */}
            <div className="record-section">
              <div className="record-label">
                <Mic size={18} /> <span>목소리 등록하기</span>
              </div>

              <div className="record-controls">
                <button
                  type="button"
                  className={`record-btn ${profile.isRecorded ? 'recorded' : ''}`}
                  onClick={() => handleRecord(index)}
                >
                  {profile.isRecorded ? '재녹음 하기' : '녹음 시작'}
                </button>

                {profile.audioURL && (
                  <audio
                    controls
                    src={profile.audioURL}
                    className="audio-preview"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        <button className="add-button" onClick={addProfile}>+</button>

        {/* 녹음 팝업 */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <Mic size={48} className="popup-mic" />
              {!isRecording ? (
                <>
                  <p className="popup-title">
                    화면에 보이는 제시 문장을<br />시작 버튼을 누르고 읽어주세요
                  </p>
                  <p className="popup-script">
                    “ 안녕하세요. 반갑습니다. Ai 딥보이스 탐지를 위하여<br />
                    제시 문장을 읽고 녹음하는 과정입니다. 이는 딥보이스 판별을<br />
                    위한 음성 입니다. 오늘 내일 모레<br />
                    하나 둘 셋 가나다라마바사”
                  </p>
                  <button className="popup-button" onClick={startRecording}>
                    녹음 시작
                  </button>
                </>
              ) : (
                <>
                  <p className="popup-title">🎙️ 녹음 중입니다...</p>
                  <p className="popup-script">모두 녹음되면 중지 버튼을 눌러주세요.</p>
                  <button className="popup-button" onClick={stopRecording}>
                    녹음 중지
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceUpload;
