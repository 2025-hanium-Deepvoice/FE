// src/store/endpoint.js
import { http } from "./client";

export function apiGetMe() {
  return http(`/users/me`, { method: "GET" });
}

export function apiGetAnalyses({ skip = 0, take = 20 } = {}) {
  const qs = new URLSearchParams({ skip: String(skip), take: String(take) });
  return http(`/analyses?${qs.toString()}`, { method: "GET" });
}

export async function apiCreateProfile({ name, relation, voice }) {
  const allowed = ["audio/mpeg","audio/mp4","audio/wav","audio/webm","audio/x-wav"];
  if (!voice || !allowed.includes(voice.type)) throw new Error(`허용되지 않은 파일 타입: ${voice?.type || "unknown"}`);
  if (voice.size > 50 * 1024 * 1024) throw new Error(`파일 용량 50MB 초과`);

  const form = new FormData();
  form.append("name", name);
  form.append("relation", relation);
  form.append("voice", voice);

  // Content-Type은 FormData가 자동 설정
  return http(`/profiles`, { method: "POST", body: form });
}
