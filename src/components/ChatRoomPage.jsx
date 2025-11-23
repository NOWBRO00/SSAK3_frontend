import React, { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/ChatRoomPage.css";

import camIcon from "../image/icon_camera.png";
import sendIcon from "../image/icon_send.png";

/* 시간/날짜 유틸 */
function formatKoreanTime(dateLike) {
  const d = new Date(dateLike);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h < 12 ? "오전" : "오후";
  const hh = ((h + 11) % 12) + 1;
  return `${ap} ${hh}:${m}`;
}
function isSameYMD(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function formatDateDivider(dateLike) {
  const d = new Date(dateLike);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChatRoomPage() {
  // ✅ /chat/:id 경로 지원
  const { id } = useParams();
  const roomId = id || "temp";

  const nav = useNavigate();

  // 방 메타 정보(임시)
  const [roomMeta] = useState({
    roomId,
    peer: { id: "peer-1", nickname: "닉네임12345" },
    product: {
      id: "p1",
      title: "00자전거 팝니다 사실 분",
      price: 5350000,
      thumbUrl: "https://via.placeholder.com/120x120?text=BIKE",
    },
  });

  // 예시 메시지
  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      roomId,
      senderId: "peer-1",
      type: "text",
      text: "안녕하세요 혹시 물건 거래 가능 할까요?\n가격은 대충 얼마정도 아니면 음.. 한 얼마 얼마 생각 중인데요..",
      createdAt: "2025-08-16T13:06:00+09:00",
      sendStatus: "sent",
    },
    {
      id: "m2",
      roomId,
      senderId: "me",
      type: "text",
      text: "네 가능합니다! 안녕하세요를 너무 적은 거 같은데,,ㅎㅎ",
      createdAt: "2025-08-16T13:08:00+09:00",
      sendStatus: "sent",
    },
  ]);

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 첨부 시트
  const [attachOpen, setAttachOpen] = useState(false);
  const openAttachSheet = () => setAttachOpen(true);
  const triggerGallery = () => {
    setAttachOpen(false);
    fileInputRef.current?.click();
  };
  const triggerCamera = () => {
    setAttachOpen(false);
    cameraInputRef.current?.click();
  };

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 새 메시지 추가 시 자동 스크롤
  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    });
  };
  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  const canSend = text.trim().length > 0 && !uploading;

  const handleSend = () => {
    if (!canSend) return;
    const content = text.trim();
    setText("");

    const tempId = "tmp_" + Date.now();
    const optimistic = {
      id: tempId,
      tempId,
      roomId,
      senderId: "me",
      type: "text",
      text: content,
      createdAt: new Date().toISOString(),
      sendStatus: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);

    // fake send
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, sendStatus: "sent" } : m
        )
      );
    }, 400);
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const f of files) {
        const tempId = "tmp_" + Date.now() + "_" + f.name;
        const optimistic = {
          id: tempId,
          tempId,
          roomId,
          senderId: "me",
          type: f.type.startsWith("video") ? "video" : "image",
          media: { url: URL.createObjectURL(f) },
          createdAt: new Date().toISOString(),
          sendStatus: "sending",
        };
        setMessages((prev) => [...prev, optimistic]);

        // fake upload
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, sendStatus: "sent" } : m
            )
          );
        }, 500);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onCameraCapture = (e) => onFilesSelected(e);

  const rendered = useMemo(() => {
    if (!messages.length) return [];
    const out = [];
    let prevD = null;
    messages.forEach((m) => {
      const d = new Date(m.createdAt);
      if (!prevD || !isSameYMD(prevD, d)) {
        out.push({
          type: "divider",
          id: `div_${d.toDateString()}`,
          date: d,
        });
      }
      out.push({ type: "message", data: m, id: m.id });
      prevD = d;
    });
    return out;
  }, [messages]);

  return (
    <div className="room-shell">
      <div className="room-frame">
        {/* 상단바 */}
        <header className="room-topbar">
          <button
            className="top-btn"
            onClick={() => nav(-1)}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="room-title">{roomMeta.peer.nickname}</h1>
          <button
            className="top-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="더보기"
          >
            ⋮
          </button>
        </header>

        {/* 상품 카드 👉 클릭 시 상세페이지 이동만 추가 */}
        <section
          className="product-card"
          onClick={() => {
            if (roomMeta.product?.id) {
              nav(`/product/${roomMeta.product.id}`);
            } else {
              nav("/product");
            }
          }}
        >
          <div
            className="thumb"
            style={{
              backgroundImage: `url(${roomMeta.product.thumbUrl || ""})`,
            }}
          />
          <div className="prod-texts">
            <div className="prod-sub">{roomMeta.product.title}</div>
            <div className="prod-price">
              {roomMeta.product.price
                ? roomMeta.product.price.toLocaleString() + " 원"
                : "0 원"}
            </div>
          </div>
        </section>

        {/* 메시지 목록 (여기만 스크롤) */}
        <main
          className="room-main"
          ref={listRef}
          style={{ paddingBottom: `70px` }}
        >
          {!messages.length && (
            <div className="empty-hint">대화를 시작해 보세요.</div>
          )}

          {rendered.map((row) =>
            row.type === "divider" ? (
              <div key={row.id} className="date-divider">
                {formatDateDivider(row.date)}
              </div>
            ) : (
              <MessageBubble key={row.id} meId="me" msg={row.data} />
            )
          )}
          <div ref={bottomRef} />
        </main>

        {/* 경고 배너 (고정) */}
        <div className="safe-banner">
          [중고 거래 채팅 시 외부 채널 유도 및 개인정보 요구 금지] 매너는
          기본, 건강한 거래 문화를 약속해요.
        </div>

        {/* 입력 바 (고정) */}
        <footer className="input-bar">
          {/* 갤러리 선택 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFilesSelected}
            style={{ display: "none" }}
          />
          {/* 실제 카메라 촬영 */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={onCameraCapture}
            style={{ display: "none" }}
          />

          <div className="input-wrap">
            <input
              className="msg-input"
              placeholder="메시지 보내기"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            {/* 입력창 안쪽 카메라 아이콘 -> 시트 열기 */}
            <button
              className="icon-btn inside"
              aria-label="카메라"
              onClick={openAttachSheet}
              disabled={uploading}
              type="button"
            >
              <img className="icon-img" src={camIcon} alt="camera" />
            </button>
          </div>

          {/* 전송 버튼 */}
          <button
            className={"send-btn" + (canSend ? "" : " disabled")}
            onClick={handleSend}
            disabled={!canSend}
            aria-label="전송"
            type="button"
          >
            <img className="send-img" src={sendIcon} alt="send" />
          </button>
        </footer>

        {/* 하단 네비게이션 */}
        <BottomNav />

        {/* 첨부 시트: 사진/동영상 · 카메라 · 닫기 */}
        {attachOpen && (
          <div
            className="sheet-backdrop"
            onClick={() => setAttachOpen(false)}
          >
            <div
              className="bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sheet-group">
                <button className="sheet-item" onClick={triggerGallery}>
                  사진 / 동영상
                </button>
                <div className="sheet-divider" />
                <button className="sheet-item" onClick={triggerCamera}>
                  카메라
                </button>
              </div>
              <button
                className="sheet-item close"
                onClick={() => setAttachOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* ⋮ 메뉴 (필요시 확장) */}
        {menuOpen && (
          <div
            className="sheet-backdrop"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="sheet-item danger"
                onClick={() => {
                  setMenuOpen(false);
                  nav(-1);
                }}
              >
                채팅방 나가기
              </button>
              <button
                className="sheet-item close"
                onClick={() => setMenuOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ meId, msg }) {
  const mine = msg.senderId === meId;
  return (
    <div className={"msg-row " + (mine ? "mine" : "peer")}>
      <div className={"bubble " + msg.type}>
        {msg.type === "text" && <span>{msg.text}</span>}
        {msg.type === "image" && (
          <img className="media" src={msg.media?.url} alt="" />
        )}
        {msg.type === "video" && (
          <video
            className="media"
            src={msg.media?.url}
            controls
            playsInline
          />
        )}
      </div>
      <div className="meta">
        <span className="time">{formatKoreanTime(msg.createdAt)}</span>
        {mine && msg.sendStatus === "sent" && (
          <span className="read">읽음</span>
        )}
        {mine && msg.sendStatus === "sending" && (
          <span className="read">전송중…</span>
        )}
        {mine && msg.sendStatus === "failed" && (
          <span className="read fail">실패</span>
        )}
      </div>
    </div>
  );
}
