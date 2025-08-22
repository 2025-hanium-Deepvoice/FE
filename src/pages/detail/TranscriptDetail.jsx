// src/pages/detail/TranscriptDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
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
    out.push({ text: [parts[i], parts[i + 1]].filter(Boolean).join(" ") });
  }
  return out;
}

export default function TranscriptDetail({ useAlertCard = false }) {
  const navigate = useNavigate();
  const { id: idFromParams } = useParams();
  const location = useLocation();

  // ✅ 여러 경로에서 transcript id 확보: /voice-record/:id, /voice-info?id=1, Link state
  const search = new URLSearchParams(location.search);
  const idFromQuery = search.get("id");
  const idFromState = location.state?.voice_id || location.state?.id;
  const transcriptId = idFromParams || idFromQuery || idFromState;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null); // { id, transcript, type, guidance, voice_id }

  useEffect(() => {
    // ❗ id 없으면 호출하지 않음
    if (!transcriptId) {
      setErr("transcript id가 필요합니다.");
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await apiGetTranscript(transcriptId); // GET /transcripts/:id
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
    return () => {
      alive = false;
    };
  }, [transcriptId]);

  // 리스트에서 넘겨준 메타(없으면 기본값)
  const meta = location.state || {};
  const record = useMemo(
    () => ({
      id: Number(transcriptId) || 0,
      name: meta?.name || "통화 기록",
      date: meta?.detectedAt || "",
      duration: meta?.durationLabel || "",
      emoji: "🙂",
      suspicious:
        typeof meta?.score === "number" ? meta.score >= 70 : !!data?.type,
      score: typeof meta?.score === "number" ? meta.score : 0,
    }),
    [transcriptId, meta, data]
  );

  // API → VoiceAnalysisInfo props 매핑
  const chatMessages = useMemo(
    () => (data?.transcript ? splitTranscriptToMessages(data.transcript) : []),
    [data]
  );

  const analysis = useMemo(
    () =>
      data
        ? {
            scamType: data.type || "-",
            features: "급박한 송금/기관 사칭 등 위험 신호 탐지",
          }
        : { scamType: "-", features: "-" },
    [data]
  );

  const tips = useMemo(() => (data?.guidance ? [data.guidance] : []), [data]);

  return (
    <div className="VoiceInfo_wrap VoiceRecord_wrap container" style={{ padding: 16 }}>
      <div className="header">
        <button className="back" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 style={{ margin: 0 }}>상세 분석</h2>
        <div className="filter" />
      </div>

      {/* 상단 카드 */}
      <div className="record-list" style={{ marginBottom: 12 }}>
        {useAlertCard ? <VoiceAlertCard /> : <VoiceRecordCard record={record} />}
      </div>

      {/* 본문 */}
      {!transcriptId ? (
        <div style={{ color: "#f66", textAlign: "center" }}>
          transcript id가 필요합니다.
        </div>
      ) : loading ? (
        <div style={{ color: "#aaa" }}>불러오는 중...</div>
      ) : err ? (
        <div style={{ color: "#f66" }}>{err}</div>
      ) : (
        <VoiceAnalysisInfo messages={chatMessages} type={analysis} tips={tips} />
      )}
    </div>
  );
}
