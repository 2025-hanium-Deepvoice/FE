// src/store/analyses.mock.js

// ✅ 한 곳에서 on/off
export const USE_DUMMY_ANALYSES = true;

// ✅ 더미 데이터(명세 스키마 그대로)
export const DUMMY_ANALYSES_ITEMS = [
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
];

// ✅ 공용 포맷터
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

// ✅ 더미 응답(페이지네이션 호환)
export const makeDummyAnalysesResponse = (skip = 0, take = 10) => {
  const items = DUMMY_ANALYSES_ITEMS.slice(skip, skip + take);
  return {
    items,
    meta: { total: DUMMY_ANALYSES_ITEMS.length, skip, take },
  };
};

// ✅ 카드/리스트용 공용 매퍼
export const mapAnalysesToView = (data) => {
  return (data?.items || []).map((it) => {
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
        score, // %로 렌더
        date: dateLabel,
        duration: durationLabel,
      },
      meta: { score, detectedAt: dateLabel, durationLabel },
    };
  });
};
