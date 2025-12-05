// src/state/UnreadContext.js

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { BASE_URL, fetchWithAuth } from "../lib/api";
import { getUserId } from "../utils/auth";

const UnreadContext = createContext(null);
const API_BASE = BASE_URL;

export function UnreadProvider({ children }) {
  const [unreadTotal, setUnreadTotal] = useState(0);

  // ✅ 전역 채팅 목록 갱신 함수 (unreadTotal 업데이트)
  const refreshUnreadCount = useCallback(async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        // 로그인하지 않았으면 unreadTotal을 0으로 설정
        setUnreadTotal(0);
        return;
      }

      const url = `${API_BASE}/api/chatrooms/user/${userId}`;
      
      const res = await fetchWithAuth(url, {
        method: "GET",
      });

      if (!res.ok) {
        // 에러 발생 시 기존 값 유지
        return;
      }

      // 안전하게 JSON 파싱
      const responseText = await res.text();
      let rawList = [];
      
      try {
        rawList = JSON.parse(responseText);
      } catch (parseError) {
        // JSON 파싱 실패 시 빈 배열로 처리
        rawList = [];
      }

      // unreadCount 합계 계산
      const total = Array.isArray(rawList) 
        ? rawList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
        : 0;

      setUnreadTotal(total);
      
      if (process.env.NODE_ENV === "development") {
        console.log("[UnreadContext] 미읽음 메시지 수 업데이트:", total);
      }
    } catch (e) {
      // 에러 발생 시 기존 값 유지
      if (process.env.NODE_ENV === "development") {
        console.error("[UnreadContext] 미읽음 메시지 수 갱신 실패:", e);
      }
    }
  }, []);

  // ✅ 전역 폴링: 로그인 상태에서 주기적으로 unreadTotal 갱신
  useEffect(() => {
    // 초기 로드
    refreshUnreadCount();

    // 5초마다 갱신 (ChatListPage와 동일한 주기)
    const pollingInterval = setInterval(() => {
      refreshUnreadCount();
    }, 5000);

    // 채팅방 생성/삭제/읽음 이벤트 리스너
    const handleChatroomCreated = () => {
      // 약간의 지연을 주어 백엔드에 반영될 시간 확보
      setTimeout(() => {
        refreshUnreadCount();
      }, 500);
    };

    const handleChatroomDeleted = () => {
      refreshUnreadCount();
    };

    const handleChatroomRead = () => {
      // 약간의 지연을 주어 백엔드에 반영될 시간 확보
      setTimeout(() => {
        refreshUnreadCount();
      }, 300);
    };

    window.addEventListener('chatroomCreated', handleChatroomCreated);
    window.addEventListener('chatroomDeleted', handleChatroomDeleted);
    window.addEventListener('chatroomRead', handleChatroomRead);

    return () => {
      clearInterval(pollingInterval);
      window.removeEventListener('chatroomCreated', handleChatroomCreated);
      window.removeEventListener('chatroomDeleted', handleChatroomDeleted);
      window.removeEventListener('chatroomRead', handleChatroomRead);
    };
  }, [refreshUnreadCount]);

  // ✅ 페이지 포커스 시 갱신 (사용자가 다른 탭에서 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      refreshUnreadCount();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUnreadCount]);

  const value = useMemo(
    () => ({ unreadTotal, setUnreadTotal }),
    [unreadTotal]
  );

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used within UnreadProvider");
  return ctx;
}
