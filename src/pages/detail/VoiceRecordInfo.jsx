import React from "react";
import { useNavigate } from "react-router-dom";
import VoiceAlertCard from "../../components/detail/VoiceAlertCard";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";
import VoiceAnalysisInfo from "../../components/detail/VoiceInfo";

export default function VoiceRecordDetail({ useAlertCard = false }) {
  const navigate = useNavigate();

  const record = {
    id: 1,
    name: "엄마와의 통화 기록",
    date: "2025.08.23",
    duration: "3:15",
    emoji: "🧑‍🦲",
    suspicious: true,
    score: 88,
  };

  const chatMessages = [
    {
      text: "엄마, 지금 당장 송금해줘야해. 지금 100...",
      sub: "편의점 들어가서 구글 기프트 카드 100만원 어치를 ...",
    },
    {
      text: "여보세요, 여기 경찰서인데요. 저는 형사...",
    },
  ];

  const analysis = {
    scamType: "가족 사칭",
    features: "송금 유도, 급박함 강조",
  };

  const tips = [
    "경찰 또는 기관에 직접 확인하세요",
    "돈을 요구하는 전화는 100% 보이스 피싱입니다",
  ];

  return (
    <div className="VoiceInfo_wrap VoiceRecord_wrap container">
      <div className="header">
        <button className="back" onClick={() => navigate(-1)}>←</button>
      </div>

      <div className="record-list">
        {useAlertCard ? (
          <VoiceAlertCard />
        ) : (
          <VoiceRecordCard record={record} />
        )}
      </div>

      <VoiceAnalysisInfo
        messages={chatMessages}
        type={analysis}
        tips={tips}
      />
    </div>
  );
}
