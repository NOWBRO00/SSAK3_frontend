// src/components/MainPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";

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
import { buildImageUrl } from "../lib/products";
import { api } from "../lib/api";

// Mock 데이터 제거됨

/* 사용자 ID 가져오기 (카카오 로그인) */
const getUserId = () => {
  try {
    const profileStr = localStorage.getItem("ssak3.profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.id;
    }
  } catch (e) {
    // 프로필 파싱 실패 (조용히 처리)
  }
  return null;
};

/* ========================================================= */
/* 메인 페이지 */
/* ========================================================= */

export default function MainPage() {
  const nav = useNavigate();

  // ✅ 로그인한 유저 이름 가져오기 (카카오 로그인)
  const getUserName = () => {
    try {
      const profileStr = localStorage.getItem("ssak3.profile");
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        return profile.nickname || "사용자";
      }
    } catch (e) {
      // 프로필 파싱 실패 (조용히 처리)
    }
    return "사용자";
  };
  const userName = getUserName();

  // ✅ 카테고리: CategoryPage와 동일한 코드 사용
  const categories = [
    { id: "books", label: "도서 / 문구", icon: iconBook },
    { id: "clothes", label: "의류", icon: iconCloth },
    { id: "appliances", label: "가전 / 주방", icon: iconKitchen },
    { id: "helper", label: "도우미 / 기타", icon: iconEtc },
  ];

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
      const rawList = await api("/api/products");

      // 필요하면 앞에서 몇 개만 사용
      const slice = Array.isArray(rawList) ? rawList.slice(0, 10) : [];

      const mapped = slice.map((raw) => ({
        id: raw.id,
        category: raw.categoryName ?? "", // "의류", "도서/문구", ...
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
      const likes = await api(`/api/likes/user/${userId}`);

      const mapped = (likes || []).map((raw) => ({
        id: raw.productId,
        // 카테고리 정보는 이 응답에 없으므로 비워두거나 "찜한 상품" 등으로 표기 가능
        category: "",
        title: raw.title,
        price: raw.price,
        liked: true,
        // 상태 정보도 없으므로 기본값 ON_SALE로 둠
        status: "ON_SALE",
        img: buildImageUrl(raw.imageUrl),
      }));

      setLikedList(mapped);
    } catch (e) {
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

  const toggleLikeRecommended = (id) => {
    setRecommended((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

  const toggleLikeLiked = (id) => {
    setLikedList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

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
