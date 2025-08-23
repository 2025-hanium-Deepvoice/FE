import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import VoiceAlertCard from "../../components/detail/VoiceAlertCard";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";
import VoiceAnalysisInfo from "../../components/detail/VoiceInfo";
import { apiGetTranscript } from "../../store/endpoint";

function splitTranscriptToMessages(text = "") {
  const parts = text
    .split(/(?<=[\.!?…~])\s+|\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return [{ text }];
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
  const [data, setData] = useState(null);

  // ✅ 페이지 내 "캡처 대상" 전용 래퍼
  const captureRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await apiGetTranscript(id);
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

  const meta = location.state || {};
  const record = useMemo(() => ({
    id: Number(id),
    name: meta?.name || "통화 기록",
    date: meta?.detectedAt || "",
    duration: meta?.durationLabel || "",
    emoji: "🙂",
    suspicious: typeof meta?.score === "number" ? meta.score >= 70 : true,
    score: typeof meta?.score === "number" ? meta.score : 0,
  }), [id, meta]);

  const messages = useMemo(() => {
    if (!data?.transcript) return [];
    return splitTranscriptToMessages(data.transcript);
  }, [data]);

  const analysis = useMemo(() => ({
    scamType: data?.type || "-",
    features: "급박한 송금/기관 사칭 등 위험 신호 탐지",
  }), [data]);

  const tips = useMemo(() => (data?.guidance ? [data.guidance] : []), [data]);

  return (
    <div className="container2 VoiceRecord_wrap VoiceInfo_wrap">
      {/* ✅ 이 래퍼(captureRef) 안의 모든 내용이 저장됨 */}
      <div ref={captureRef} className="capture-area">
        <div className="header">
          <button className="back" onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
          <h2>상세 분석</h2>
          <div className="filter" aria-hidden="true" />
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
          <VoiceAnalysisInfo
            captureRef={captureRef}     // 반드시 전달
            messages={messages}
            type={analysis}
            tips={tips}
          />
        )}
      </div>
    </div>
  );
}
