// src/store/client.js
const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env &&
    (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL)) ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://deepvoice-be.shop";

// "Bearer xxx" 혹은 공백/따옴표가 섞인 값을 순수 토큰으로 정규화
function normalizeToken(raw) {
  if (!raw) return "";
  let t = String(raw).trim();
  if (t.startsWith("Bearer ")) t = t.slice(7).trim();
  // 따옴표로 감싼 문자열 제거
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  return t;
}

function readToken() {
  const raw =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("access_token") ||
    "";
  return normalizeToken(raw);
}

export function authHeader() {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const isJsonBody = (v) =>
  v &&
  typeof v === "object" &&
  !(v instanceof FormData) &&
  !(v instanceof Blob) &&
  !(v instanceof ArrayBuffer);

export async function http(path, options = {}) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
  const { method = "GET", body, headers = {}, auth = true, signal } = options;

  const hdrs = new Headers(headers);
  if (!hdrs.has("Accept")) hdrs.set("Accept", "application/json");
  if (auth && !hdrs.has("Authorization")) {
    const token = readToken();
    if (token) hdrs.set("Authorization", `Bearer ${token}`);
  }

  let finalBody = body;
  if (isJsonBody(body)) {
    if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers: hdrs, body: finalBody, signal });

  const ct = res.headers.get("content-type") || "";
  const parse = async () =>
    ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    let data = null;
    try { data = await parse(); } catch {}
    const err = new Error(
      (data && (data.message || data.error)) || res.statusText || "Request failed"
    );
    err.status = res.status;
    err.data = data;

    // 🔴 401이면 토큰 정리 + 로그인으로 이동(전역 처리)
    if (res.status === 401) {
      ["access_token", "token", "jwt"].forEach((k) => localStorage.removeItem(k));
      try {
        const from = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?from=${from}`);
      } catch {
        window.location.assign(`/login`);
      }
    }
    throw err;
  }

  if (res.status === 204) return null;
  return ct.includes("application/json") ? await res.json() : res;
}
