// src/components/ChatRoomPage.jsx
import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/ChatRoomPage.css";

import camIcon from "../image/icon_camera.png";
import sendIcon from "../image/icon_send.png";

/* ===== 공통 상수 (백엔드 연동용) ===== */
const API_BASE = "http://localhost:8080"; // 서버 주소
const USER_ID = 1; // TODO: 로그인 연동 후 실제 유저 ID로 교체

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
  const { id } = useParams();
  const roomId = id || "temp";

  const nav = useNavigate();

  /* 방 메타 정보(임시 더미)
     - product.id 를 숫자로 둬서 /product/:id 라우트 및 상세 더미/백엔드와 맞춤 */
  const [roomMeta] = useState({
    roomId,
    peer: { id: "peer-1", nickname: "닉네임12345" },
    product: {
      id: 3, // 예: productId 3
      title: "00자전거 팝니다 사실 분",
      price: 5_350_000,
      thumbUrl: "https://via.placeholder.com/120x120?text=BIKE",
    },
  });

  // 예시 메시지 (실제 연동 시 /api/chatrooms/{roomId}/messages + 소켓으로 대체)
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

  // 첨부/카메라 시트 & 모달
  const [attachOpen, setAttachOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // 이미지 전체 보기
  const [imageViewerUrl, setImageViewerUrl] = useState(null);

  const openAttachSheet = () => setAttachOpen(true);
  const triggerGallery = () => {
    setAttachOpen(false);
    fileInputRef.current?.click();
  };
  const triggerCamera = () => {
    setAttachOpen(false);
    setCameraOpen(true);
  };

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // 텍스트 전송 (지금은 가짜 전송)
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

    // TODO: 실제 /api/messages 전송 후 응답에 맞게 id / sendStatus 갱신
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, sendStatus: "sent" } : m
        )
      );
    }, 400);
  };

  // 갤러리에서 파일 선택
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

        // TODO: 실제 업로드 API 연동
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

  // WebRTC 카메라에서 한 장 촬영되었을 때
  const handleCameraCaptured = useCallback(
    (blob) => {
      if (!blob) return;

      const file = new File([blob], `camera_${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      const url = URL.createObjectURL(file);

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

      // TODO: 실제 서버 업로드 API로 교체
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, sendStatus: "sent" } : m
          )
        );
      }, 500);
    },
    [roomId]
  );

  // 날짜 divider + 메시지 합쳐서 렌더링용 배열로 변환
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

  /* ===== 채팅방 나가기: DELETE /api/chatrooms/{roomId} 가 있다고 가정 ===== */
  const handleLeaveRoom = async () => {
    setMenuOpen(false);
    if (!window.confirm("이 채팅방을 나가시겠어요?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/chatrooms/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: USER_ID }), // 필요 없으면 백엔드에서 무시
      });

      if (!res.ok) {
        throw new Error("채팅방 나가기 실패");
      }

      // ✅ 여기까지 성공하면 백엔드에서 구매자/판매자 둘 다에게서
      //    이 방이 안 보이도록 처리해주면 됨
      alert("채팅방을 나갔습니다.");
      nav("/chat"); // 채팅 목록으로 이동
    } catch (e) {
      console.error(e);
      alert("채팅방 나가기 중 오류가 발생했어요.");
    }
  };

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

        {/* 상품 카드 (클릭 시 상품 상세로 이동) */}
        <section
          className="product-card"
          onClick={() => {
            if (roomMeta.product?.id != null) {
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

        {/* 메시지 목록 */}
        <main
          className="room-main"
          ref={listRef}
          style={{ paddingBottom: "70px" }}
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
              <MessageBubble
                key={row.id}
                meId="me"
                msg={row.data}
                onImageClick={(url) => setImageViewerUrl(url)}
              />
            )
          )}
          <div ref={bottomRef} />
        </main>

        {/* 경고 배너 */}
        <div className="safe-banner">
          [중고 거래 채팅 시 외부 채널 유도 및 개인정보 요구 금지] 매너는
          기본, 건강한 거래 문화를 약속해요.
        </div>

        {/* 입력 바 */}
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
            {/* 입력창 안쪽 카메라 아이콘 -> 첨부 시트 열기 */}
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

        {/* ⋮ 메뉴 (채팅방 나가기 포함) */}
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
                onClick={handleLeaveRoom}
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

        {/* WebRTC 카메라 모달 */}
        {cameraOpen && (
          <CameraModal
            onClose={() => setCameraOpen(false)}
            onCapture={(blob) => {
              setCameraOpen(false);
              handleCameraCaptured(blob);
            }}
          />
        )}

        {/* 이미지 전체 보기 모달 */}
        {imageViewerUrl && (
          <div
            className="img-viewer-backdrop"
            onClick={() => setImageViewerUrl(null)}
          >
            <img
              className="img-viewer-img"
              src={imageViewerUrl}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ meId, msg, onImageClick }) {
  const mine = msg.senderId === meId;
  const handleImageClick = () => {
    if (msg.media?.url && onImageClick) {
      onImageClick(msg.media.url);
    }
  };

  return (
    <div className={"msg-row " + (mine ? "mine" : "peer")}>
      <div className={"bubble " + msg.type}>
        {msg.type === "text" && <span>{msg.text}</span>}
        {msg.type === "image" && (
          <img
            className="media"
            src={msg.media?.url}
            alt=""
            onClick={handleImageClick}
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
        {mine && msg.sendStatus === "failed" && (
          <span className="read fail">실패</span>
        )}
      </div>
    </div>
  );
}

/* ===== WebRTC 카메라 모달 ===== */
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
          {!ready && <div className="cam-loading">카메라 여는 중...</div>}
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
