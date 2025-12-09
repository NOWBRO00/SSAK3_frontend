// src/components/MainPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";
import { BASE_URL } from "../lib/api";

// 상단 로고
import logoImg from "../image/Group 23.png";

// 배너 & 카테고리 아이콘
import bannerImg from "../image/main-banner.png";
import iconBook from "../image/category-book.png";
import iconCloth from "../image/category-cloth.png";
import iconKitchen from "../image/category-kitchen.png";
import iconEtc from "../image/category-etc.png";

// 상단 아이콘
import iconBack from "../image/vector-33.png";
import iconSearch from "../image/icon-search.png";

// 상태 스티커 이미지
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

import BottomNav from "./BottomNav";

// 🔹 공통 유틸
import { buildImageUrl, getCategories, CATEGORY_INFO, formatCategoryName } from "../lib/products";
import { api } from "../lib/api";

// Mock 데이터 제거됨

// ✅ 공통 인증 유틸리티 사용
import { getUserId, getUserProfile } from "../utils/auth";

/* ========================================================= */
/* 메인 페이지 */
/* ========================================================= */

// 백엔드 카테고리 이름 -> 프론트 코드 매핑
const BACKEND_CATEGORY_MAP = {
  "의류": "clothes",
  "도서": "books",
  "도서 / 문구": "books",
  "전자제품": "appliances",
  "가전 / 주방": "appliances",
  "가구": "helper",
  "도우미 / 기타": "helper",
};

// 프론트 코드 -> 아이콘 매핑
const CATEGORY_ICON_MAP = {
  clothes: iconCloth,
  books: iconBook,
  appliances: iconKitchen,
  helper: iconEtc,
};

