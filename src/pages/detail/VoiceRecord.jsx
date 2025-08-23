// src/pages/detail/VoiceRecord.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiGetAnalyses } from "../../store/endpoint";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";

import {
  USE_DUMMY_ANALYSES,
  makeDummyAnalysesResponse,
  mapAnalysesToView,
} from "../../store/analyses.mock";

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
      if (USE_DUMMY_ANALYSES) {
        data = makeDummyAnalysesResponse(nextSkip, take);
      } else {
         data = await apiGetAnalyses({ skip: nextSkip, take });
       }

      const totalCount = data?.meta?.total ?? 0;
      const mapped = mapAnalysesToView(data);
      
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
