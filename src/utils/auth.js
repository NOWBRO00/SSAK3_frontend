// src/utils/auth.js
// 공통 인증 유틸리티 함수

/**
 * localStorage에서 사용자 ID 가져오기 (검증 포함)
 * @returns {number|null} 사용자 ID (DB PK) 또는 null
 * @description 백엔드 API 호출 시 사용할 DB PK를 반환합니다.
 */
export const getUserId = () => {
  try {
    // 토큰 확인
    const token = localStorage.getItem("ssak3.accessToken");
    if (!token) {
      return null;
    }
    
    const profileStr = localStorage.getItem("ssak3.profile");
    if (!profileStr) {
      return null;
    }
    
    const profile = JSON.parse(profileStr);
    if (!profile || !profile.id) {
      return null;
    }
    
    // profile.id는 DB PK (User.id)여야 함
    // 이전에 카카오 ID를 저장했다면 마이그레이션 필요
    return profile.id;
  } catch (e) {
    // 프로필 파싱 실패 시 localStorage 정리
    clearAuthData();
    return null;
  }
};

/**
 * localStorage에서 카카오 ID 가져오기
 * @returns {number|null} 카카오 ID 또는 null
 */
export const getKakaoId = () => {
  try {
    const profileStr = localStorage.getItem("ssak3.profile");
    if (!profileStr) {
      return null;
    }
    
    const profile = JSON.parse(profileStr);
    return profile.kakaoId || profile.id; // kakaoId가 없으면 id 사용 (하위 호환)
  } catch (e) {
    return null;
  }
};

/**
 * localStorage에서 사용자 프로필 가져오기 (검증 포함)
 * @returns {object|null} 사용자 프로필 또는 null
 */
export const getUserProfile = () => {
  try {
    const token = localStorage.getItem("ssak3.accessToken");
    if (!token) {
      return null;
    }
    
    const profileStr = localStorage.getItem("ssak3.profile");
    if (!profileStr) {
      return null;
    }
    
    const profile = JSON.parse(profileStr);
    if (!profile || !profile.id) {
      return null;
    }
    
    return profile;
  } catch (e) {
    clearAuthData();
    return null;
  }
};

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
export const isLoggedIn = () => {
  return getUserId() !== null;
};

/**
 * localStorage의 인증 데이터 정리
 */
export const clearAuthData = () => {
  localStorage.removeItem("ssak3.accessToken");
  localStorage.removeItem("ssak3.profile");
  localStorage.removeItem("ssak3.refreshToken");
};

