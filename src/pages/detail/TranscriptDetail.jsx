// src/pages/detail/TranscriptDetail.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { apiGetTranscript } from "../../store/endpoint";
import VoiceAlertCard from "../../components/detail/VoiceAlertCard";
import VoiceAnalysisInfo from "../../components/detail/VoiceInfo";

const splitTranscriptToMessages = (text) =>
  (text || "")
    .split(/[\n\.?!]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => ({ text: t }));

export default function TranscriptDetail() {
  const { id: rawId } = useParams();
  const cleanIdStr = String(rawId).replace(/^:+/, ""); // ✅ 앞쪽 콜론 제거 (":1" -> "1")
  const id = Number(cleanIdStr);
  const location = useLocation();
  const meta = location.state || {};
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    // 1) id 형식 검증
    if (!Number.isInteger(id) || id < 0) {
      setErr(`잘못된 ID 값입니다: ${rawId}`);
      return;
    }

    // 2) API 호출
    (async () => {
      try {
        setErr("");
        const res = await apiGetTranscript(id); // id는 number
        setData(res);
      } catch (e) {
        setErr(e.message || "상세 불러오기 실패");
      }
    })();
  }, [id, rawId]);
  
  if (err) return <div style={{ padding: 16, color: "#f66" }}>{err}</div>;
  if (!data) return <div style={{ padding: 16 }}>로딩 중…</div>;

  const messages = splitTranscriptToMessages(data.transcript);
  const type = { scamType: data.type, features: "텍스트 위험 패턴" };
  const tips = [data.guidance];

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <Link to="/voice-record" style={{ textDecoration: "none", color: "#888" }}>
        ← 목록으로
      </Link>

      <VoiceAlertCard
        score={meta.score}
        detectedAt={meta.detectedAt}
        durationLabel={meta.durationLabel}
      />

      <VoiceAnalysisInfo messages={messages} type={type} tips={tips} />
    </div>
  );
}
