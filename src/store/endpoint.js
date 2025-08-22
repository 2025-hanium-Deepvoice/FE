// src/store/endpoint.js
import { http, authHeader } from "./client";

/**
 * 간단한 쿼리스트링 헬퍼
 * 예: qs({ skip: 0, take: 10 }) -> "?skip=0&take=10"
 */
const qs = (params = {}) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    s.set(k, String(v));
  });
  const q = s.toString();
  return q ? `?${q}` : "";
};

/**
 * 내 정보 조회
 * GET /users/me
 */
export function apiGetMe() {
  return http(`/users/me`, { method: "GET" });
}

/**
 * 음성기록 목록 조회
 * GET /analyses?skip&take
 *
 * Response:
 * {
 *   items: [{ id, file_name, file_path, duration_seconds, is_phishing, confidence, detected_at }],
 *   meta: { total, skip, take }
 * }
 */
export function apiGetAnalyses({ skip = 0, take = 10 } = {}) {
  return http(`/analyses${qs({ skip, take })}`, { method: "GET" });
}
/**
 * 음성기록 상세(Transcript) 조회
 * GET /transcripts/:id
 *
 * Response (예시):
 * { transcript, type, guidance, ... }
 */
export function apiGetTranscript(id) {
  if (!id && id !== 0) throw new Error("transcript id가 필요합니다.");
  return http(`/transcripts/${id}`, { method: "GET" });
}

/**
 * 화자 프로필 생성
 * POST /profiles
 * multipart/form-data (FormData 자동 Content-Type)
 */
export async function apiCreateProfile({ name, relation, voice }, { signal }) {
  const ALLOWED_MIME = new Set([
    "audio/mpeg",   // mp3
    "audio/mp4",    // m4a
    "audio/wav",
    "audio/webm",
    "audio/x-wav",
  ]);
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (!voice || !ALLOWED_MIME.has(voice.type)) {
    throw new Error(`허용되지 않은 파일 타입: ${voice?.type || "unknown"}`);
  }
  if (voice.size > MAX_SIZE) {
    throw new Error(`파일 용량 50MB 초과`);
  }

  const form = new FormData();
  form.append("name", name);
  form.append("relation", relation);
  form.append("voice", voice);

  return http(`/profiles`, {
    method: "POST",
    body: form,
    headers: { ...authHeader() }, // 토큰만 추가
  });
   return http(`/profiles`, { method: "POST", body: form, signal });
}
