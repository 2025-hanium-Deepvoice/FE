import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSelectCard from "../../components/select/select";

export default function ProfileSelect() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  const profiles = [
    { id: "dad",   relation: "아빠", name: "홍길동", emoji: "🧔🏻‍♂️" },
    { id: "mom1",  relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom2",  relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom3",  relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
    { id: "mom4",  relation: "엄마", name: "홍길동", emoji: "🧕🏻" },
  ];

  const handleSelect = (profile) => {
    setActiveId(profile.id);
    navigate(`/voice/check?profileId=${encodeURIComponent(profile.id)}`);
  };

  return (
    <div className="ProfileSelect_wrap container">
      <div className="header">
        <button className="back" onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
      </div>

      <h1 className="title">
        어떤 프로필로 딥보이스를 검토해드릴까요?
      </h1>

      <div className="card-list">
        {profiles.map((p) => (
          <ProfileSelectCard
            key={p.id}
            profile={p}
            onSelect={handleSelect}
            isActive={activeId === p.id}
          />
        ))}
      </div>
    </div>
  );
}
