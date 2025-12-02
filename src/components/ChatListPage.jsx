// src/components/ChatListPage.jsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatListPage.css";

// 전역 미읽음 컨텍스트
import { useUnread } from "../state/UnreadContext";
import BottomNav from "./BottomNav";

// 🔹 공통 API BASE
import { BASE_URL } from "../lib/api";

const API_BASE = BASE_URL;

// ✅ 사용자 ID 가져오기 (카카오 로그인)
const getUserId = () => {
  try {
    const profileStr = localStorage.getItem("ssak3.profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.id;
    }
  } catch (e) {
    console.error("프로필 파싱 실패:", e);
  }
  return null;
};

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

      // 🔹 백엔드 응답 예시 가정:
      // [
      //   {
      //     "id": 1,
      //     "roomId": 1,
      //     "otherNickname": "닉네임123",
      //     "lastMessage": "아직 판매 하고 계신가요?",
      //     "lastMessageAt": "2025-11-03T07:00:00Z",
      //     "unreadCount": 4
      //   }
      // ]
      const mapped = rawList.map((raw) => ({
        id: raw.id ?? raw.roomId, // 라우터에서 /chat/:roomId 로 사용
        peer: {
          nickname:
            raw.otherNickname ||
            raw.peerNickname ||
            raw.sellerNickname ||
            raw.buyerNickname ||
            "상대방",
        },
        lastMessage: raw.lastMessage || raw.lastMessageContent || "",
        lastMessageAt: raw.lastMessageAt || raw.updatedAt || raw.createdAt,
        unreadCount: raw.unreadCount ?? 0,
      }));

      setChats(mapped);
    } catch (e) {
      // 백엔드 실패 시 빈 배열로 표시
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
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
        </main>

        {/* 하단 네비게이션 */}
        <div style={{ height: 56 }} />
        <BottomNav />
      </div>
    </div>
  );
}
