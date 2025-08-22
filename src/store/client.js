// src/store/client.js
const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL)) ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://deepvoice-be.shop";

function readToken() {
  // 로그인 로직에 따라 키가 제각각일 수 있어서 전부 시도
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
}

export function authHeader() {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function http(path, options = {}) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
  const finalOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };
  // Authorization이 없으면 여기서라도 주입
  if (!("Authorization" in finalOptions.headers)) {
    Object.assign(finalOptions.headers, authHeader());
  }

  // 디버그 로그 (필요 없으면 지워도 됨)
  const token = readToken();
  console.log("[HTTP] →", url, finalOptions.method || "GET", {
    hasAuth: !!token,
    authHeader: finalOptions.headers.Authorization ? "set" : "not-set",
  });

  const res = await fetch(url, finalOptions);
  if (!res.ok) {
    let msg = `[${res.status}] ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg += ` - ${text}`;
    } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res;
}
