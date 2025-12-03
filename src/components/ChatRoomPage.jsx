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
// import warningIcon from "../image/warning_mark.png"; // 파일이 없으므로 CSS로 대체

// ✅ 백엔드 API 연동
import { BASE_URL } from "../lib/api";
import { getUserId, getKakaoId } from "../utils/auth";
import { buildImageUrl } from "../lib/products";

const API_BASE = BASE_URL;

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
  const { roomId: id } = useParams(); // App.js에서 /chat/:roomId로 정의되어 있음
  const roomId = id || "temp";
  const nav = useNavigate();
  
  // roomId 디버깅
  console.log("[채팅방 페이지] 렌더링:", { id, roomId, pathname: window.location.pathname });

  // ✅ 채팅방 메타(상대, 상품) - 백엔드에서 가져오기
  const [roomMeta, setRoomMeta] = useState({
    roomId,
    peer: { id: null, nickname: "로딩 중..." },
    product: {
      id: null,
      title: "",
      price: 0,
      thumbUrl: "",
    },
  });
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomLoaded, setRoomLoaded] = useState(false); // 채팅방 정보 로드 완료 여부

  // ✅ 메시지 목록 - 백엔드에서 가져오기
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageViewerUrl, setImageViewerUrl] = useState(null);

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // ✅ 채팅방 정보 로드
  const loadRoomInfo = useCallback(async () => {
    if (!roomId || roomId === "temp") {
      setLoadingRoom(false);
      return;
    }

    setLoadingRoom(true);
    try {
      // ✅ 백엔드 API: GET /api/chatrooms/rooms/{chatRoomId}
      const url = `${API_BASE}/api/chatrooms/rooms/${roomId}`;
      
      console.log("[채팅방 정보] 조회 시작:", url, { roomId });

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      console.log("[채팅방 정보] 응답 상태:", res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[채팅방 정보] 조회 실패:", res.status, errorText);
        
        // 400 에러는 채팅방이 없는 경우이므로 빈 상태로 처리
        if (res.status === 400 || res.status === 404) {
          console.log("[채팅방 정보] 채팅방이 존재하지 않음, 빈 상태로 처리");
          setRoomMeta({
            roomId,
            peer: { id: null, nickname: "알 수 없음" },
            product: { id: null, title: "", price: 0, thumbUrl: "" },
          });
          setRoomLoaded(true); // 로드 완료로 표시 (채팅방이 없어도)
          setLoadingRoom(false);
          return; // 에러를 throw하지 않고 종료
        }
        
        // 400/404가 아닌 다른 에러는 throw
        throw new Error(`채팅방 정보 조회 실패: ${res.status}`);
      }

      const data = await res.json();
      const userId = getUserId(); // DB PK
      const userKakaoId = getKakaoId(); // 카카오 ID
      
      console.log("[채팅방 정보] 조회 성공:", data);
      console.log("[채팅방 정보] 현재 사용자:", { 
        userId, 
        userKakaoId,
        profile: JSON.parse(localStorage.getItem("ssak3.profile") || "{}")
      });

        // 백엔드 응답 구조:
        // { id, buyerId, sellerId, productId, buyer: {id: DB_PK, kakaoId: 카카오ID, nickname, ...}, seller: {...}, product: {...} }
        
        // 상대방 정보 찾기 (seller 또는 buyer 중 현재 사용자가 아닌 사람)
        const sellerBackendId = data.sellerId || data.seller?.id; // DB PK
        const buyerBackendId = data.buyerId || data.buyer?.id; // DB PK
        const sellerKakaoId = data.seller?.kakaoId;
        const buyerKakaoId = data.buyer?.kakaoId;
        
        // 현재 사용자가 buyer인지 seller인지 확인
        // DB PK와 카카오 ID 모두 비교
        const isBuyer = userId && (
          String(buyerBackendId) === String(userId) || // DB PK 비교
          (userKakaoId && String(buyerKakaoId) === String(userKakaoId)) // 카카오 ID 비교
        );
        
        const isSeller = userId && (
          String(sellerBackendId) === String(userId) || // DB PK 비교
          (userKakaoId && String(sellerKakaoId) === String(userKakaoId)) // 카카오 ID 비교
        );
        
        // 디버깅 로그 (프로덕션에서도 확인 가능)
        console.log("[채팅방] 사용자 확인:", { 
          userId, 
          userKakaoId,
          sellerBackendId, 
          buyerBackendId, 
          sellerKakaoId, 
          buyerKakaoId, 
          isBuyer, 
          isSeller,
          fullData: data 
        });
        
        if (!isBuyer && !isSeller) {
          console.warn("[채팅방] 현재 사용자가 buyer도 seller도 아님! 데이터 확인 필요:", {
            userId,
            userKakaoId,
            buyerBackendId,
            sellerBackendId,
            buyerKakaoId,
            sellerKakaoId
          });
        }
        
        const peerId = isBuyer ? sellerBackendId : buyerBackendId;
        const peerNickname = isBuyer 
          ? (data.seller?.nickname || "판매자")
          : (data.buyer?.nickname || "구매자");

        // 상품 정보는 백엔드에서 product 객체로 제공됨
        const product = data.product || {};
        const productId = data.productId || product.id;
        
        // 상품 이미지 URL 처리
        let thumbUrl = "";
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const firstImage = product.images[0];
          thumbUrl = typeof firstImage === 'string' 
            ? buildImageUrl(firstImage)
            : buildImageUrl(firstImage.imageUrl || firstImage.url || "");
        } else if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
          thumbUrl = buildImageUrl(product.imageUrls[0]);
        }
        
        const productInfo = {
          id: productId,
          title: product.title || "",
          price: product.price || 0,
          thumbUrl: thumbUrl,
        };

        setRoomMeta({
          roomId: data.id || data.roomId || roomId,
          peer: {
            id: peerId,
            nickname: peerNickname,
          },
          product: productInfo,
        });
        setRoomLoaded(true); // 채팅방 정보 로드 완료
      } catch (e) {
        console.error("[채팅방 정보 조회 실패]:", e);
        // 에러 발생 시에도 로딩 상태 해제
        setRoomMeta({
          roomId,
          peer: { id: null, nickname: "오류" },
          product: { id: null, title: "", price: 0, thumbUrl: "" },
        });
        setRoomLoaded(true); // 로드 완료로 표시 (에러여도)
      } finally {
        setLoadingRoom(false);
      }
  }, [roomId]);

  // ✅ 채팅방 정보 로드 실행
  useEffect(() => {
    loadRoomInfo();
  }, [loadRoomInfo]);

  // ✅ 메시지 목록 로드 (채팅방 정보 로드 완료 후에만 실행)
  const loadMessages = useCallback(async () => {
    if (!roomId || roomId === "temp") {
      setLoadingMessages(false);
      return;
    }

    // 채팅방 정보가 로드되지 않았으면 대기
    if (!roomLoaded) {
      console.log("[메시지 목록] 채팅방 정보 로드 대기 중...");
      return;
    }

    try {
      // 백엔드 명세: GET /api/chatrooms/rooms/{chatRoomId}/messages
      const res = await fetch(`${API_BASE}/api/chatrooms/rooms/${roomId}/messages`, {
        credentials: "include",
      });

      // 400 에러는 채팅방이 없거나 메시지가 없는 경우이므로 빈 리스트로 처리
      if (res.status === 400 || res.status === 404) {
        console.log("[메시지 목록] 채팅방이 없거나 메시지가 없음, 빈 리스트 반환");
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      if (!res.ok) {
        // 400/404가 아닌 다른 에러만 throw
        throw new Error("메시지 목록 조회 실패");
      }

      const rawList = await res.json();
      console.log("[메시지 목록] 백엔드 응답:", rawList);
      console.log("[메시지 목록] 메시지 개수:", Array.isArray(rawList) ? rawList.length : 0);
      
      const userId = getUserId();
      const userKakaoId = getKakaoId();

      const mapped = (Array.isArray(rawList) ? rawList : []).map((raw) => {
        const senderId = raw.senderId || raw.sender?.id || raw.userId;
        const senderKakaoId = raw.sender?.kakaoId || raw.senderKakaoId;
        
        // DB PK와 카카오 ID 모두 비교
        const isMe = userId && (
          String(senderId) === String(userId) ||
          (userKakaoId && String(senderKakaoId) === String(userKakaoId))
        );

        return {
          id: raw.id || raw.messageId,
          roomId: raw.roomId || raw.chatroomId || roomId,
          senderId: isMe ? "me" : (senderId || "peer"),
          type: raw.type || "text",
          text: raw.content || raw.text || raw.message || "",
          media: raw.mediaUrl || raw.imageUrl ? {
            url: buildImageUrl(raw.mediaUrl || raw.imageUrl),
          } : undefined,
          createdAt: raw.createdAt || raw.sentAt || new Date().toISOString(),
          sendStatus: "sent",
        };
      });

      console.log("[메시지 목록] 매핑된 메시지:", mapped.length, "개");
      setMessages(mapped);
    } catch (e) {
      console.error("[메시지 목록 조회 실패]:", e);
      setMessages([]); // 에러 발생 시 빈 리스트 반환
    } finally {
      setLoadingMessages(false);
    }
  }, [roomId, roomLoaded]);

  // ✅ 초기 메시지 로드 및 폴링 (채팅방 정보 로드 완료 후)
  useEffect(() => {
    // 채팅방 정보가 로드된 후에만 메시지 로드
    if (roomLoaded) {
      loadMessages();

      // 3초마다 새 메시지 확인 (폴링)
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [loadMessages, roomLoaded]);

  // 🔹 새 메시지 들어올 때마다 맨 아래로 스크롤
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages.length]);

  const canSend = text.trim().length > 0 && !uploading;

  // ✅ 텍스트 메시지 전송 - 백엔드 API 연동
  const handleSend = async () => {
    if (!canSend) return;
    const content = text.trim();
    if (!content) return;

    // roomId가 유효하지 않으면 메시지 전송 불가
    if (!roomId || roomId === "temp" || isNaN(Number(roomId))) {
      alert("채팅방 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

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
    setText("");
    setMessages((p) => [...p, optimistic]);

    try {
      const userId = getUserId(); // DB PK
      const userKakaoId = getKakaoId(); // 카카오 ID
      
      if (!userId && !userKakaoId) {
        throw new Error("로그인이 필요합니다.");
      }

      // 백엔드 명세: POST /api/chatrooms/rooms/{chatRoomId}/messages?senderId={senderId}
      // 백엔드: @RequestParam Long senderId - DB PK (UserProfile.id)를 기대
      // 채팅방 생성 시 buyerId도 Long 타입이므로 DB PK 사용
      // 따라서 여기서도 DB PK 사용
      const senderId = userId; // DB PK 사용
      
      if (!senderId) {
        console.error("[메시지 전송] DB PK를 찾을 수 없음:", { userId, userKakaoId });
        throw new Error("사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.");
      }
      
      // senderId가 DB PK인지 확인 (DB PK는 보통 작은 숫자, 카카오 ID는 큰 숫자)
      if (senderId > 1000000) {
        console.warn("[메시지 전송] senderId가 카카오 ID일 수 있음:", senderId);
        // 카카오 ID인 경우 DB PK를 찾아야 함
        // 하지만 일단 시도해보고 백엔드 에러 확인
      }
      
      const url = `${API_BASE}/api/chatrooms/rooms/${roomId}/messages?senderId=${senderId}`;
      
      console.log("[메시지 전송] 요청:", url, { 
        content, 
        roomId, 
        userId, 
        userKakaoId,
        senderId,
        senderIdType: typeof senderId,
        isDbPk: senderId < 1000000
      });

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
        }),
      });

      console.log("[메시지 전송] 응답 상태:", res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[메시지 전송 실패] 응답 본문:", errorText);
        console.error("[메시지 전송 실패] 요청 URL:", url);
        
        // 에러 메시지 파싱 시도
        let errorMessage = "메시지 전송 실패";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      // 응답 본문 확인
      const responseText = await res.text();
      console.log("[메시지 전송] 응답 본문 (raw):", responseText);
      console.log("[메시지 전송] 응답 본문 길이:", responseText?.length);
      
      let data = null;
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
          console.log("[메시지 전송] 응답 데이터 (parsed):", data);
          console.log("[메시지 전송] 메시지 ID:", data?.id || data?.messageId);
        } catch (parseError) {
          console.warn("[메시지 전송] JSON 파싱 실패:", parseError, "원본:", responseText);
          // 빈 응답이어도 성공으로 처리 (204 No Content와 유사)
        }
      } else {
        console.log("[메시지 전송] 빈 응답 (성공으로 처리)");
      }
      
      // 성공 시 optimistic 메시지를 실제 메시지로 교체
      const messageId = data?.id || data?.messageId;
      console.log("[메시지 전송] 최종 메시지 ID:", messageId || tempId);
      
      setMessages((p) =>
        p.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: messageId || tempId,
                sendStatus: "sent",
              }
            : m
        )
      );

      // 메시지 목록 새로고침 (백엔드에서 최신 상태 가져오기)
      // 즉시 새로고침하여 전송된 메시지 확인
      console.log("[메시지 전송] 메시지 목록 새로고침 예정");
      setTimeout(() => {
        console.log("[메시지 전송] 메시지 목록 새로고침 실행");
        loadMessages();
      }, 300);
    } catch (e) {
      console.error("[메시지 전송 오류]:", e);
      // 실패 시 optimistic 메시지 제거
      setMessages((p) => p.filter((m) => m.id !== tempId));
      alert(`메시지 전송에 실패했습니다: ${e.message || "알 수 없는 오류"}`);
    }
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

        {/* 로딩 중 */}
        {loadingRoom && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
            <p>채팅방 정보를 불러오는 중...</p>
          </div>
        )}
        
        {!loadingRoom && loadingMessages && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
            <p>메시지를 불러오는 중...</p>
          </div>
        )}

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
              {roomMeta.product.price && roomMeta.product.price > 0 
                ? `${roomMeta.product.price.toLocaleString()} 원`
                : ""}
            </div>
          </div>
        </section>

        {/* 메시지 목록 */}
        <main className="room-main" ref={listRef}>
          {!loadingRoom && !loadingMessages && messages.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
              <p>대화 내역이 없습니다.</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>첫 메시지를 보내보세요!</p>
            </div>
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
