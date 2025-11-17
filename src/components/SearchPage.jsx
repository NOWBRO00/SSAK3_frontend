import React, { useState } from "react";
import flamel1 from "../image/flamel-ai-edit-1982838-2-2-4.png";
import flamel2 from "../image/flamel-ai-edit-1982838-2-2-3.png";
import group115 from "../image/Group 23.png";
import vector33 from "../image/vector-33.png";
import "../styles/SearchPage.css";

import BottomNav from "./BottomNav";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("바람막이");

  // ✅ 임시 최근검색어 3개 + 각 항목 삭제(✕)
  const [recent, setRecent] = useState(["바람막이", "자켓", "패딩"]);
  const removeRecent = (word) =>
    setRecent((prev) => prev.filter((w) => w !== word));

  // 필터칩 (개별 ✕ 삭제)
  const [filters, setFilters] = useState(["의류", "남성", "중고"]);
  const removeFilter = (tag) =>
    setFilters((prev) => prev.filter((t) => t !== tag));

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");

  // ✅ 좋아요 토글 가능하도록 상태에 liked/likes 포함
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "썸플레이스 후드 바람막이 중고",
      price: 52800,
      seller: "닉네임12345",
      likes: 11,
      liked: false,
      status: "available",
      img: "https://via.placeholder.com/120x120?text=상품1",
    },
    {
      id: 2,
      title: "썸플레이스 후드 바람막이 중고",
      price: 52800,
      seller: "닉네임12345",
      likes: 11,
      liked: false,
      status: "soldout",
      img: "https://via.placeholder.com/120x120?text=판매완료",
    },
  ]);

  const handleInputChange = (e) => setSearchTerm(e.target.value);
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    setRecent((prev) => {
      // 중복 방지 + 앞쪽에 추가, 길이 3 유지
      const next = [q, ...prev.filter((w) => w !== q)];
      return next.slice(0, 3);
    });
    // TODO: 실제 검색 호출
  };

  const toggleLike = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const pickSort = (t) => {
    setSortType(t);
    setSortOpen(false);
    // TODO: 실제 정렬
  };

  return (
    <div className="search-screen">
      <div className="search-frame">
        {/* 상단바 */}
        <header className="sp-topbar">
          <button
            className="sp-back"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
          >
            <img src={vector33} alt="" />
          </button>
          <img className="sp-logo" src={group115} alt="logo" />
          <div className="sp-mascot">
            <img className="mascot-1" src={flamel1} alt="" />
            <img className="mascot-2" src={flamel2} alt="" />
          </div>
        </header>

        {/* 검색창 */}
        <form className="sp-searchbar" onSubmit={handleSearch}>
          <input
            className="sp-input"
            type="text"
            placeholder="원하시는 물건이 있으신가요?"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button className="sp-searchbtn" type="submit" aria-label="검색">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2b0c0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* 최근 검색어 (항목별 ✕로 삭제) */}
        <section className="sp-section">
          <div className="sp-section-title">최근 검색어</div>
          <div className="chips">
            {recent.map((word) => (
              <span key={word} className="chip recent">
                {word}
                <button
                  className="chip-x"
                  aria-label={`${word} 삭제`}
                  onClick={() => removeRecent(word)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* 필터칩 (항목별 ✕로 제거) */}
        <section className="sp-section">
          <div className="chips">
            {filters.map((f) => (
              <span key={f} className="chip filter">
                {f}
                <button
                  className="chip-x"
                  aria-label={`${f} 필터 제거`}
                  onClick={() => removeFilter(f)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* 상품 개수 + 정렬 */}
        <div className="sp-list-header">
          <div className="left">
            <span className="label">상품</span>
            <span className="count">{products.length}</span>
          </div>
          <button className="right" onClick={() => setSortOpen(true)}>
            <span className="sort">{sortType}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="#442323"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 상품 목록 */}
        <div className="sp-product-list">
          {products.map((p) => (
            <article key={p.id} className="sp-card">
              <div className="thumb">
                <img src={p.img} alt={p.title} />
                {p.status === "soldout" && <div className="sold">판매완료</div>}
              </div>
              <div className="info">
                <div className="category">의류</div>
                <h3 className="title">{p.title}</h3>
                <div className="price">{p.price.toLocaleString()}원</div>
                <div className="meta">
                  <span className="seller">{p.seller}</span>

                  {/* ✅ 하트(좋아요) 토글 */}
                  <button
                    className={"like-btn" + (p.liked ? " liked" : "")}
                    onClick={() => toggleLike(p.id)}
                    aria-label="찜하기"
                    type="button"
                  >
                    {/* 하트 아이콘 (stroke만 바뀜) */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={p.liked ? "#f04e4e" : "none"}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke={p.liked ? "#f04e4e" : "#7a6f6f"}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="like-cnt">{p.likes}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 정렬 바텀시트 */}
        {sortOpen && (
          <div className="sheet-backdrop" onClick={() => setSortOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="sheet-item" onClick={() => pickSort("인기순")}>
                인기순
              </button>
              <button className="sheet-item" onClick={() => pickSort("최신순")}>
                최신순
              </button>
              <button className="sheet-item" onClick={() => pickSort("거래 가능")}>
                거래 가능
              </button>
              <button className="sheet-item close" onClick={() => setSortOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 하단 여유 + 네비 */}
        <div className="sp-bottom-space" />
        <BottomNav />
      </div>
    </div>
  );
}
