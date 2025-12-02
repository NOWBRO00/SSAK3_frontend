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


// Mock 데이터 제거됨

// 🔹 로딩 이미지
import loaderImg from "../image/loader.png";

// ====== 백엔드 연동용 기본 설정 ======
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

// 🔹 mock(status: "판매중" | "예약중" | "판매완료") → 내부 enum
const mapStatusFromKorean = (status) => {
  switch (status) {
    case "판매중":
      return "ON_SALE";
    case "예약중":
      return "RESERVED";
    case "판매완료":
      return "SOLD_OUT";
    default:
      return "ON_SALE";
  }
};

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
    if (!id) return;
    setLoading(true);

    try {
      // 1) 백엔드 시도
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      if (!res.ok) throw new Error("상품 조회 실패");
      const raw = await res.json();

      const images = Array.isArray(raw.imageUrls)
        ? raw.imageUrls.map((path) =>
            path?.startsWith("http")
              ? path
              : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
          )
        : [];

      const mapped = {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        price: raw.price,
        status: raw.status, // ON_SALE | RESERVED | SOLD_OUT
        category: { name: raw.categoryName || "기타" },
        images,
        seller: {
          id: raw.sellerId,
          nickname: raw.sellerNickname || "익명",
          profile_image_url:
            raw.profileImageUrl || raw.profile_image_url || "",
          mannerTemperature:
            raw.mannerTemperature !== undefined
              ? raw.mannerTemperature
              : DEFAULT_MANNER_TEMP,
        },
        isWishlisted: !!raw.isWishlisted,
        wishCount: raw.likeCount ?? 0,
        created_at: raw.createdAt,
      };

      setP(mapped);
      setIsWish(mapped.isWishlisted);
      setWishCount(mapped.wishCount);
      setIdx(0);
    } catch (e) {
      // 상품 조회 실패
      setP(null);
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
      const res = await fetch(`${API_BASE}/api/likes`, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: userId,
          productId: p.id,
        }),
      });
      if (!res.ok) throw new Error("찜 실패");
    } catch (e) {
      console.error(e);
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
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      const res = await fetch(`${API_BASE}/api/chatrooms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          buyerId: userId,
        }),
      });
      if (!res.ok) throw new Error("chat fail");
      const data = await res.json();
      const roomId = data.roomId ?? data.id;
      if (roomId) nav(`/chat/${roomId}`);
      else nav("/chat");
    } catch (e) {
      console.error(e);
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
        credentials: "include",
      });
      if (!res.ok) throw new Error("삭제 실패");
      alert("상품이 삭제되었습니다.");
      setIsMenuOpen(false);
      nav("/");
    } catch (e) {
      console.error(e);
      alert("상품 삭제 중 오류가 발생했습니다.");
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
