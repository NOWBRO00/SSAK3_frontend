// 공통 API 유틸리티 함수
import API_BASE_URL from "../config/api";

/**
 * 인증 토큰을 포함한 fetch 요청
 * @param {string} path - API 경로 (예: "/api/products")
 * @param {RequestInit} options - fetch 옵션
 * @param {boolean} requireAuth - 인증이 필요한 요청인지 (기본값: true)
 * @returns {Promise<Response>}
 */
export async function apiRequest(path, options = {}, requireAuth = true) {
  const url = `${API_BASE_URL}${path}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 인증 토큰 추가
  if (requireAuth) {
    const token = localStorage.getItem("ssak3.accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * FormData를 사용하는 API 요청 (파일 업로드 등)
 * @param {string} path - API 경로
 * @param {FormData} formData - FormData 객체
 * @param {boolean} requireAuth - 인증이 필요한 요청인지 (기본값: true)
 * @returns {Promise<Response>}
 */
export async function apiRequestFormData(path, formData, requireAuth = true) {
  const url = `${API_BASE_URL}${path}`;
  
  const headers = {};
  
  // 인증 토큰 추가 (Content-Type은 FormData가 자동 설정)
  if (requireAuth) {
    const token = localStorage.getItem("ssak3.accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  return response;
}

/**
 * API_BASE_URL을 직접 반환 (필요한 경우)
 */
export { API_BASE_URL };



