import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../image/Group 23.png";
import backIcon from "../image/vector-33.png";
import "../styles/CategoryPage.css";

/** 카테고리 매핑: 한글/슬러그 모두 허용 */
const CATEGORY_MAP = {
  clothes: "의류",
  books: "도서/문구",
  appliances: "가전/주방",
  helper: "도우미/기타",
  "의류": "의류",
  "도서/문구": "도서/문구",
  "가전/주방": "가전/주방",
  "도우미/기타": "도우미/기타",
};

const FALLBACK_CATEGORY = "의류";

/** 카테고리별 더미 상품 */
const dummyItemsByCat = (cat) => {
  const base = [
    {
      id: 1,
      title: `${cat} 관련 상품 A`,
      price: 52800,
      seller: "닉네임12345",
      liked: false,
      likes: 11,
      img: "https://via.placeholder.com/120x120?text=A",
    },
    {
      id: 2,
      title: `${cat} 관련 상품 B`,
      price: 52800,
      seller: "닉네임12345",
      liked: false,
      likes: 11,
      img: "https://via.placeholder.com/120x120?text=B",
    },
    {
      id: 3,
      title: `${cat} 관련 상품 C`,
      price: 52800,
      seller: "닉네임12345",
      liked: false,
      likes: 11,
      img: "https://via.placeholder.com/120x120?text=C",
    },
  ];
  return base;
};

export default function CategoryPage() {
  const nav = useNavigate();
  const { name } = useParams();

  // URL 파라미터를 정규화(한글/슬러그 모두 허용)
  const categoryName =
    CATEGORY_MAP[decodeURIComponent(name || FALLBACK_CATEGORY)] || FALLBACK_CATEGORY;

  const [items, setItems] = useState(dummyItemsByCat(categoryName));
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");

  const countLabel = useMemo(() => `상품 ${items.length}`, [items.length]);

  const toggleLike = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, liked: !it.liked, likes: it.liked ? it.likes - 1 : it.likes + 1 }
          : it
      )
    );
  };

  const onSelectSort = (type) => {
    setSortType(type);
    setSortOpen(false);
    // TODO: 실제 정렬 연동
  };

  return (
    <div className="cat-shell">
      <div className="cat-frame">{/* ✅ 중앙 래퍼 시작 (max-width:390px) */}
        {/* 상단바 */}
        <header className="cat-topbar">
          <button className="icon-btn" aria-label="뒤로가기" onClick={() => nav(-1)}>
            <img src={backIcon} alt="" />
          </button>

          <img className="cat-logo" src={logo} alt="logo" />

          <button
            className="icon-btn"
            aria-label="검색"
            onClick={() => nav("/search")}   // ✅ 검색 이동
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7.5" stroke="#2b0c0b" strokeWidth="2" />
              <line x1="20" y1="20" x2="16.5" y2="16.5" stroke="#2b0c0b" strokeWidth="2" />
            </svg>
          </button>
        </header>

        {/* 브레드크럼 */}
        <div className="cat-breadcrumb">
          <span className="crumb">카테고리</span>
          <span className="chev">›</span>
          <span className="crumb bold">{categoryName}</span>
        </div>

        {/* 헤더: 개수 + 정렬 */}
        <div className="cat-list-header">
          <span className="count">{countLabel}</span>
          <button className="sort-btn" onClick={() => setSortOpen(true)}>
            {sortType}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5" stroke="#2b0c0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ✅ 리스트만 표시 */}
        <main className="cat-list">
          {items.map((p) => (
            <article key={p.id} className="cat-card">
              <img className="thumb" src={p.img} alt={p.title} />
              <div className="info">
                <div className="category">{categoryName}</div>
                <h3 className="title">{p.title}</h3>
                <div className="price">{p.price.toLocaleString()}원</div>
                <div className="meta">
                  <span className="seller">{p.seller}</span>
                </div>
              </div>

              <button
                className={"like-btn" + (p.liked ? " on" : "")}
                onClick={() => toggleLike(p.id)}
                aria-label="찜"
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

        {/* 정렬 바텀시트 */}
        {sortOpen && (
          <div className="sheet-backdrop" onClick={() => setSortOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="sheet-item" onClick={() => onSelectSort("인기순")}>인기순</button>
              <button className="sheet-item" onClick={() => onSelectSort("최신순")}>최신순</button>
              <button className="sheet-item" onClick={() => onSelectSort("거래 가능")}>거래 가능</button>
              <button className="sheet-item close" onClick={() => setSortOpen(false)}>닫기</button>
            </div>
          </div>
        )}
      </div>{/* ✅ 중앙 래퍼 끝 */}
    </div>
  );
}
