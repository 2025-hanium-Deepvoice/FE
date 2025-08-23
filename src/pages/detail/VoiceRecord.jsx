// src/pages/detail/VoiceRecord.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGetAnalyses } from "../../store/endpoint";
import VoiceRecordCard from "../../components/detail/VoiceRecordCard";
import { FiChevronLeft, FiMoreHorizontal, FiSearch } from "react-icons/fi";

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
  const [q, setQ] = useState("");
  const nav = useNavigate();

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

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);

  const hasMore = items.length < total;

  // 검색 필터링 (이름/날짜/경고문)
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter(({ record }) => {
      const hay = `${record.name} ${record.date} ${record.suspicious ? "보이스피싱 의심" : ""}`.toLowerCase();
      return hay.includes(keyword);
    });
  }, [items, q]);

  return (
    <div className="container2 VoiceRecord_wrap">
      {/* 상단 바 */}
      <div className="topbar">
        <button
          className="icon-btn"
          aria-label="뒤로가기"
          onClick={() => nav(-1)}
        >
          <FiChevronLeft />
        </button>
        <h2>음성기록</h2>
        <button className="icon-btn" aria-label="메뉴">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* 검색 바 */}
      <div className="searchbar">
        <FiSearch className="search-icon" aria-hidden />
        <input
          placeholder="Search...."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="검색어 입력"
        />
      </div>

      {/* 오류/빈 상태 */}
      {err && (
        <div className="inline-error">
          <span>{err}</span>
          <button className="login-btn active" onClick={() => load(0)}>다시 시도</button>
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="empty">아직 분석된 음성 기록이 없어요.</div>
      )}

      {/* 리스트 */}
      <div className="record-list">
        {filtered.map(({ id, record, meta }) => (
          <Link
            key={id}
            to={`/voice-record/${id}`}
            state={{
              voice_id: id,
              id,
              name: record.name,
              durationLabel: meta.durationLabel,
              detectedAt: meta.detectedAt,
              score: meta.score,
            }}
          >
            <VoiceRecordCard record={record} />
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pager">
        {loading ? (
          <button className="login-btn inactive" disabled>불러오는 중...</button>
        ) : hasMore ? (
          <button className="login-btn active" onClick={() => load(skip)}>더 보기</button>
        ) : filtered.length > 0 ? (
          <span className="all-loaded">모든 기록을 다 불러왔어요.</span>
        ) : null}
      </div>
    </div>
  );
}
