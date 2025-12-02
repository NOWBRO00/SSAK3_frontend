// src/components/ChatRoomPage.jsx
import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/ChatRoomPage.css";

import camIcon from "../image/icon_camera.png";
import sendIcon from "../image/icon_send.png";
// import warningIcon from "../image/warning_mark.png"; // 파일이 없으므로 CSS로 대체

// 나중에 실서버 붙일 때 여기서 BASE_URL / USER_ID 가져다 쓰면 됨
// import { BASE_URL } from "../lib/api";
// const API_BASE = BASE_URL;
// const USER_ID = 1;

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
  const { id } = useParams();
  const roomId = id || "temp";
  const nav = useNavigate();

  // 🔹 채팅방 메타(상대, 상품) – 지금은 mock, 나중에 API로 교체
  const [roomMeta] = useState({
    roomId,
    peer: { id: "peer-1", nickname: "닉네임12345" },
    product: {
      id: 3,
      title: "00자전거 팝니다 사실 분",
      price: 5_350_000,
      thumbUrl: "",
    },
  });

  // 🔹 메시지 목록 – 지금은 로컬 상태, 나중에 WebSocket / 폴링으로 교체
  const [messages, setMessages] = useState([
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
  const [attachOpen, setAttachOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageViewerUrl, setImageViewerUrl] = useState(null);

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // 🔹 새 메시지 들어올 때마다 맨 아래로 스크롤
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages.length]);

  const canSend = text.trim().length > 0 && !uploading;

  // 🔹 텍스트 메시지 전송 (지금은 프론트에서만 optimistic)
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
    setMessages((p) => [...p, optimistic]);

    // 나중에 여기서 실제 POST / 메시지 전송 후 상태 업데이트
    setTimeout(() => {
      setMessages((p) =>
        p.map((m) => (m.id === tempId ? { ...m, sendStatus: "sent" } : m))
      );
    }, 400);
  };

  // 🔹 파일 첨부(갤러리)로 이미지/동영상 전송
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

        // 나중에는 여기서 실제 업로드 후 URL로 교체
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

  // 🔹 카메라 촬영 후 "이 사진 사용" 눌렀을 때 → 바로 이미지 메시지로 추가
  const handleCameraCapture = (blob) => {
    setCameraOpen(false);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const tempId = "tmp_cam_" + Date.now();

    const optimistic = {
      id: tempId,
      tempId,
      roomId,
      senderId: "me",
      type: "image",
      media: { url },
      createdAt: new Date().toISOString(),
      sendStatus: "sending",
    };

    setMessages((prev) => [...prev, optimistic]);

    // 나중에 여기서 실제 업로드 → 성공 시 sendStatus 'sent'로 변경
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, sendStatus: "sent" } : m
        )
      );
    }, 500);
  };

  // 🔹 날짜 디바이더 포함해서 렌더링용 배열로 변환
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
      out.push({ type: "message", id: m.id, data: m });
      prevD = d;
    });

    return out;
  }, [messages]);

  // 🔹 채팅방 나가기
  const handleLeaveRoom = async () => {
    setMenuOpen(false);
    if (!window.confirm("이 채팅방을 나가시겠어요?")) return;

    // 나중에 DELETE /api/chatrooms/{id} 같은 API 붙이면 여기서 호출
    alert("채팅방을 나갔습니다.");
    nav("/chat");
  };

  return (
    <div className="room-shell">
      <div className="room-frame">
        {/* 상단 */}
        <header className="room-topbar">
          <button className="top-btn" onClick={() => nav(-1)} aria-label="뒤로가기">
            ←
          </button>
          <h1 className="room-title">{roomMeta.peer.nickname}</h1>
          <button
            className="top-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
          >
            ⋮
          </button>
        </header>

        {/* 상품 카드 */}
        <section
          className="product-card"
          onClick={() => nav(`/product/${roomMeta.product.id}`)}
        >
          <div
            className="thumb"
            style={{
              backgroundImage: `url(${roomMeta.product.thumbUrl})`,
            }}
          />
          <div className="prod-texts">
            <div className="prod-sub">{roomMeta.product.title}</div>
            <div className="prod-price">
              {roomMeta.product.price.toLocaleString()} 원
            </div>
          </div>
        </section>

        {/* 메시지 목록 */}
        <main className="room-main" ref={listRef}>
          {rendered.map((row) =>
            row.type === "divider" ? (
              <div key={row.id} className="date-divider">
                {formatDateDivider(row.date)}
              </div>
            ) : (
              <MessageBubble
                key={row.id}
                meId="me"
                msg={row.data}
                onImageClick={setImageViewerUrl}
              />
            )
          )}
          <div ref={bottomRef} />
        </main>

        {/* 안전 배너 */}
        <div className="safe-banner">
          <div className="safe-icon" style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            backgroundColor: '#ff6b6b',
            display: 'inline-block',
            textAlign: 'center',
            lineHeight: '20px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>!</div>
          <div className="safe-top">
            [중고 거래 채팅 시 외부 채널 유도 및 개인정보 요구 금지]
          </div>
          <div className="safe-bottom">
            매너는 기본, 건강한 거래 문화를 약속해요.
          </div>
        </div>

        {/* 입력바 */}
        <footer className="input-bar">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFilesSelected}
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
            <button
              className="icon-btn inside"
              onClick={() => setAttachOpen(true)}
              type="button"
              aria-label="사진/동영상 보내기"
            >
              <img className="icon-img" src={camIcon} alt="카메라" />
            </button>
          </div>

          <button
            className={"send-btn" + (canSend ? "" : " disabled")}
            disabled={!canSend}
            onClick={handleSend}
            type="button"
            aria-label="전송"
          >
            <img className="send-img" src={sendIcon} alt="전송" />
          </button>
        </footer>

        <BottomNav />
      </div>

      {/* ====== room-frame 밖으로 이동한 시트/모달들 ====== */}

      {/* ⋮ 메뉴 시트 */}
      {menuOpen && (
        <div className="sheet-backdrop" onClick={() => setMenuOpen(false)}>
          <div
            className="bottom-sheet menu-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="sheet-item danger" onClick={handleLeaveRoom}>
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

      {/* 첨부 시트 */}
      {attachOpen && (
        <div className="sheet-backdrop" onClick={() => setAttachOpen(false)}>
          <div
            className="bottom-sheet attach-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-group">
              <button
                className="sheet-item"
                onClick={() => {
                  setAttachOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                사진 / 동영상
              </button>
              <div className="sheet-divider" />
              <button
                className="sheet-item"
                onClick={() => {
                  setAttachOpen(false);
                  setCameraOpen(true);
                }}
              >
                카메라로 촬영
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

      {/* 카메라 모달 */}
      {cameraOpen && (
        <CameraModal
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}

      {/* 이미지 전체 보기 */}
      {imageViewerUrl && (
        <div
          className="img-viewer-backdrop"
          onClick={() => setImageViewerUrl(null)}
        >
          <img
            className="img-viewer-img"
            src={imageViewerUrl}
            alt="미리보기"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function MessageBubble({ meId, msg, onImageClick }) {
  const mine = msg.senderId === meId;

  return (
    <div className={"msg-row " + (mine ? "mine" : "peer")}>
      <div className={"bubble " + msg.type}>
        {msg.type === "text" && <span>{msg.text}</span>}

        {msg.type === "image" && (
          <img
            className="media"
            src={msg.media?.url}
            onClick={() => onImageClick(msg.media.url)}
            alt="이미지 메시지"
          />
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
      </div>
    </div>
  );
}

/* ============ CameraModal ============ */
function CameraModal({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [shotUrl, setShotUrl] = useState(null);
  const shotBlobRef = useRef(null);
  const shotUrlRef = useRef(null);

  useEffect(() => {
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("이 브라우저에서는 카메라를 사용할 수 없어요.");
        onClose();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (err) {
        console.error(err);
        alert("카메라 접근에 실패했어요.");
        onClose();
      }
    }
    start();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (shotUrlRef.current) {
        URL.revokeObjectURL(shotUrlRef.current);
      }
    };
  }, [onClose]);

  const takeShot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        shotBlobRef.current = blob;
        if (shotUrlRef.current) {
          URL.revokeObjectURL(shotUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        shotUrlRef.current = url;
        setShotUrl(url);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleUseShot = () => {
    if (shotBlobRef.current && onCapture) {
      onCapture(shotBlobRef.current);
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    if (shotUrlRef.current) {
      URL.revokeObjectURL(shotUrlRef.current);
      shotUrlRef.current = null;
    }
    shotBlobRef.current = null;
    setShotUrl(null);
  };

  return (
    <div className="cam-backdrop" onClick={onClose}>
      <div
        className="cam-modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="cam-video-wrap">
          {!shotUrl ? (
            <video
              ref={videoRef}
              className="cam-video"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <img className="cam-shot" src={shotUrl} alt="preview" />
          )}
          {!ready && (
            <div className="cam-loading">카메라 여는 중...</div>
          )}
        </div>

        <div className="cam-actions">
          {!shotUrl ? (
            <>
              <button className="cam-btn" onClick={onClose}>
                닫기
              </button>
              <button className="cam-btn primary" onClick={takeShot}>
                촬영
              </button>
            </>
          ) : (
            <>
              <button className="cam-btn" onClick={handleRetry}>
                다시 찍기
              </button>
              <button className="cam-btn primary" onClick={handleUseShot}>
                이 사진 사용
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
