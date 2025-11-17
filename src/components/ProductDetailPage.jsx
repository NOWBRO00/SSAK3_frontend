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

// ⬇️ 스티커/로고 이미지 (파일명만 맞춰서 써줘)
import bearImg from "../image/image.png";        // 곰돌이
import bubbleImg from "../image/image2.png";     // 말풍선
import logo from "../image/Group 23.png";        // 상단 로고

// ⬇️ 상단 아이콘(뒤로가기, 검색) – 네가 준비한 파일명으로 변경해서 사용
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

  // ── Swipe state
  const heroRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const main = useMemo(() => p?.images?.[idx] ?? "", [p, idx]);

  // 더미 데이터 로드(백엔드 없이 UI 확인용)
  const load = useCallback(async () => {
    setLoading(true);
    setP({
      id: Number(id) || 1,
      title: "oo H 브랜드 자전거 판매 합니다",
      description:
        "산 이후로 몇 번 탔던 건데 5,000,000원에 가져가세요\n가격 네고 가능함\n○○ 근처 편의점에서 직거래 우대합니다a\na\na\na\na\na\na\na\na\na\nasdfghhkjasdglhfkusdgh",
      price: 5000000,
      status: "ON_SALE",
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
        mannerTemperature: 55.7,
      },
      isWishlisted: false,
      wishCount: 0,
      created_at: new Date().toISOString(),
    });
    setIsWish(false);
    setWishCount(0);
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

  // ── Touch swipe
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

  // Desktop drag
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

  // 키보드 화살표 지원
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const toggleWish = useCallback(async () => {
    if (!p || wishLoading) return;
    setWishLoading(true);
    const next = !isWish;
    setIsWish(next);
    setWishCount((c) => c + (next ? 1 : -1));
    try {
      const r = await fetch(`/api/products/${p.id}/wishlist`, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error("fail");
    } catch {
      // 롤백
      setIsWish((v) => !v);
      setWishCount((c) => c + (next ? -1 : 1));
      alert("찜에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setWishLoading(false);
    }
  }, [p, isWish, wishLoading]);

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
      alert("채팅을 시작하지 못했어요.");
    }
  }, [p, nav]);

  // 매너온도
  const rawManner = p?.seller?.mannerTemperature;
  const mannerTemp =
    typeof rawManner === "number"
      ? Math.max(0, Math.min(100, rawManner))
      : null;
  const tempLevel =
    mannerTemp == null
      ? null
      : mannerTemp < 30
      ? "low"
      : mannerTemp < 60
      ? "mid"
      : "high";

  // 바텀시트 메뉴 동작
  const handleEditPost = () => {
    alert("글 수정 기능은 아직 연결되지 않았습니다.");
    setIsMenuOpen(false);
  };

  const handleDeletePost = () => {
    const ok = window.confirm("상품을 삭제하시겠어요?");
    if (!ok) return;
    alert("삭제 기능은 아직 연결되지 않았습니다.");
    setIsMenuOpen(false);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="ss-wrap">
        <Header onBack={() => nav(-1)} />
        <div className="ss-skel ss-skel--img" />
        <div className="ss-skel ss-skel--title" />
        <div className="ss-skel ss-skel--text" />
        <div className="ss-skel ss-skel--text" />
        <FooterSkeleton />
        <BottomNav />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="ss-wrap">
        <Header onBack={() => nav(-1)} />
        <div className="ss-error">
          상품이 없어요.
          <button className="ss-btn" onClick={load}>
            다시 시도
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="ss-wrap">
      <Header onBack={() => nav(-1)} />

      {/* 이미지 영역 (스와이프 + 화살표) */}
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
          <img
            className="ss-hero__img"
            src={main}
            alt={p.title ?? "상품"}
            draggable={false}
          />
        ) : (
          <div className="ss-hero__fallback">이미지가 없어요</div>
        )}

        {p.images?.length > 1 && (
          <>
            <button
              type="button"
              className="ss-hero__nav ss-hero__nav--left"
              onClick={goPrev}
              aria-label="이전 이미지"
              disabled={idx === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className="ss-hero__nav ss-hero__nav--right"
              onClick={goNext}
              aria-label="다음 이미지"
              disabled={idx === (p.images?.length ?? 1) - 1}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 본문 + CTA */}
      <div className="ss-body">
        <div className="ss-meta">
          <div className="ss-cat">{p.category?.name || "기타"}</div>
          <button
            className="ss-icon-btn"
            aria-label="메뉴"
            onClick={() => setIsMenuOpen(true)}
          >
            <DotsIcon />
          </button>
        </div>

        <h1 className="ss-title">{p.title}</h1>

        {/* 가격 */}
        <div className="ss-price">{KRW(p.price)}</div>

        <hr className="ss-sep" />

        {/* 판매자 + 매너온도 */}
        <div className="ss-seller">
          <img
            className="ss-avatar"
            src={p.seller?.profile_image_url || DEFAULT_AVATAR_DATA}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR_DATA;
            }}
            alt=""
          />
          <div className="ss-seller__info">
            <div className="ss-seller__top">
              <span className="ss-seller__name">
                {p.seller?.nickname || "닉네임"}
              </span>
              {mannerTemp != null && (
                <div className="ss-temp">
                  <span className="ss-temp__value">
                    {mannerTemp.toFixed(1)}
                    <span className="ss-temp__unit">°C</span>
                  </span>
                </div>
              )}
            </div>
            {mannerTemp != null && (
              <div className="ss-temp__bar">
                <div
                  className={
                    "ss-temp__bar-fill" +
                    (tempLevel ? ` ss-temp__bar-fill--${tempLevel}` : "")
                  }
                  style={{ width: `${mannerTemp}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <p className="ss-desc">{p.description}</p>

        {/* CTA: 곰돌이 + 말풍선 + 버튼 */}
        <footer className="ss-footer">
          <div className="ss-stickers-row" aria-hidden>
            <img className="ss-sticker-bear" src={bearImg} alt="" />
            <img className="ss-sticker-bubble" src={bubbleImg} alt="" />
          </div>

          <div className="ss-footer-main">
            <button
              className="ss-cta"
              onClick={startChat}
              disabled={p.status === "SOLD_OUT" || p.status === "판매완료"}
            >
              1:1 문의하기
            </button>
            <button
              className={`ss-like ${isWish ? "is-on" : ""}`}
              onClick={toggleWish}
              aria-pressed={isWish}
              disabled={wishLoading}
              title="찜"
            >
              {isWish ? "♥" : "♡"}
              <span className="ss-like__count">{wishCount}</span>
            </button>
          </div>
        </footer>
      </div>

      {/* 네비게이션 바 자리 확보 + 실제 네비게이션 */}
      <div style={{ height: 0 }} />
      <BottomNav />

      {/* 바텀시트: 글 수정 / 상품 삭제 / 닫기 */}
      {isMenuOpen && (
        <div className="ss-sheet-backdrop" onClick={handleCloseMenu}>
          <div className="ss-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ss-sheet__panel">
              <button
                type="button"
                className="ss-sheet__btn"
                onClick={handleEditPost}
              >
                글 수정
              </button>
              <button
                type="button"
                className="ss-sheet__btn ss-sheet__btn--danger"
                onClick={handleDeletePost}
              >
                상품 삭제하기
              </button>
            </div>
            <div className="ss-sheet__panel">
              <button
                type="button"
                className="ss-sheet__btn"
                onClick={handleCloseMenu}
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

/* ===== 상단 헤더 컴포넌트 ===== */
function Header({ onBack }) {
  return (
    <header className="ss-appbar">
      <button className="ss-icon-btn" aria-label="뒤로가기" onClick={onBack}>
        <img src={backIcon} alt="뒤로가기" className="ss-icon-img" />
      </button>

      <img src={logo} alt="ssaksseuri logo" className="ss-logo-img" />

      <button className="ss-icon-btn" aria-label="검색">
        <img src={searchIcon} alt="검색" className="ss-icon-img" />
      </button>
    </header>
  );
}

function FooterSkeleton() {
  return <div className="ss-footer ss-footer--skel" />;
}

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
