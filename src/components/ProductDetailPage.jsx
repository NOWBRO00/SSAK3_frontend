// src/components/ProductDetailPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/ProductDetailPage.css";

// 스티커 이미지
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

// 데코 이미지
import bearImg from "../image/image.png";
import bubbleImg from "../image/image2.png";
import logo from "../image/Group 23.png";

// 상단 아이콘
import backIcon from "../image/vector-33.png";
import searchIcon from "../image/icon-search.png";

// 🔌 공통 API BASE
import { BASE_URL } from "../lib/api";
// ✅ 공통 인증 유틸리티 사용
import { getUserId } from "../utils/auth";

// Mock 데이터 제거됨

// 🔹 로딩 이미지
import loaderImg from "../image/loader.png";

// ====== 백엔드 연동용 기본 설정 ======
const API_BASE = BASE_URL;


const KRW = (n) =>
  typeof n === "number"
    ? n.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      })
    : n;

const DEFAULT_AVATAR_DATA =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='40' fill='%23eeeeee'/><circle cx='40' cy='32' r='14' fill='%23cccccc'/><rect x='16' y='50' width='48' height='18' rx='9' fill='%23cccccc'/></svg>";

const DEFAULT_MANNER_TEMP = 35;

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [p, setP] = useState(null);

  const [idx, setIdx] = useState(0);
  const [wishLoading, setWishLoading] = useState(false);
  const [isWish, setIsWish] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // swipe state
  const heroRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const main = useMemo(() => p?.images?.[idx] ?? "", [p, idx]);

  // ====== 상품 상세 조회 (백엔드 + mock fallback) ======
  const load = useCallback(async () => {
    // id가 없거나 undefined 문자열이면 조기 반환
    if (!id || id === "undefined" || id === "null" || isNaN(Number(id))) {
      setLoading(false);
      setP(null);
      return;
    }
    setLoading(true);

    try {
      // 1) 백엔드 시도
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("상품 조회 실패");
      const raw = await res.json();

      const images = Array.isArray(raw.imageUrls)
        ? raw.imageUrls.map((path) =>
            path?.startsWith("http")
              ? path
              : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
          )
        : [];

      // 백엔드 응답에서 seller 정보 확인
      // 백엔드가 sellerId와 sellerKakaoId를 모두 제공함
      const sellerId = raw.sellerId; // 백엔드 내부 사용자 ID
      const sellerKakaoId = raw.sellerKakaoId || raw.seller?.kakaoId; // 카카오 ID (백엔드에서 직접 제공)
      
      const mapped = {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        price: raw.price,
        status: raw.status, // ON_SALE | RESERVED | SOLD_OUT
        category: { name: raw.categoryName || "기타" },
        images,
        seller: {
          id: sellerId, // 백엔드 내부 사용자 ID
          kakaoId: sellerKakaoId, // 카카오 ID
          nickname: raw.sellerNickname || "익명",
          profile_image_url:
            raw.profileImageUrl || raw.profile_image_url || "",
          mannerTemperature:
            raw.mannerTemperature !== undefined
              ? raw.mannerTemperature
              : DEFAULT_MANNER_TEMP,
        },
        // 원본 sellerId와 sellerKakaoId도 저장 (직접 비교용)
        sellerId: raw.sellerId,
        sellerKakaoId: sellerKakaoId,
        isWishlisted: !!raw.isWishlisted,
        wishCount: raw.likeCount ?? 0,
        created_at: raw.createdAt,
      };
      
      // 디버깅: 백엔드 응답 구조 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[상품 상세 응답]", {
          raw,
          sellerId,
          sellerKakaoId,
          rawSeller: raw.seller,
          rawSellerKakaoId: raw.sellerKakaoId,
        });
      }

      setP(mapped);
      setIsWish(mapped.isWishlisted);
      setWishCount(mapped.wishCount);
      setIdx(0);
    } catch (e) {
      // 상품 조회 실패
      setP(null);
      // 에러 로그는 개발 환경에서만
      if (process.env.NODE_ENV === "development") {
        console.error("[상품 조회 실패]:", e);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const goPrev = useCallback(() => {
    if (!p?.images?.length) return;
    setIdx((i) => Math.max(0, i - 1));
  }, [p]);

  const goNext = useCallback(() => {
    if (!p?.images?.length) return;
    setIdx((i) => Math.min(p.images.length - 1, i + 1));
  }, [p]);

  // 상태 플래그 (백엔드 enum 기준)
  const isReserved = p?.status === "RESERVED";
  const isSoldOut = p?.status === "SOLD_OUT";

  // ====== touch swipe ======
  const onTouchStart = (e) => {
    if (!p?.images || p.images.length < 2) return;
    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    draggingRef.current = true;
    heroRef.current?.classList.add("dragging");
  };

  const onTouchMove = (e) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startXRef.current;
    const dy = Math.abs(t.clientY - startYRef.current);
    if (dy > Math.abs(dx)) return; // 세로 스크롤 우선
  };

  const onTouchEnd = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    heroRef.current?.classList.remove("dragging");
    const touch = e.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - startXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // ====== mouse drag ======
  const onMouseDown = (e) => {
    if (!p?.images || p.images.length < 2) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    draggingRef.current = true;
    heroRef.current?.classList.add("dragging");
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = Math.abs(e.clientY - startYRef.current);
    if (dy > Math.abs(dx)) return;
  };

  const onMouseUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    heroRef.current?.classList.remove("dragging");
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const onMouseLeave = () => {
    if (draggingRef.current) {
      draggingRef.current = false;
      heroRef.current?.classList.remove("dragging");
    }
  };

  // 키보드 좌우 이동
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // ====== 찜 토글 (명세서 기준 /api/likes) ======
  const toggleWish = useCallback(async () => {
    if (!p || wishLoading) return;
    setWishLoading(true);
    const next = !isWish;

    // optimistic 업데이트
    setIsWish(next);
    setWishCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      // API 명세서: POST/DELETE /api/likes?userId={userId}&productId={productId}
      const url = `${API_BASE}/api/likes?userId=${userId}&productId=${p.id}`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[찜 ${next ? "추가" : "취소"}] 요청:`, url);
      }
      
      const res = await fetch(url, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[찜 ${next ? "추가" : "취소"}] 응답:`, res.status, res.statusText);
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        if (process.env.NODE_ENV === "development") {
          console.error("[찜 실패] 응답 본문:", errorText);
        }
        throw new Error("찜 실패");
      }
      
      // 성공 시 응답 데이터 확인 (선택적)
      if (res.status !== 204) {
        const data = await res.json();
        if (process.env.NODE_ENV === "development") {
          console.log("[찜 성공] 응답 데이터:", data);
        }
      }
      
      // 찜 추가/취소 성공 시 페이지 새로고침 없이 목록 갱신을 위해 이벤트 발생
      // (다른 페이지에서 찜 목록을 갱신할 수 있도록)
      window.dispatchEvent(new CustomEvent('wishListUpdated'));
      
      // 찜 상태 변경 이벤트도 발생 (같은 페이지에서도 반영)
      window.dispatchEvent(new CustomEvent('wishStatusChanged', { 
        detail: { productId: p.id, isWish: next } 
      }));
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[찜 오류]:", e);
      }
      // 롤백
      setIsWish((v) => !v);
      setWishCount((c) => Math.max(0, c + (next ? -1 : 1)));
      alert("찜에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setWishLoading(false);
    }
  }, [p, isWish, wishLoading]);

  // ====== 1:1 문의 (채팅방 생성) - /api/chatrooms ======
  const startChat = useCallback(async () => {
    if (!p) return;
    
    // 자기 상품인지 확인
    const userId = getUserId();
    if (!userId) {
      alert("로그인이 필요합니다.");
      nav("/login");
      return;
    }
    
    // 판매자 ID와 현재 사용자 ID 비교
    // seller.id는 백엔드 사용자 ID일 수도 있고, 카카오 ID일 수도 있음
    const sellerId = p.seller?.id;
    if (sellerId && (sellerId === userId || String(sellerId) === String(userId))) {
      alert("자신의 상품에는 문의할 수 없습니다.");
      return;
    }
    
    try {
      // 백엔드가 @RequestParam으로 buyerId를 받는 것으로 보임
      // 쿼리 파라미터로 전송
      const params = new URLSearchParams();
      params.append("buyerId", userId);
      params.append("productId", p.id);
      
      // sellerId가 있으면 함께 전송
      const sellerBackendId = p.seller?.id || p.sellerId;
      if (sellerBackendId) {
        params.append("sellerId", sellerBackendId);
      }
      
      const url = `${API_BASE}/api/chatrooms?${params.toString()}`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("[채팅방 생성] 요청 URL:", url);
      }
      
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        if (process.env.NODE_ENV === "development") {
          console.error("[채팅방 생성 실패] 응답:", res.status, errorText);
          console.error("[채팅방 생성 실패] 요청 URL:", url);
        }
        
        // 400 에러인 경우 더 자세한 메시지 표시
        if (res.status === 400) {
          try {
            const errorJson = JSON.parse(errorText);
            alert(errorJson.message || "채팅방 생성에 실패했습니다. 입력 정보를 확인해주세요.");
          } catch {
            alert("채팅방 생성에 실패했습니다. 입력 정보를 확인해주세요.");
          }
        } else {
          alert("채팅방 생성에 실패했습니다.");
        }
        throw new Error("chat fail");
      }
      
      const data = await res.json();
      const roomId = data.roomId ?? data.id;
      
      // 채팅방 생성 응답 데이터를 sessionStorage에 저장 (ChatRoomPage에서 사용)
      if (roomId && data) {
        sessionStorage.setItem(`chatroom_${roomId}`, JSON.stringify(data));
        console.log("[채팅방 생성] 응답 데이터 저장:", { roomId, data });
      }
      
      // 채팅방 생성 성공 시 채팅 목록 갱신 이벤트 발생
      // roomId를 detail에 포함하여 더 구체적인 정보 전달
      window.dispatchEvent(new CustomEvent('chatroomCreated', { 
        detail: { roomId, data } 
      }));
      
      console.log("[채팅방 생성] 이벤트 발생:", { roomId, data });
      
      if (roomId) {
        nav(`/chat/${roomId}`);
      } else {
        nav("/chat");
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[채팅방 생성 오류]:", e);
      }
      alert("채팅방 생성에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }, [p, nav]);

  // 매너온도
  const rawManner =
    p?.seller?.mannerTemperature ??
    p?.seller?.manner_temperature ??
    DEFAULT_MANNER_TEMP;

  const mannerTemp =
    typeof rawManner === "number"
      ? Math.max(0, Math.min(100, rawManner))
      : DEFAULT_MANNER_TEMP;

  const tempLevel =
    mannerTemp < 36 ? "low" : mannerTemp < 60 ? "mid" : "high";

  // ====== 내 상품인지 확인 ======
  // 백엔드가 sellerId(내부 ID)와 sellerKakaoId(카카오 ID)를 모두 제공함
  // 프론트엔드에서는 카카오 ID로 비교하므로 sellerKakaoId를 우선적으로 사용
  const userId = getUserId(); // 카카오 ID
  const sellerKakaoId = p?.sellerKakaoId || p?.seller?.kakaoId; // 백엔드에서 제공하는 카카오 ID
  const sellerBackendId = p?.seller?.id; // 백엔드 내부 사용자 ID (참고용)
  const rawSellerId = p?.sellerId; // 원본 sellerId (참고용)
  
  // 비교 헬퍼 함수
  const compareIds = (id1, id2) => {
    if (!id1 || !id2) return false;
    return (
      id1 === id2 || 
      String(id1) === String(id2) ||
      Number(id1) === Number(id2)
    );
  };
  
  // 백엔드가 sellerKakaoId를 제공하므로 카카오 ID로 비교 (우선)
  // 백엔드 내부 ID로도 비교 (혹시 모를 경우 대비)
  const isMyProductByKakaoId = userId && sellerKakaoId && compareIds(sellerKakaoId, userId);
  const isMyProductByBackendId = userId && sellerBackendId && compareIds(sellerBackendId, userId);
  const isMyProductByRawSellerId = userId && rawSellerId && compareIds(rawSellerId, userId);
  
  // 카카오 ID 비교를 우선하고, 없으면 다른 방법으로 확인
  const isMyProduct = isMyProductByKakaoId || isMyProductByBackendId || isMyProductByRawSellerId;
  
  // 디버깅용 (개발 환경에서만)
  if (process.env.NODE_ENV === "development" && p) {
    console.log("[내 상품 확인]", {
      userId,
      sellerKakaoId,
      sellerBackendId,
      rawSellerId,
      userIdType: typeof userId,
      sellerKakaoIdType: typeof sellerKakaoId,
      sellerBackendIdType: typeof sellerBackendId,
      rawSellerIdType: typeof rawSellerId,
      isMyProductByKakaoId,
      isMyProductByBackendId,
      isMyProductByRawSellerId,
      isMyProduct,
      fullSeller: p?.seller,
    });
  }

  // ====== 상태 변경 ======
  const [statusChanging, setStatusChanging] = useState(false);
  const handleStatusChange = useCallback(async (newStatus) => {
    if (!p || statusChanging) return;
    
    if (!window.confirm(`상품 상태를 "${newStatus === 'ON_SALE' ? '판매중' : newStatus === 'RESERVED' ? '예약중' : '판매완료'}"으로 변경하시겠어요?`)) {
      return;
    }

    setStatusChanging(true);
    try {
      // PUT /api/products/{id} - status 포함
      const res = await fetch(`${API_BASE}/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: p.title,
          description: p.description,
          price: p.price,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "상태 변경 실패");
      }

      const updated = await res.json();
      // 상품 정보 업데이트
      setP((prev) => ({
        ...prev,
        status: updated.status || newStatus,
      }));
      
      alert("상품 상태가 변경되었습니다.");
      // 상태 변경 이벤트 발생 (마이페이지 목록 갱신용)
      window.dispatchEvent(new CustomEvent('productStatusUpdated'));
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[상태 변경 실패]:", e);
      }
      alert("상품 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setStatusChanging(false);
    }
  }, [p, statusChanging]);

  // ====== 바텀시트: 수정 / 삭제 ======
  const handleEditPost = () => {
    if (!p) return;
    setIsMenuOpen(false);
    nav(`/product/${p.id}/edit`);
  };

  const handleDeletePost = async () => {
    if (!p) return;
    if (!window.confirm("정말 이 상품을 삭제하시겠어요?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/${p.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (process.env.NODE_ENV === "development") {
        console.log("[삭제] 응답 상태:", res.status, res.statusText);
      }
      
      if (!res.ok) {
        let errorMessage = "삭제 실패";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch {
          // 에러 본문 읽기 실패 시 기본 메시지 사용
        }
        throw new Error(errorMessage);
      }
      
      // 204 No Content 또는 200 OK 모두 성공으로 처리
      alert("상품이 삭제되었습니다.");
      setIsMenuOpen(false);
      // 상품 삭제 이벤트 발생 (마이페이지 목록 갱신용)
      window.dispatchEvent(new CustomEvent('productDeleted', { detail: { productId: p.id } }));
      nav("/home");
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[삭제 실패]:", e);
      }
      alert(e.message || "상품 삭제 중 오류가 발생했습니다.");
      setIsMenuOpen(false);
    }
  };

  // 🔹 여기서부터 로딩 UI
  if (loading) {
    return (
      <div className="ss-loading">
        <div className="ss-loading-inner">
          <img
            src={loaderImg}
            alt="로딩중"
            className="ss-loading-img"
          />
          <div className="ss-loading-text">로딩중...</div>
        </div>
      </div>
    );
  }

  if (!p) return <div>상품이 없어요.</div>;

  return (
    <div className="ss-wrap">
      <Header onBack={() => nav(-1)} onSearch={() => nav("/search")} />

      {/* 이미지 + 상태 스티커 */}
      <div
        ref={heroRef}
        className="ss-hero"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {main ? (
          <>
            <img
              className={`ss-hero__img ${
                isReserved || isSoldOut ? "ss-img-gray" : ""
              }`}
              src={main}
              alt={p.title ?? "상품"}
              draggable={false}
              onClick={() => setIsImageModalOpen(true)}
            />

            {isReserved && (
              <img
                className="ss-status-sticker"
                src={stickerReserved}
                alt="예약중"
              />
            )}
            {isSoldOut && (
              <img
                className="ss-status-sticker"
                src={stickerSoldout}
                alt="판매완료"
              />
            )}
          </>
        ) : (
          <div className="ss-hero__fallback">이미지가 없어요</div>
        )}

        {p.images?.length > 1 && (
          <>
            <button
              type="button"
              className="ss-hero__nav ss-hero__nav--left"
              onClick={goPrev}
              disabled={idx === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className="ss-hero__nav ss-hero__nav--right"
              onClick={goNext}
              disabled={idx === p.images.length - 1}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 본문 내용 */}
      <div className="ss-body">
        <div className="ss-meta">
          <div className="ss-cat">{p.category?.name || "기타"}</div>
          <button className="ss-icon-btn" onClick={() => setIsMenuOpen(true)}>
            <DotsIcon />
          </button>
        </div>

        <h1 className="ss-title">{p.title}</h1>
        <div className="ss-price">{KRW(p.price)}</div>

        <hr className="ss-sep" />

        {/* 판매자 정보 + 매너온도 */}
        <div className="ss-seller">
          <img
            className="ss-avatar"
            src={p.seller.profile_image_url || DEFAULT_AVATAR_DATA}
            alt=""
          />
          <div className="ss-seller__info">
            <div className="ss-seller__top">
              <span className="ss-seller__name">{p.seller.nickname}</span>

              <div className="ss-temp">
                <span className="ss-temp__value">
                  {mannerTemp.toFixed(1)}
                  <span className="ss-temp__unit">°C</span>
                </span>
              </div>
            </div>

            <div className="ss-temp__bar">
              <div
                className={`ss-temp__bar-fill ss-temp__bar-fill--${tempLevel}`}
                style={{ width: `${mannerTemp}%` }}
              />
            </div>
          </div>
        </div>

        <p className="ss-desc">{p.description}</p>

        {/* CTA 영역 */}
        <footer className="ss-footer">
          <div className="ss-stickers-row">
            <img className="ss-sticker-bear" src={bearImg} alt="" />
            <img className="ss-sticker-bubble" src={bubbleImg} alt="" />
          </div>

          <div className="ss-footer-main">
            <button
              className="ss-cta"
              onClick={startChat}
              disabled={isSoldOut}
            >
              1:1 문의하기
            </button>

            <button
              className={`ss-like ${isWish ? "is-on" : ""}`}
              onClick={toggleWish}
              disabled={wishLoading}
              type="button"
              aria-label="찜하기"
            >
              <HeartIcon filled={isWish} />
              {wishCount > 0 && (
                <span className="ss-like__count">{wishCount}</span>
              )}
            </button>
          </div>
        </footer>
      </div>

      <BottomNav />

      {/* 바텀시트 */}
      {isMenuOpen && (
        <div className="ss-sheet-backdrop" onClick={() => setIsMenuOpen(false)}>
          <div className="ss-sheet" onClick={(e) => e.stopPropagation()}>
            {isMyProduct ? (
              <>
                <div className="ss-sheet__panel">
                  <div style={{ padding: "12px 16px", fontSize: "14px", color: "#666", borderBottom: "1px solid #eee" }}>
                    상품 상태 변경
                  </div>
                  {p.status !== "ON_SALE" && (
                    <button 
                      className="ss-sheet__btn" 
                      onClick={() => {
                        handleStatusChange("ON_SALE");
                        setIsMenuOpen(false);
                      }}
                      disabled={statusChanging}
                    >
                      판매중으로 변경
                    </button>
                  )}
                  {p.status !== "RESERVED" && (
                    <button 
                      className="ss-sheet__btn" 
                      onClick={() => {
                        handleStatusChange("RESERVED");
                        setIsMenuOpen(false);
                      }}
                      disabled={statusChanging}
                    >
                      예약중으로 변경
                    </button>
                  )}
                  {p.status !== "SOLD_OUT" && (
                    <button 
                      className="ss-sheet__btn" 
                      onClick={() => {
                        handleStatusChange("SOLD_OUT");
                        setIsMenuOpen(false);
                      }}
                      disabled={statusChanging}
                    >
                      판매완료로 변경
                    </button>
                  )}
                </div>
                <div className="ss-sheet__panel">
                  <button className="ss-sheet__btn" onClick={handleEditPost}>
                    글 수정
                  </button>
                  <button
                    className="ss-sheet__btn ss-sheet__btn--danger"
                    onClick={handleDeletePost}
                  >
                    상품 삭제하기
                  </button>
                </div>
              </>
            ) : (
              <div className="ss-sheet__panel">
                <div style={{ padding: "12px 16px", fontSize: "14px", color: "#999", textAlign: "center" }}>
                  내 상품이 아닙니다
                </div>
              </div>
            )}
            <div className="ss-sheet__panel">
              <button
                className="ss-sheet__btn"
                onClick={() => setIsMenuOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 크게 보기 모달 */}
      {isImageModalOpen && (
        <div
          className="ss-image-modal-backdrop"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="ss-image-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ss-image-modal__close"
              onClick={() => setIsImageModalOpen(false)}
            >
              ✕
            </button>

            {main && (
              <img
                src={main}
                alt={p.title ?? "상품 크게 보기"}
                className="ss-image-modal__img"
              />
            )}

            {p.images?.length > 1 && (
              <div className="ss-image-modal__nav">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={idx === 0}
                  className="ss-image-modal__nav-btn"
                >
                  ‹
                </button>
                <span className="ss-image-modal__index">
                  {idx + 1} / {p.images.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={idx === p.images.length - 1}
                  className="ss-image-modal__nav-btn"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 상단 헤더 ===== */
function Header({ onBack, onSearch }) {
  return (
    <header className="ss-appbar">
      <button className="ss-icon-btn" onClick={onBack}>
        <img src={backIcon} alt="뒤로가기" className="ss-icon-img" />
      </button>

      <img src={logo} alt="logo" className="ss-logo-img" />

      <button className="ss-icon-btn" onClick={onSearch}>
        <img src={searchIcon} alt="검색" className="ss-icon-img" />
      </button>
    </header>
  );
}

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

/* 하트 SVG */
function HeartIcon({ filled }) {
  return filled ? (
    <svg
      className="ss-heart-icon-svg ss-heart-icon-svg--filled"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ) : (
    <svg
      className="ss-heart-icon-svg ss-heart-icon-svg--empty"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
