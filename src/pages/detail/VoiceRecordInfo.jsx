// src/pages/detail/VoiceRecordDetail.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import VoiceAlertCard from "../../components/detail/VoiceAlertCard";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";
import VoiceAnalysisInfo from "../../components/detail/VoiceInfo";
import { apiGetTranscript } from "../../store/endpoint";
import { FiChevronLeft, FiMoreHorizontal } from "react-icons/fi";
import "../../assets/sass/detail/_VoiceInfo.scss";

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

  // 페이지 전체 캡처용 래퍼
  const captureRef = useRef(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await apiGetTranscript(id);
      setData(res);
    } catch (e) {
      setErr(e?.message || "상세 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetcher(); }, [fetcher]);

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
    features: data?.features || "급박한 송금/기관 사칭 등 위험 신호 탐지",
  }), [data]);

  const tips = useMemo(() => (
    data?.guidance ? [data.guidance] : ["경찰 또는 기관에 직접 확인하세요.", "돈을 요구하는 전화는 100% 보이스피싱입니다"]
  ), [data]);

  return (
    <div className="container2 VoiceInfo_wrap">
      {/* 상단 바 */}
      <div className="topbar">
        <button className="icon-btn" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h2>상세 분석보기</h2>
        <button className="icon-btn" aria-label="메뉴">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* 상단 카드: 의심 있으면 빨간 카드, 없으면 일반 카드 */}
      <div className="detail-head">
        {record.suspicious ? (
          <VoiceAlertCard
            name={record.name}
            date={record.date}
            duration={record.duration}
            score={record.score}
          />
        ) : (
          <VoiceRecordCard record={record} />
        )}
      </div>

      {/* 본문 */}
      <div ref={captureRef} className="capture-area">
        {loading ? (
          <div className="inline-info">불러오는 중...</div>
        ) : err ? (
          <div className="inline-error">{err}</div>
        ) : (
          <VoiceAnalysisInfo
            captureRef={captureRef}
            messages={messages}
            type={analysis}
            tips={tips}
          />
        )}
      </div>
    </div>
  );
}
