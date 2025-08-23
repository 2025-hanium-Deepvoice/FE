// pages/select/ProfileSelect.jsx
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/sass/select/_select.scss";

export default function ProfileSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const returnTo = location.state?.returnTo || "/home";
  const [activeId, setActiveId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const profiles = [
    { id: "dad",  relation: "아빠", name: "홍길동", emoji: "🧔🏻‍♂️" },
    { id: "mom1", relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom2", relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom3", relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom4", relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
  ];

  const handleSelect = (p) => {
    setActiveId(p.id);
    setSheetOpen(true);
    setTimeout(() => fileInputRef.current?.click(), 120);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setSheetOpen(false);
    if (!file || !activeId) return;
    navigate(returnTo, { state: { file, profileId: activeId } });
  };

   return (
    <div className="container2 ProfileSelect_wrap"> {/* ✅ container2 추가 */}
      <div className="header">
        <button className="back" onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
      </div>

      <h1 className="title">어떤 프로필로 딥보이스를 검토해드릴까요?</h1>

      <div className="card-list">
        {profiles.map((p) => (
          <button
            key={p.id}
            className={`profile-card ${activeId === p.id ? "is-active" : ""}`}
            onClick={() => handleSelect(p)}
          >
            <div className="left">
              <div className="avatar"><span className="emoji">{p.emoji}</span></div>
              <div className="meta">
                <span className="relation">{p.relation}</span>
                <span className="bar">|</span>
                <span className="name">{p.name}</span>
              </div>
            </div>
            <span className="chevron">›</span>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {sheetOpen && (
        <div className="ps-sheet" aria-hidden>
          <div className="ps-sheet__backdrop" />
          <div className="ps-sheet__panel">
            <div className="ps-sheet__pill" />
            <p>파일 선택 중…</p>
            <div className="ps-sheet__hint">오디오 파일을 선택하세요</div>
          </div>
        </div>
      )}
    </div>
  );
}