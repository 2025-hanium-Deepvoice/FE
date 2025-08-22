import React, { useState, useRef } from 'react';
import { Mic, User, Pencil, X, UploadCloud } from 'lucide-react';
import '../assets/sass/setting/_voice-upload.scss';
import { apiCreateProfile } from "../store/endpoint";

const API_BASE = import.meta?.env?.VITE_API_BASE || 'https://deepvoice-be.shop';
const API_PATH = '/profiles'; // 명세서 기준: /profiles

const ALLOWED_MIME = new Set([
  'audio/mpeg',   // mp3
  'audio/mp4',    // m4a
  'audio/wav',
  'audio/webm',
  'audio/x-wav',
]);
const MAX_SIZE = 50 * 1024 * 1024;

const getToken = () => localStorage.getItem('token') || '';

const blobToFile = (blob, filename, forceType) => {
  const type = forceType || blob.type || 'audio/webm';
  return new File([blob], filename, { type });
};

const VoiceUpload = () => {
  const [profiles, setProfiles] = useState([
    { name: '', relation: '', audioURL: '', voiceFile: null, isRecorded: false, image: null, uploading: false, error: null, justUploaded: false },
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
      const options =
        (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm'))
          ? { mimeType: 'audio/webm' }
          : undefined;

      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        audioChunks.current = [];

        const file = blobToFile(blob, `recording_${Date.now()}.webm`, 'audio/webm');

        const updated = [...profiles];
        updated[currentIndex].audioURL = url;
        updated[currentIndex].voiceFile = file;
        updated[currentIndex].isRecorded = true;
        setProfiles(updated);
        setShowPopup(false);

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('음성 녹음 권한이 거부되었습니다:', err);
      setProfiles((prev) => {
        const u = [...prev];
        u[currentIndex].error = '마이크 권한을 허용해 주세요.';
        return u;
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
    setIsRecording(false);
  };

  const addProfile = () => {
    setProfiles((prev) => [
      ...prev,
      { name: '', relation: '', audioURL: '', voiceFile: null, isRecorded: false, image: null, uploading: false, error: null, justUploaded: false },
    ]);
  };

  const handleVoiceFileSelect = (index, file) => {
    if (!file) return;
    if (!ALLOWED_MIME.has(file.type)) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '허용되지 않는 오디오 형식입니다. (mp3, m4a, wav, webm)';
        return u;
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '파일 크기가 50MB를 초과합니다.';
        return u;
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setProfiles((prev) => {
      const u = [...prev];
      u[index].audioURL = url;
      u[index].voiceFile = file;
      u[index].isRecorded = false;
      u[index].error = null;
      return u;
    });
  };

  // 서버 업로드
  const uploadProfile = async (index) => {
    const profile = profiles[index];
    const token = getToken();

    if (!token) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '로그인이 필요합니다. (JWT 토큰이 없습니다)';
        return u;
      });
      return;
    }
    if (!profile.name.trim() || !profile.relation.trim()) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '이름과 관계를 입력해 주세요.';
        return u;
      });
      return;
    }
    if (!profile.voiceFile) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '업로드할 음성 파일이 없습니다. 녹음하거나 파일을 선택해 주세요.';
        return u;
      });
      return;
    }
    if (!ALLOWED_MIME.has(profile.voiceFile.type)) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '허용되지 않는 오디오 형식입니다. (mp3, m4a, wav, webm)';
        return u;
      });
      return;
    }
    if (profile.voiceFile.size > MAX_SIZE) {
      setProfiles((prev) => {
        const u = [...prev];
        u[index].error = '파일 크기가 50MB를 초과합니다.';
        return u;
      });
      return;
    }

    setProfiles((prev) => {
      const u = [...prev];
      u[index].uploading = true;
      u[index].error = null;
      u[index].justUploaded = false;
      return u;
    });

    const form = new FormData();
    form.append('name', profile.name.trim());
    form.append('relation', profile.relation.trim());
    form.append('voice', profile.voiceFile);

    try {
      const res = await fetch(`${API_BASE}${API_PATH}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (res.status !== 201) {
        let msg = '';
        try {
          const errJson = await res.clone().json();
          msg = errJson?.message || '';
        } catch {
          msg = await res.text().catch(() => '');
        }
        throw new Error(msg || `업로드 실패 (HTTP ${res.status})`);
      }

      // 성공: UI는 숨김, 버튼 옆 뱃지만 잠깐 표시
      setProfiles((prev) => {
        const u = [...prev];
        u[index].uploading = false;
        u[index].justUploaded = true;
        return u;
      });

      setTimeout(() => {
        setProfiles((prev) => {
          const u = [...prev];
          if (u[index]) u[index].justUploaded = false;
          return u;
        });
      }, 2500);
    } catch (e) {
      console.error(e);
      setProfiles((prev) => {
        const u = [...prev];
        u[index].uploading = false;
        u[index].error = e.message || '업로드 중 오류가 발생했습니다.';
        return u;
      });
    }
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

            {/* 오디오 선택(파일) */}
            <div className="input-group">
              <label>오디오 파일 선택(선택)</label>
              <input
                type="file"
                accept=".mp3,.m4a,.wav,.webm,audio/*"
                onChange={(e) => handleVoiceFileSelect(index, e.target.files?.[0])}
              />
              <small className="hint">허용: mp3, m4a, wav, webm / 최대 50MB</small>
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
                  <audio controls src={profile.audioURL} className="audio-preview" />
                )}
              </div>
            </div>

            {/* 업로드 버튼 & 상태 */}
            <div className="upload-row" style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <button
                type="button"
                className="upload-btn"
                onClick={() => uploadProfile(index)}
                disabled={profile.uploading}
                title="서버로 업로드"
              >
                <UploadCloud size={18} />
                <span>{profile.uploading ? '업로드 중...' : '서버로 업로드'}</span>
              </button>

              {/* ✅ 성공 뱃지(잠깐 표시) */}
              {profile.justUploaded && (
                <span style={{
                  background:'#16a34a',
                  color:'#fff',
                  padding:'6px 10px',
                  borderRadius:8,
                  fontSize:12,
                  fontWeight:700
                }}>
                  업로드 완료
                </span>
              )}

              {/* 에러만 유지 */}
              {profile.error && <p className="error-text" style={{color:'#ff7b7b',margin:0}}>{profile.error}</p>}
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
