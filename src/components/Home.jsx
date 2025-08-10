import React, { useRef, useState } from "react";
import { Play, ChevronRight, Mic, X } from "lucide-react";
import "../assets/sass/setting/_home.scss";

const Home = ({
  userName = "000",
  heroLogoSrc = "",
  records = [
    { id: 1, name: "엄마의 통화 기록", date: "2025.08.23", duration: "3:15", avatar: "", phishingRisk: 88 },
    { id: 2, name: "아빠의 통화 기록", date: "2025.08.23", duration: "1:15", avatar: "" },
    { id: 3, name: "이모의 통화 기록", date: "2025.08.23", duration: "3:20", avatar: "" },
  ],
  /**
   * onUpload(file, { signal })가 Promise를 리턴한다고 가정.
   * 서버 업로드 로직을 여기로 넘겨주면 모달은 자동으로 관리됨.
   */
  onUpload,
}) => {
  const fileRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef(null); // 업로드 취소용

  const handlePick = () => fileRef.current?.click();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능
    if (!file) return;

    // 업로드 시작
    setIsUploading(true);

    // 취소 지원(선택): fetch 업로드 등에 넘길 AbortSignal
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (onUpload) {
        await onUpload(file, { signal: controller.signal });
      } else {
        // 데모용: 2초 대기 후 완료
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        alert("업로드에 실패했습니다.");
      }
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
    setIsUploading(false);
  };

  return (
    <div className="container2 home">
      {/* 인사 */}
      <header className="home__greeting">
        <div className="home__avatar"><span role="img" aria-label="avatar">🧑‍💻</span></div>
        <p className="home__hello"><strong>{userName}</strong>님 안녕하세요!</p>
      </header>

      {/* 히어로(로고 자리) */}
      <section className="home__hero">
        {heroLogoSrc ? (
          <img className="home__hero-logo" src={heroLogoSrc} alt="logo" />
        ) : (
          <div className="home__hero-blank" aria-hidden="true" />
        )}

        {/* 업로드 카드: 아이콘+텍스트 위 / 버튼 아래 */}
        <div className="home__upload-card">
          <div className="card__left">
            <div className="card__icon"><Mic size={22} /></div>
            <div className="card__texts">
              <h4>보이스피싱 감지</h4>
              <p>보이스피싱이 의심되는 음성을 업로드해주세요</p>
            </div>
          </div>

          <button className="card__btn" onClick={handlePick}>업로드</button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            className="none"
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 리스트 헤더 */}
      <div className="home__list-head">
        <h3>음성기록</h3>
        <button className="see-all">전체 보기 <ChevronRight size={16} /></button>
      </div>

      {/* 기록 리스트 */}
      <ul className="home__list">
        {records.map((r) => {
          const risky = Number.isFinite(r.phishingRisk);
          return (
            <li key={r.id} className={`record ${risky ? "record--danger" : ""}`}>
              <div className="record__avatar">
                {r.avatar ? (
                  <img src={r.avatar} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <span className="record__emoji" role="img" aria-label="avatar">🙂</span>
                )}
              </div>

              <div className="record__texts">
                <div className="record__title">
                  {r.name}
                  {risky && <span className="badge">△ 보이스피싱 의심 {r.phishingRisk}%</span>}
                </div>
                <div className="record__date">{r.date}</div>
              </div>

              <div className="record__right">
                <span className="record__duration">{r.duration}</span>
                <button className="record__play" aria-label="재생"><Play size={18} /></button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 업로드 중 모달 */}
      {isUploading && (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-label="업로드 진행 중">
          <div className="modal__backdrop" />
          <div className="modal__card">
            <button className="modal__close" onClick={cancelUpload} aria-label="닫기">
              <X size={18} />
            </button>

            <div className="modal__wave" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>

            <h4 className="modal__title">파일 업로드 중…</h4>
            <p className="modal__desc">업로드 중입니다. 잠시 기다려주세요…</p>

            <button className="modal__action" onClick={cancelUpload}>업로드 취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