export default function MainPage() {
  const nav = useNavigate();

  // ✅ 로그인한 유저 이름 가져오기 (카카오 로그인)
  const profile = getUserProfile();
  const userName = profile?.nickname || "사용자";

  // ✅ 카테고리: 백엔드에서 동적으로 가져오기
  const [categories, setCategories] = useState([
    { id: "books", label: "도서 / 문구", icon: iconBook },
    { id: "clothes", label: "의류", icon: iconCloth },
    { id: "appliances", label: "가전 / 주방", icon: iconKitchen },
    { id: "helper", label: "도우미 / 기타", icon: iconEtc },
  ]);

  // 백엔드에서 카테고리 목록 가져오기
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const backendCategories = await getCategories();
        
        if (backendCategories.length > 0) {
          // 백엔드 카테고리를 프론트엔드 형식으로 변환
          const mappedCategories = backendCategories
            .map((cat) => {
              const backendName = cat.name || "";
              const frontendCode = BACKEND_CATEGORY_MAP[backendName];
              
              if (frontendCode && CATEGORY_INFO[frontendCode]) {
                return {
                  id: frontendCode,
                  label: CATEGORY_INFO[frontendCode].label,
                  icon: CATEGORY_ICON_MAP[frontendCode],
                  backendId: cat.id,
                  backendName: backendName,
                };
              }
              return null;
            })
            .filter(Boolean); // null 제거
          
          if (mappedCategories.length > 0) {
            setCategories(mappedCategories);
            if (process.env.NODE_ENV === "development") {
              console.log("[메인 페이지] 카테고리 목록 로드 성공:", mappedCategories);
            }
          }
        }
      } catch (e) {
        console.error("[메인 페이지] 카테고리 목록 로드 실패:", e);
        // 실패 시 기본 카테고리 사용
      }
    };
    
    loadCategories();
  }, []);

  // ✅ 추천 / 찜 목록
  const [recommended, setRecommended] = useState([]);
  const [likedList, setLikedList] = useState([]);

  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingLiked, setLoadingLiked] = useState(true);

  /** 🔥 추천 상품 로드 (백엔드 /api/products + mock fallback) */
  const loadRecommended = useCallback(async () => {
    setLoadingRecommended(true);

    try {
      // GET /api/products  → 전체 상품 목록
      if (process.env.NODE_ENV === "development") {
        console.log("[메인] 추천 상품 조회 시작: GET /api/products");
      }
      
      const rawList = await api("/api/products");
      
      if (process.env.NODE_ENV === "development") {
        console.log("[메인] 추천 상품 조회 성공:", rawList?.length || 0, "개");
      }

      // 필요하면 앞에서 몇 개만 사용
      const slice = Array.isArray(rawList) ? rawList.slice(0, 10) : [];

      const mapped = slice.map((raw) => ({
        id: raw.id,
        category: formatCategoryName(raw.categoryName || raw.category?.name || ""), // 필터 검색과 동일한 표시 이름
        title: raw.title,
        price: raw.price,
        liked: !!raw.isWishlisted,
        status: raw.status || "ON_SALE", // ON_SALE / RESERVED / SOLD_OUT
        img: Array.isArray(raw.imageUrls)
          ? buildImageUrl(raw.imageUrls[0])
          : "",
      }));

      setRecommended(mapped);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[메인] 추천 상품 조회 실패:", e);
      }
      // 백엔드 실패 시 빈 배열로 표시
      setRecommended([]);
    } finally {
      setLoadingRecommended(false);
    }
  }, []);

  /** 🔥 찜 목록 로드 (백엔드 /api/likes/user/{userId} + mock fallback) */
  const loadLikedList = useCallback(async () => {
    setLoadingLiked(true);

    try {
      // GET /api/likes/user/{userId}
      // 응답: [{ productId, title, price, imageUrl }]
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log("[메인] 찜 목록 조회 시작: GET /api/likes/user/" + userId);
      }
      
      const likes = await api(`/api/likes/user/${userId}`);
      
      if (process.env.NODE_ENV === "development") {
        console.log("[메인] 찜 목록 조회 성공:", likes?.length || 0, "개");
      }

      // API 응답 형식: [{id, user, product, ...}] 또는 [{productId, title, price, imageUrl, ...}]
      const mapped = (likes || []).map((raw) => {
        // 백엔드 응답 형식에 따라 product 객체가 있을 수도 있고 없을 수도 있음
        const product = raw.product || raw;
        const productId = product.id || raw.productId || raw.id;
        const title = product.title || raw.title || "";
        const price = product.price != null ? product.price : (raw.price != null ? raw.price : 0);
        const imageUrl = product.imageUrls?.[0] || product.imageUrl || raw.imageUrl || "";
        const categoryName = product.categoryName || product.category?.name || raw.categoryName || "";
        
        return {
          id: productId,
          category: formatCategoryName(categoryName), // 필터 검색과 동일한 표시 이름
          title: title,
          price: price,
          liked: true,
          status: product.status || raw.status || "ON_SALE",
          img: buildImageUrl(imageUrl),
        };
      });

      setLikedList(mapped);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[메인] 찜 목록 조회 실패:", e);
      }
      // 백엔드 실패 시 빈 배열로 표시
      setLikedList([]);
    } finally {
      setLoadingLiked(false);
    }
  }, []);

  useEffect(() => {
    loadRecommended();
    loadLikedList();
  }, [loadRecommended, loadLikedList]);

  // 찜 목록이 로드되면 추천 상품의 찜 상태 업데이트
  useEffect(() => {
    if (likedList.length > 0) {
      const likedProductIds = new Set(likedList.map((p) => p.id));
      setRecommended((prev) =>
        prev.map((p) => ({
          ...p,
          liked: likedProductIds.has(p.id),
        }))
      );
    }
  }, [likedList]);

  // ✅ 찜 토글 (추천 상품) - API 요청 포함
  const toggleLikeRecommended = useCallback(async (productId) => {
    const product = recommended.find((p) => p.id === productId);
    if (!product) return;
    
    const next = !product.liked;
    
    // Optimistic 업데이트
    setRecommended((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, liked: next } : p))
    );
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      
      const url = `${BASE_URL}/api/likes?userId=${userId}&productId=${productId}`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[메인 추천] 찜 ${next ? "추가" : "취소"}:`, url);
      }
      
      const res = await fetch(url, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("찜 실패");
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[메인 추천] 찜 ${next ? "추가" : "취소"} 성공`);
      }
      
      // 찜 추가 시 찜 목록 갱신
      if (next) {
        loadLikedList();
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[메인 추천] 찜 오류:", e);
      }
      // 롤백
      setRecommended((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, liked: !next } : p))
      );
      alert("찜에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }, [recommended, loadLikedList]);

  // ✅ 찜 토글 (찜 목록) - API 요청 포함
  const toggleLikeLiked = useCallback(async (productId) => {
    const product = likedList.find((p) => p.id === productId);
    if (!product) return;
    
    const next = !product.liked;
    
    // Optimistic 업데이트
    setLikedList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, liked: next } : p))
    );
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
      
      const url = `${BASE_URL}/api/likes?userId=${userId}&productId=${productId}`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[메인 찜목록] 찜 ${next ? "추가" : "취소"}:`, url);
      }
      
      const res = await fetch(url, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("찜 실패");
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[메인 찜목록] 찜 ${next ? "추가" : "취소"} 성공`);
      }
      
      // 찜 취소 시 목록에서 제거
      if (!next) {
        setLikedList((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[메인 찜목록] 찜 오류:", e);
      }
      // 롤백
      setLikedList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, liked: !next } : p))
      );
      alert("찜에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }, [likedList]);

  return (
    <div className="home-shell">
      <div className="home-frame">
        {/* 상단바 */}
        <header className="home-topbar">
          <button className="home-top-btn" onClick={() => nav(-1)}>
            <img src={iconBack} alt="back" className="top-icon" />
          </button>

          <img className="home-logo" src={logoImg} alt="logo" />

          <button className="home-top-btn" onClick={() => nav("/search")}>
            <img src={iconSearch} alt="search" className="top-icon" />
          </button>
        </header>

        {/* 배너 */}
        <section className="home-banner">
          <img className="home-banner-img" src={bannerImg} alt="banner" />
          <div className="home-banner-text">
            <p className="banner-line1">같은 학교,</p>
            <p className="banner-line2">
              <strong>믿음직한 쿨거래</strong>
            </p>
            <p className="banner-line3">
              전공책부터 <strong>꿀템</strong>까지 여기서 찾으쿼
            </p>
          </div>
        </section>

        {/* 카테고리 */}
        <section className="home-category-section">
          <div className="home-category-row">
            {categories.map((c) => (
              <button
                key={c.id}
                className="home-category-card"
                onClick={() => nav(`/category/${c.id}`)}
              >
                <div className="home-category-icon-wrap">
                  <img className="home-category-icon" src={c.icon} alt="" />
                </div>
                <span className="home-category-label">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 추천상품 */}
        <section className="home-section">
          <h2 className="home-section-title">
            {userName} 님 이런 상품은 어떠세요?
          </h2>

          {loadingRecommended ? (
            <p className="home-loading-text">추천 상품 불러오는 중...</p>
          ) : (
            <div className="home-product-row">
              {recommended.map((p) => (
                <ProductCard
                  key={p.id}
                  data={p}
                  toggleLike={() => toggleLikeRecommended(p.id)}
                  onCardClick={() => nav(`/product/${p.id}`)}
                />
              ))}
              {recommended.length === 0 && (
                <p className="home-empty-text">지금은 추천할 상품이 없어요.</p>
              )}
            </div>
          )}
        </section>

        <hr className="home-divider" />

        {/* 찜 목록 */}
        <section className="home-section">
          <h2 className="home-section-title">{userName} 님의 찜 목록!</h2>
          <p className="home-subcopy">
            찜했던 그거! ⏰ 놓치기 아깝잖아요?
          </p>

          {loadingLiked ? (
            <p className="home-loading-text">찜 목록 불러오는 중...</p>
          ) : (
            <div className="home-product-row">
              {likedList.map((p) => (
                <ProductCard
                  key={p.id}
                  data={p}
                  toggleLike={() => toggleLikeLiked(p.id)}
                  onCardClick={() => nav(`/product/${p.id}`)}
                />
              ))}
              {likedList.length === 0 && (
                <p className="home-empty-text">
                  아직 찜한 상품이 없어요. 마음에 드는 상품을 찜해보세요!
                </p>
              )}
            </div>
          )}
        </section>

        <div className="home-bottom-space" />
        <BottomNav />
      </div>
    </div>
  );
}

/* ========================================================= */
/* 상품 카드 컴포넌트 */
/* ========================================================= */

function ProductCard({ data, toggleLike, onCardClick }) {
  const { img, category, title, price, liked, status } = data;

  const isReserved = status === "RESERVED";
  const isSoldOut = status === "SOLD_OUT";

  return (
    <article className="home-card" onClick={onCardClick}>
      <div className="home-card-thumb">
        {/* 썸네일 */}
        <img
          src={img}
          alt={title}
          className={
            isReserved || isSoldOut ? "home-thumb-img gray" : "home-thumb-img"
          }
        />

        {/* 상태 스티커 */}
        {isReserved && (
          <img
            className="home-status-sticker"
            src={stickerReserved}
            alt="예약중"
          />
        )}
        {isSoldOut && (
          <img
            className="home-status-sticker"
            src={stickerSoldout}
            alt="판매완료"
          />
        )}

        {/* ❤️ 좋아요 */}
        <button
          className="home-heart-btn"
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭(상세 이동) 막기
            toggleLike();
          }}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      <div className="home-card-info">
        <div className="home-card-category">{category}</div>
        <div className="home-card-title">{title}</div>
        <div className="home-card-price">
          {price?.toLocaleString?.()}
          {price != null && <span> 원</span>}
        </div>
      </div>
    </article>
  );
}

/* ❤️ 하트 아이콘 */
function HeartIcon({ filled }) {
  return filled ? (
    <svg
      className="heart-icon-svg heart-icon-svg--filled"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="#ff4b4b"
      stroke="#ff4b4b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ) : (
    <svg
      className="heart-icon-svg heart-icon-svg--empty"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
