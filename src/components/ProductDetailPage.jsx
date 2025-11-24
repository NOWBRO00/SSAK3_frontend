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

// 기존 이미지들
import bearImg from "../image/image.png";
import bubbleImg from "../image/image2.png";
import logo from "../image/Group 23.png";

// 상단 아이콘
import backIcon from "../image/vector-33.png";
import searchIcon from "../image/icon-search.png";

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

  // swipe state
  const heroRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const main = useMemo(() => p?.images?.[idx] ?? "", [p, idx]);

  // 더미 데이터 로드 (백엔드 연동 전)
  const load = useCallback(async () => {
    setLoading(true);

    const data = {
      id: Number(id) || 1,
      title: "oo H 브랜드 자전거 판매 합니다",
      description:
        "산 이후로 몇 번 탔던 건데 5,000,000원에 가져가세요\n가격 네고 가능함\n○○ 근처 편의점에서 직거래 우대합니다",
      price: 5000000,
      // 🔸 실제 백엔드 enum 과 맞춘 상태값
      status: "RESERVED", // ON_SALE | RESERVED | SOLD_OUT
      category: { name: "가전 / 주방" },
      images: [
        "https://picsum.photos/800/800?1",
        "https://picsum.photos/800/800?2",
        "https://picsum.photos/800/800?3",
      ],
      seller: {
        id: 12,
        nickname: "닉네임12345",
        profile_image_url: "",
        mannerTemperature: DEFAULT_MANNER_TEMP,
      },
      isWishlisted: false,
      wishCount: 0,
      created_at: new Date().toISOString(),
    };

    setP(data);
    setIsWish(!!data.isWishlisted);
    setWishCount(data.wishCount ?? 0);
    setIdx(0);
    setLoading(false);
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

  // touch swipe
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

  // mouse drag
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

  // 찜 토글 (낙관적 업데이트)
  const toggleWish = useCallback(async () => {
    if (!p || wishLoading) return;
    setWishLoading(true);
    const next = !isWish;

    // TODO: 실제 로그인 연동 후 userId 주입
    const userId = 1;
    const url = `/api/likes/${userId}/${p.id}`;

    // optimistic
    setIsWish(next);
    setWishCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const r = await fetch(url, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("fail");
    } catch {
      // 롤백
      setIsWish((v) => !v);
      setWishCount((c) => Math.max(0, c + (next ? -1 : 1)));
      alert("찜에 실패했어요.");
    } finally {
      setWishLoading(false);
    }
  }, [p, isWish, wishLoading]);

  // 1:1 문의 (채팅방 생성 후 이동) – 실제 Chat API 명세 나오면 맞춰서 수정
  const startChat = useCallback(async () => {
    if (!p) return;
    try {
      const r = await fetch(`/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: p.id }),
      });
      if (!r.ok) throw new Error("chat fail");
      const d = await r.json();
      nav(d?.id ? `/chat/${d.id}` : "/chat");
    } catch {
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

  // 바텀시트 (지금은 껍데기만)
  const handleEditPost = () => setIsMenuOpen(false);
  const handleDeletePost = () => setIsMenuOpen(false);

  if (loading) return <div>Loading...</div>;
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
            />

            {/* 상태 스티커 - 중앙, 애니메이션 */}
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

        {/* 좌우 버튼 */}
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

            {/* 찜 버튼 */}
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
