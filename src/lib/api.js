// src/lib/api.js

// ✅ 백엔드 주소 - config/api.js에서 가져오기
import API_BASE_URL from "../config/api";

export const BASE_URL = API_BASE_URL;

// ✅ 공통 API 함수 (JSON용)
export async function api(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    ...options,
    credentials: "include", // 쿠키 포함
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  return response.json();
}

