// src/utils/auth.js
// 공통 인증 유틸리티 함수

/**
 * localStorage에서 사용자 ID 가져오기 (검증 포함)
 * @returns {number|null} 사용자 ID 또는 null
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
    
    return profile.id;
  } catch (e) {
    // 프로필 파싱 실패 시 localStorage 정리
    clearAuthData();
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

