import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../image/Group 23.png";
import backIcon from "../image/vector-33.png";
import "../styles/CategoryPage.css";
import BottomNav from "./BottomNav";

// ★ 상태 스티커 이미지 추가
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

/** 카테고리 매핑 */
const CATEGORY_MAP = {
  clothes: "의류",
  books: "도서/문구",
  appliances: "가전/주방",
  helper: "도우미/기타",

  // 한글 파라미터 지원
  의류: "의류",
  "도서/문구": "도서/문구",
  "가전/주방": "가전/주방",
  "도우미/기타": "도우미/기타",
};

const FALLBACK_CATEGORY = "의류";

/** 카테고리 더미 상품 */
const dummyItemsByCat = (cat) => [
  {
    id: 1,
    title: `${cat} 관련 상품 A`,
    price: 52800,
    seller: "닉네임12345",
    liked: false,
    likes: 11,
    img: "https://via.placeholder.com/120x120?text=A",
    status: "예약중", // ★ 테스트용 상태
  },
  {
    id: 2,
    title: `${cat} 관련 상품 B`,
    price: 52800,
    seller: "닉네임12345",
    liked: false,
    likes: 11,
    img: "https://via.placeholder.com/120x120?text=B",
    status: "판매완료",
  },
  {
    id: 3,
    title: `${cat} 관련 상품 C`,
    price: 52800,
    seller: "닉네임12345",
    liked: false,
    likes: 11,
    img: "https://via.placeholder.com/120x120?text=C",
    status: "ON_SALE",
  },
];

export default function CategoryPage() {
  const nav = useNavigate();
  const { name } = useParams();

  const categoryName =
    CATEGORY_MAP[decodeURIComponent(name || FALLBACK_CATEGORY)] ||
    FALLBACK_CATEGORY;

  const [items, setItems] = useState(dummyItemsByCat(categoryName));
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");

  const countLabel = useMemo(() => `상품 ${items.length}`, [items.length]);

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

  const onSelectSort = (type) => {
    setSortType(type);
    setSortOpen(false);
  };

  return (
    <div className="cat-shell">
      <div className="cat-frame">
        {/* 상단바 */}
        <header className="cat-topbar">
          <button className="icon-btn" onClick={() => nav(-1)}>
            <img src={backIcon} alt="" />
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
          <span className="count">{countLabel}</span>
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
          {items.map((p) => (
            <article key={p.id} className="cat-card">
              
              {/* ★ 썸네일 + 흑백 */}
              <div className="cat-thumb-wrap">
                <img
                  className={
                    p.status === "예약중" || p.status === "판매완료"
                      ? "thumb gray"
                      : "thumb"
                  }
                  src={p.img}
                  alt={p.title}
                />

                {/* ★ 상태 스티커 */}
                {p.status === "예약중" && (
                  <img
                    className="cat-status-sticker"
                    src={stickerReserved}
                    alt="예약중"
                  />
                )}

                {p.status === "판매완료" && (
                  <img
                    className="cat-status-sticker"
                    src={stickerSoldout}
                    alt="판매완료"
                  />
                )}
              </div>

              {/* 정보 */}
              <div className="info">
                <div className="category">{categoryName}</div>
                <h3 className="title">{p.title}</h3>
                <div className="price">{p.price.toLocaleString()}원</div>
                <div className="meta">
                  <span className="seller">{p.seller}</span>
                </div>
              </div>

              {/* 찜 버튼 */}
              <button
                className={"like-btn" + (p.liked ? " on" : "")}
                onClick={() => toggleLike(p.id)}
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
          ))}
        </main>

        {/* 네비 아래 여백 */}
        <div style={{ height: 56 }} />
        <BottomNav />

        {/* 정렬 바텀시트 */}
        {sortOpen && (
          <div className="sheet-backdrop" onClick={() => setSortOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="sheet-item" onClick={() => onSelectSort("인기순")}>
                인기순
              </button>
              <button className="sheet-item" onClick={() => onSelectSort("최신순")}>
                최신순
              </button>
              <button className="sheet-item" onClick={() => onSelectSort("거래 가능")}>
                거래 가능
              </button>
              <button className="sheet-item close" onClick={() => setSortOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
