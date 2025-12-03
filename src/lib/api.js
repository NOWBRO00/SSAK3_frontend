// src/lib/api.js

// ✅ 백엔드 주소 - config/api.js에서 가져오기
import API_BASE_URL from "../config/api";
import { clearAuthData } from "../utils/auth";

export const BASE_URL = API_BASE_URL;

/**
 * 401 Unauthorized 에러 처리 (토큰 만료 또는 서버 재시작)
 * @param {Response} response - fetch 응답 객체
 */
export const handleUnauthorized = (response) => {
  if (response.status === 401) {
    // 인증 데이터 정리
    clearAuthData();
    
    // 현재 경로가 로그인 페이지가 아니면 로그인 페이지로 리다이렉트
    if (window.location.pathname !== "/login" && 
        !window.location.pathname.includes("/auth/kakao/callback")) {
      // React Router를 사용하는 경우 window.location 대신 이벤트 발생
      window.dispatchEvent(new CustomEvent('authExpired'));
      
      // 즉시 리다이렉트 (React Router가 처리할 수 있도록)
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
  }
};

/**
 * 공통 fetch 래퍼 - 401 에러 자동 처리
 * @param {string} url - 전체 URL 또는 경로
 * @param {RequestInit} options - fetch 옵션
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(url, options = {}) {
  // url이 전체 URL인지 경로인지 확인
  const fullUrl = url.startsWith("http") ? url : BASE_URL + url;
  
  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include", // 쿠키 포함
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 401 에러 처리 (토큰 만료 또는 서버 재시작)
  handleUnauthorized(response);

  return response;
}

// ✅ 공통 API 함수 (JSON용)
export async function api(path, options = {}) {
  const response = await fetchWithAuth(path, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API 요청 실패: ${response.statusText}`;
    
    // 에러 메시지 파싱 시도
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 원본 텍스트 사용
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

