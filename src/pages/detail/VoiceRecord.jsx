// src/pages/detail/VoiceRecord.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetAnalyses } from "../../store/endpoint";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";

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
  const [items, setItems] = useState([]); // [{ id, record, meta }]
  const [skip, setSkip] = useState(0);
  const take = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (nextSkip = 0) => {
    try {
      setLoading(true);
      setErr("");
      const data = await apiGetAnalyses({ skip: nextSkip, take });
      const totalCount = data?.meta?.total ?? 0;

      const mapped = (data?.items || []).map((it) => {
        const id = Number(it.id); // ✅ 숫자화
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
            score,
            date: dateLabel,
            duration: durationLabel,
          },
          meta: {
            score,
            detectedAt: dateLabel,
            durationLabel,
          },
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
  };

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

      {err && <div style={{ color: "#f66" }}>{err}</div>}

      <div className="record-list" style={{ display: "grid", gap: 8 }}>
        {items.map(({ id, record, meta }) => (
          <Link
            key={id}
            to={`/voice-record/${id}`}
            state={meta}
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
        ) : (
          <span style={{ color: "#888" }}>모든 기록을 다 불러왔어요.</span>
        )}
      </div>
    </div>
  );
}
