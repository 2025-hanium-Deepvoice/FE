// src/pages/detail/VoiceRecordDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import VoiceAlertCard from "../../components/detail/VoiceAlertCard";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";
import VoiceAnalysisInfo from "../../components/detail/VoiceInfo";
import { apiGetTranscript } from "../../store/endpoint";

function splitTranscriptToMessages(text = "") {
  // 문장 구분(., ?, !, ~, …, newline) 기준으로 간단 분할
  const parts = text
    .split(/(?<=[\.!?…~])\s+|\n+/g)
    .map(s => s.trim())
    .filter(Boolean);

  // 너무 짧으면 한 덩어리로
  if (parts.length <= 1) return [{ text }];

  // 길면 1~2문장씩 묶어서 말풍선 만들기
  const out = [];
  for (let i = 0; i < parts.length; i += 2) {
    const chunk = [parts[i], parts[i + 1]].filter(Boolean).join(" ");
    out.push({ text: chunk });
  }
  return out;
}

export default function VoiceRecordDetail({ useAlertCard = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null); // { id, transcript, type, guidance, voice_id }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await apiGetTranscript(id); // ✅ /transcripts/:id 호출
        if (!alive) return;
        setData(res);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "상세 불러오기 실패");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // 리스트에서 넘겨준 메타 (없으면 기본값)
  const meta = location.state || {};
  const record = useMemo(() => {
    // VoiceRecordCard가 기대하는 구조
    return {
      id: Number(id),
      name: meta?.name || "통화 기록",
      date: meta?.detectedAt || "",
      duration: meta?.durationLabel || "",
      emoji: "🙂",
      suspicious: typeof meta?.score === "number" ? meta.score >= 70 : true,
      score: typeof meta?.score === "number" ? meta.score : 0,
    };
  }, [id, meta]);

  // API → VoiceAnalysisInfo props 매핑
  const chatMessages = useMemo(() => {
    if (!data?.transcript) return [];
    return splitTranscriptToMessages(data.transcript);
  }, [data]);

  const analysis = useMemo(() => {
    if (!data) return { scamType: "-", features: "-" };
    return {
      scamType: data.type || "-",
      // 백엔드가 'features'를 따로 주지 않으니 간단 요약 문구
      features: "급박한 송금/기관 사칭 등 위험 신호 탐지",
    };
  }, [data]);

  const tips = useMemo(() => {
    if (!data?.guidance) return [];
    return [data.guidance];
  }, [data]);

  return (
    <div className="VoiceInfo_wrap VoiceRecord_wrap container" style={{ padding: 16 }}>
      <div className="header">
        <button className="back" onClick={() => navigate(-1)}>←</button>
        <h2 style={{ margin: 0 }}>상세 분석</h2>
        <div className="filter" />
      </div>

      {/* 상단 카드 */}
      <div className="record-list" style={{ marginBottom: 12 }}>
        {useAlertCard ? <VoiceAlertCard /> : <VoiceRecordCard record={record} />}
      </div>

      {/* 본문 */}
      {loading ? (
        <div style={{ color: "#aaa" }}>불러오는 중...</div>
      ) : err ? (
        <div style={{ color: "#f66" }}>{err}</div>
      ) : (
        <VoiceAnalysisInfo messages={chatMessages} type={analysis} tips={tips} />
      )}
    </div>
  );
}
