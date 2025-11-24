// src/pages/CategoryPage.jsx

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../image/Group 23.png";
import backIcon from "../image/vector-33.png";
import "../styles/CategoryPage.css";
import BottomNav from "./BottomNav";
import { MOCK_PRODUCTS } from "../data/mockProducts";

// 상태 스티커 이미지
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

const API_BASE = "http://localhost:8080";

/** 공통 카테고리 라벨 */
const CATEGORY_LABELS = {
  clothes: "의류",
  books: "도서 / 문구",
  appliances: "가전 / 주방",
  helper: "도우미 / 기타",
};

/** 영어 key / 한글 파라미터 모두 매핑 */
const CATEGORY_MAP = {
  clothes: CATEGORY_LABELS.clothes,
  books: CATEGORY_LABELS.books,
  appliances: CATEGORY_LABELS.appliances,
  helper: CATEGORY_LABELS.helper,

  [CATEGORY_LABELS.clothes]: CATEGORY_LABELS.clothes,
  [CATEGORY_LABELS.books]: CATEGORY_LABELS.books,
  [CATEGORY_LABELS.appliances]: CATEGORY_LABELS.appliances,
  [CATEGORY_LABELS.helper]: CATEGORY_LABELS.helper,
};

const FALLBACK_CATEGORY = CATEGORY_LABELS.clothes;

/** 한글 → 내부 enum 변환 */
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

export default function CategoryPage() {
  const nav = useNavigate();
  const { name } = useParams();

  /** URL 파라미터 → 카테고리 라벨 */
  const categoryName =
    CATEGORY_MAP[decodeURIComponent(name || FALLBACK_CATEGORY)] ||
    FALLBACK_CATEGORY;

  const [items, setItems] = useState([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");
  const [loading, setLoading] = useState(true);

  /** 🔥 백엔드 + mock fallback 로직 */
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/products?category=${encodeURIComponent(categoryName)}`
      );

      if (!res.ok) throw new Error("카테고리 상품 조회 실패");
      const rawList = await res.json();

      // 명세서 기준 매핑
      const mapped = rawList.map((raw) => ({
        id: raw.id,
        title: raw.title,
        price: raw.price,
        seller: raw.sellerNickname,
        likes: raw.likeCount ?? 0,
        liked: !!raw.isWishlisted,
        img: Array.isArray(raw.imageUrls)
          ? raw.imageUrls[0]?.startsWith("http")
            ? raw.imageUrls[0]
            : `${API_BASE}${raw.imageUrls[0]}`
          : "",
        status: raw.status, // ON_SALE / RESERVED / SOLD_OUT
      }));

      setItems(mapped);
    } catch (e) {
      console.warn("[백엔드 실패 → mock fallback]", e);

      const filtered = MOCK_PRODUCTS.filter(
        (p) => p.category === categoryName
      ).map((raw) => ({
        id: raw.id,
        title: raw.title,
        price: raw.price,
        seller: raw.seller.nickname,
        likes: raw.likes ?? 0,
        liked: !!raw.isWishlisted,
        img: raw.thumbnail,
        status: mapStatusFromKorean(raw.status),
      }));

      setItems(filtered);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    load();
  }, [load]);

  /** 정렬된 리스트 */
  const visibleItems = useMemo(() => {
    let list = [...items];

    if (sortType === "인기순") {
      list.sort((a, b) => b.likes - a.likes);
    } else if (sortType === "최신순") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortType === "거래 가능") {
      list = list.filter((p) => p.status === "ON_SALE");
    }

    return list;
  }, [items, sortType]);

  /** 찜 토글 */
  const toggleLike = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              liked: !it.liked,
              likes: it.liked ? it.likes - 1 : it.likes + 1,
            }
          : it
      )
    );
  };

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="cat-shell">
      <div className="cat-frame">
        {/* 상단바 */}
        <header className="cat-topbar">
          <button className="icon-btn" onClick={() => nav(-1)}>
            <img src={backIcon} alt="back" />
          </button>
          <img className="cat-logo" src={logo} alt="logo" />
          <button className="icon-btn" onClick={() => nav("/search")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7.5" stroke="#2b0c0b" strokeWidth="2" />
              <line
                x1="20"
                y1="20"
                x2="16.5"
                y2="16.5"
                stroke="#2b0c0b"
                strokeWidth="2"
              />
            </svg>
          </button>
        </header>

        {/* 브레드크럼 */}
        <div className="cat-breadcrumb">
          <span className="crumb">카테고리</span>
          <span className="chev">›</span>
          <span className="crumb bold">{categoryName}</span>
        </div>

        {/* 상품 개수 + 정렬 */}
        <div className="cat-list-header">
          <span className="count">상품 {visibleItems.length}</span>
          <button className="sort-btn" onClick={() => setSortOpen(true)}>
            {sortType}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="#2b0c0b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 리스트 */}
        <main className="cat-list">
          {visibleItems.map((p) => {
            const isReserved = p.status === "RESERVED";
            const isSoldOut = p.status === "SOLD_OUT";

            return (
              <article
                key={p.id}
                className="cat-card"
                onClick={() => nav(`/product/${p.id}`)}
              >
                {/* 썸네일 */}
                <div className="cat-thumb-wrap">
                  <img
                    className={isReserved || isSoldOut ? "thumb gray" : "thumb"}
                    src={p.img}
                    alt={p.title}
                  />

                  {isReserved && (
                    <img
                      className="cat-status-sticker"
                      src={stickerReserved}
                      alt="예약중"
                    />
                  )}

                  {isSoldOut && (
                    <img
                      className="cat-status-sticker"
                      src={stickerSoldout}
                      alt="판매완료"
                    />
                  )}
                </div>

                <div className="info">
                  <div className="category">{categoryName}</div>
                  <h3 className="title">{p.title}</h3>
                  <div className="price">{p.price.toLocaleString()}원</div>
                  <div className="meta">
                    <span className="seller">{p.seller}</span>
                  </div>
                </div>

                {/* 찜 */}
                <button
                  className={"like-btn" + (p.liked ? " on" : "")}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(p.id);
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12.1 20.1S4 15 4 9.9A4.9 4.9 0 0 1 8.9 5c2 0 3 1 3.2 1.6C12.3 6 13.3 5 15.3 5A4.9 4.9 0 0 1 20.2 9.9c0 5.1-8.1 10.2-8.1 10.2Z"
                      stroke={p.liked ? "#e85b5b" : "#8d8585"}
                      strokeWidth="1.6"
                      fill={p.liked ? "#e85b5b" : "none"}
                    />
                  </svg>
                  <span className="like-num">{p.likes}</span>
                </button>
              </article>
            );
          })}
        </main>

        <div style={{ height: 56 }} />
        <BottomNav />

        {/* 정렬 바텀시트 */}
        {sortOpen && (
          <div className="sheet-backdrop" onClick={() => setSortOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="sheet-item" onClick={() => setSortType("인기순")}>
                인기순
              </button>
              <button className="sheet-item" onClick={() => setSortType("최신순")}>
                최신순
              </button>
              <button
                className="sheet-item"
                onClick={() => setSortType("거래 가능")}
              >
                거래 가능
              </button>
              <button
                className="sheet-item close"
                onClick={() => setSortOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
