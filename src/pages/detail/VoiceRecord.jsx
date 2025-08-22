// src/pages/detail/VoiceRecord.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiGetAnalyses } from "../../store/endpoint";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";

const USE_DUMMY = true; // 👈 개발 중엔 true로 두면 더미 사용

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const fmtDuration = (sec) => {
  if (!Number.isFinite(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
};

export default function VoiceRecordList() {
  const [items, setItems] = useState([]);   // [{ id, record, meta }]
  const [skip, setSkip] = useState(0);
  const take = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async (nextSkip = 0) => {
    if (loading) return;
    try {
      setLoading(true);
      setErr("");

      let data;
      if (USE_DUMMY) {
        // 🔹 명세와 동일한 스키마의 더미
        data = {
          items: [
            {
              id: 1,
              file_name: "엄마의 통화 기록",
              file_path: "uploads/voices/sample_file.m4a",
              duration_seconds: 195,
              is_phishing: true,
              confidence: 88,
              detected_at: "2025-08-23T09:00:00.000Z",
            },
            {
              id: 2,
              file_name: "아빠와의 통화 기록",
              file_path: "uploads/voices/sample2.m4a",
              duration_seconds: 75,
              is_phishing: false,
              confidence: 12,
              detected_at: "2025-08-23T09:00:00.000Z",
            },
            {
              id: 3,
              file_name: "이모와의 통화 기록",
              file_path: "uploads/voices/sample3.m4a",
              duration_seconds: 200,
              is_phishing: false,
              confidence: 20,
              detected_at: "2025-08-23T09:00:00.000Z",
            },
            {
              id: 4,
              file_name: "큰아빠와의 통화 기록",
              file_path: "uploads/voices/sample4.m4a",
              duration_seconds: 330,
              is_phishing: true,
              confidence: 88,
              detected_at: "2025-08-23T09:00:00.000Z",
            },
          ],
          meta: { total: 4, skip: nextSkip, take },
        };
      } else {
        // 🔹 실제 API
        data = await apiGetAnalyses({ skip: nextSkip, take });
      }

      const totalCount = data?.meta?.total ?? 0;
      const mapped = (data?.items || []).map((it) => {
        const id = Number(it.id);
        const durationLabel = fmtDuration(it.duration_seconds);
        const dateLabel = fmtDate(it.detected_at);
        const score = it.confidence;

        return {
          id,
          durationLabel,
          dateLabel,
          score,
          record: {
            emoji: "🙂",
            name: it.file_name,
            suspicious: !!it.is_phishing,
            score,          // 카드에서 %로 렌더
            date: dateLabel,
            duration: durationLabel,
          },
          meta: { score, detectedAt: dateLabel, durationLabel },
        };
      });

      setTotal(totalCount);
      setItems((prev) => (nextSkip === 0 ? mapped : [...prev, ...mapped]));
      setSkip(nextSkip + take);
    } catch (e) {
      setErr(e.message || "목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = items.length < total;

  return (
    <div className="VoiceRecord_wrap container" style={{ padding: 16, display: "grid", gap: 12 }}>
      <div className="header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ margin: 0 }}>음성기록</h2>
      </div>

      {err && (
        <div style={{ color: "#f66", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{err}</span>
          <button className="login-btn active" onClick={() => load(0)}>다시 시도</button>
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div style={{ color: "#aaa", padding: "12px 0" }}>아직 분석된 음성 기록이 없어요.</div>
      )}

      <div className="record-list" style={{ display: "grid", gap: 8 }}>
  {items.map(({ id, record, meta }) => (
    <Link
      key={id}
      to={`/voice-record/${id}`}
      state={{
        voice_id: id,                 // 상세에서 transcript id로 사용
        id,
        name: record.name,            // 카드 제목
        durationLabel: meta.durationLabel,
        detectedAt: meta.detectedAt,
        score: meta.score,
      }}
      style={{ textDecoration: "none" }}
    >
      <VoiceRecordCard record={record} />
    </Link>
  ))}
</div>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <button className="login-btn inactive" disabled>불러오는 중...</button>
        ) : hasMore ? (
          <button className="login-btn active" onClick={() => load(skip)}>더 보기</button>
        ) : items.length > 0 ? (
          <span style={{ color: "#888" }}>모든 기록을 다 불러왔어요.</span>
        ) : null}
      </div>
    </div>
  );
}
