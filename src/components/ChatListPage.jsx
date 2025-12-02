// src/components/ChatListPage.jsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatListPage.css";

// 전역 미읽음 컨텍스트
import { useUnread } from "../state/UnreadContext";
import BottomNav from "./BottomNav";

// 🔹 공통 API BASE
import { BASE_URL } from "../lib/api";
// ✅ 공통 인증 유틸리티 사용
import { getUserId } from "../utils/auth";

const API_BASE = BASE_URL;

// 🔹 fallback용 임시 채팅
function formatKoreanDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChatListPage() {
  const nav = useNavigate();
  const { setUnreadTotal } = useUnread();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 채팅 목록 로드 (백엔드 + mock fallback)
  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ 실제로는 "사용자별 채팅방 목록" API에 맞춰서 URL만 바꾸면 됨
      // 예: GET /api/chatrooms/user/{userId}
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      const res = await fetch(`${API_BASE}/api/chatrooms/user/${userId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("채팅 목록 조회 실패");

      const rawList = await res.json();
      const currentUserId = getUserId(); // 상위 스코프의 userId와 구분

      // 백엔드 응답 구조:
      // [
      //   {
      //     "id": 1,
      //     "buyerId": 1,
      //     "sellerId": 2,
      //     "buyer": { id, kakaoId, nickname, ... },
      //     "seller": { id, kakaoId, nickname, ... },
      //     "lastMessage": { id, content, senderId, createdAt, ... },
      //     "unreadCount": null,
      //     ...
      //   }
      // ]
      const mapped = rawList.map((raw) => {
        // 현재 사용자가 buyer인지 seller인지 확인
        const isBuyer = currentUserId && (
          String(raw.buyerId) === String(currentUserId) ||
          String(raw.buyer?.kakaoId) === String(currentUserId)
        );
        
        // 상대방 정보 (현재 사용자가 buyer면 seller, seller면 buyer)
        const peer = isBuyer ? raw.seller : raw.buyer;
        const peerNickname = peer?.nickname || (isBuyer ? "판매자" : "구매자");
        
        // lastMessage가 객체인 경우 content 추출
        const lastMessage = typeof raw.lastMessage === 'object' && raw.lastMessage !== null
          ? (raw.lastMessage.content || raw.lastMessage.text || raw.lastMessage.message || "")
          : (raw.lastMessage || raw.lastMessageContent || "");
        
        // lastMessageAt 추출 (lastMessage 객체에서 또는 직접)
        const lastMessageAt = typeof raw.lastMessage === 'object' && raw.lastMessage !== null
          ? (raw.lastMessage.createdAt || raw.lastMessage.sentAt)
          : (raw.lastMessageAt || raw.updatedAt || raw.createdAt);
        
        return {
          id: raw.id ?? raw.roomId, // 라우터에서 /chat/:roomId 로 사용
          peer: {
            nickname: peerNickname,
          },
          lastMessage: lastMessage,
          lastMessageAt: lastMessageAt,
          unreadCount: raw.unreadCount ?? 0,
        };
      });

      setChats(mapped || []);
    } catch (e) {
      // 백엔드 실패 시 빈 배열로 표시
      setChats([]);
      // 에러 로그는 개발 환경에서만
      if (process.env.NODE_ENV === "development") {
        console.error("[ChatList] 백엔드 실패:", e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
    
    // 채팅방 생성 이벤트 리스너
    const handleChatroomCreated = () => {
      loadChats();
    };
    
    window.addEventListener('chatroomCreated', handleChatroomCreated);
    
    return () => {
      window.removeEventListener('chatroomCreated', handleChatroomCreated);
    };
  }, [loadChats]);

  // ✅ 전역 미읽음 합계
  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [chats]
  );

  // 목록이 바뀔 때마다 전역 합계 반영
  useEffect(() => {
    setUnreadTotal(unreadTotal);
  }, [unreadTotal, setUnreadTotal]);

  return (
    <div className="chat-shell">
      <div className="chat-frame">
        <header className="chat-topbar">
          <button
            className="back-btn"
            onClick={() => nav(-1)}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1>1:1 대화 목록</h1>
          <span />
        </header>

        <main className="chat-main">
          {loading && chats.length === 0 && (
            <div className="chat-loading">채팅 목록을 불러오는 중이에요...</div>
          )}

          {!loading && chats.length === 0 && (
            <div className="chat-empty" style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#999"
            }}>
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>대화 목록이 없어요</p>
              <p style={{ fontSize: "14px", color: "#bbb" }}>상품 상세에서 1:1 문의를 시작해보세요!</p>
            </div>
          )}

          {chats.length > 0 && (
            <ul className="chat-list">
              {chats.map((c) => {
              const isRead = (c.unreadCount || 0) === 0;

              return (
                <li
                  key={c.id}
                  className={
                    "chat-item" + (isRead ? " chat-item--read" : "")
                  }
                  role="button"
                  aria-label={`${c.peer.nickname} 채팅방으로 이동`}
                  onClick={() => nav(`/chat/${c.id}`)}
                >
                  <div className="avatar" />

                  <div className="chat-content">
                    <div className="chat-row-1">
                      <span className="nickname">{c.peer.nickname}</span>
                    </div>
                    <div
                      className={
                        c.unreadCount > 0
                          ? "last-message unread"
                          : "last-message"
                      }
                    >
                      {c.lastMessage || "(메시지 없음)"}
                    </div>
                  </div>

                  {/* 오른쪽 메타: 날짜 + 배지 */}
                  <div className="right-meta">
                    <span className="date">
                      {formatKoreanDate(c.lastMessageAt)}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="badge">{c.unreadCount}</span>
                    )}
                  </div>
                </li>
              );
            })}
            </ul>
          )}
        </main>

        {/* 하단 네비게이션 */}
        <div style={{ height: 56 }} />
        <BottomNav />
      </div>
    </div>
  );
}
