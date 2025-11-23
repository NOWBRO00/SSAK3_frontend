// src/components/MainPage.jsx
import React, { useState } from "react";
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

/* ========================================================= */
/* 메인 페이지 */
/* ========================================================= */

export default function MainPage() {
  const nav = useNavigate();
  const userName = "주예원";

  const categories = [
    { id: "book", label: "도서 / 문구", icon: iconBook },
    { id: "cloth", label: "의류", icon: iconCloth },
    { id: "kitchen", label: "가전 / 주방", icon: iconKitchen },
    { id: "etc", label: "도우미 / 기타", icon: iconEtc },
  ];

  // ✅ status: "판매중" | "예약중" | "판매완료"
  const [recommended, setRecommended] = useState([
    {
      id: 101,
      category: "의류",
      title: "봄 간절기 바람막이",
      price: 52800,
      liked: false,
      status: "판매중",
      img: "https://picsum.photos/300?10",
    },
  ]);

  const [likedList, setLikedList] = useState([
    {
      id: 201,
      category: "가전 / 주방",
      title: "소형 전자레인지",
      price: 35000,
      liked: true,
      status: "예약중",
      img: "https://picsum.photos/300?20",
    },
  ]);

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

          <div className="home-product-row">
            {recommended.map((p) => (
              <ProductCard
                key={p.id}
                data={p}
                toggleLike={() => toggleLikeRecommended(p.id)}
                onCardClick={() => nav(`/product/${p.id}`)}
              />
            ))}
          </div>
        </section>

        <hr className="home-divider" />

        {/* 찜 목록 */}
        <section className="home-section">
          <h2 className="home-section-title">{userName} 님의 찜 목록!</h2>
          <p className="home-subcopy">
            찜했던 그거! ⏰ 놓치기 아깝잖아요?
          </p>

          <div className="home-product-row">
            {likedList.map((p) => (
              <ProductCard
                key={p.id}
                data={p}
                toggleLike={() => toggleLikeLiked(p.id)}
                onCardClick={() => nav(`/product/${p.id}`)}
              />
            ))}
          </div>
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

  return (
    <article className="home-card" onClick={onCardClick}>
      <div className="home-card-thumb">
        {/* 썸네일 */}
        <img
          src={img}
          alt={title}
          className={
            status === "예약중" || status === "판매완료"
              ? "home-thumb-img gray"
              : "home-thumb-img"
          }
        />

        {/* 상태 스티커 */}
        {status === "예약중" && (
          <img
            className="home-status-sticker"
            src={stickerReserved}
            alt="예약중"
          />
        )}
        {status === "판매완료" && (
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
