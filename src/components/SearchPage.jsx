import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import flamel1 from "../image/flamel-ai-edit-1982838-2-2-4.png";
import flamel2 from "../image/flamel-ai-edit-1982838-2-2-3.png";
import group115 from "../image/Group 23.png";
import vector33 from "../image/vector-33.png";
import "../styles/SearchPage.css";

import BottomNav from "./BottomNav";

// 예약중 / 판매완료 스티커
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

export default function SearchPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("바람막이");
  const [keyword, setKeyword] = useState("");

  // 최근 검색어
  const [recent, setRecent] = useState(["바람막이", "자켓", "패딩"]);
  const removeRecent = (word) =>
    setRecent((prev) => prev.filter((w) => w !== word));

  // 필터칩 (지금은 비워두고, 나중에 백엔드 연동 시 사용)
  const [filters, setFilters] = useState([]);
  const removeFilter = (tag) =>
    setFilters((prev) => prev.filter((t) => t !== tag));

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");

  // ✅ status: "판매중" | "예약중" | "판매완료"
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "썸플레이스 후드 바람막이 중고",
      price: 52800,
      seller: "닉네임12345",
      likes: 0,
      liked: false,
      status: "예약중",
      img: "https://via.placeholder.com/300x300?text=예약중",
      createdAt: "2025-01-01T10:00:00Z",
    },
    {
      id: 2,
      title: "썸플레이스 후드 바람막이 중고",
      price: 52800,
      seller: "닉네임12345",
      likes: 0,
      liked: false,
      status: "판매완료",
      img: "https://via.placeholder.com/300x300?text=판매완료",
      createdAt: "2025-01-02T09:30:00Z",
    },
    {
      id: 3,
      title: "바람막이 상의 상태 깔끔",
      price: 45000,
      seller: "닉네임89",
      likes: 0,
      liked: false,
      status: "판매중",
      img: "https://via.placeholder.com/300x300?text=상품",
      createdAt: "2025-01-03T08:00:00Z",
    },
  ]);

  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // 공통 검색 실행 함수
  const runSearch = (raw) => {
    const q = raw.trim();
    if (!q) return;

    setSearchTerm(q);
    setKeyword(q);

    // 최근 검색어 갱신 (중복 제거 + 앞에 추가, 최대 3개)
    setRecent((prev) => {
      const next = [q, ...prev.filter((w) => w !== q)];
      return next.slice(0, 3);
    });

    // TODO: 실제 검색 API 연동
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  const handleRecentClick = (word) => {
    runSearch(word);
  };

  // 좋아요 토글
  const toggleLike = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
          : p
      )
    );
  };

  // 정렬/필터 선택
  const pickSort = (t) => {
    setSortType(t);
    setSortOpen(false);
  };

  // 화면에 보여줄 상품 리스트 (검색어 + 정렬 + 거래 가능 필터)
  const visibleProducts = useMemo(() => {
    let base = products;

    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      base = base.filter((p) => p.title.toLowerCase().includes(lower));
    }

    if (sortType === "거래 가능") {
      // 거래 가능 → "판매중"만
      return base.filter((p) => p.status === "판매중");
    }

    const copied = [...base];

    if (sortType === "인기순") {
      copied.sort((a, b) => b.likes - a.likes);
    } else if (sortType === "최신순") {
      copied.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return copied;
  }, [products, sortType, keyword]);

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

        {/* 최근 검색어 */}
        <section className="sp-section">
          <div className="sp-section-title">최근 검색어</div>
          <div className="chips">
            {recent.map((word) => (
              <span key={word} className="chip recent">
                <button
                  type="button"
                  className="chip-label"
                  onClick={() => handleRecentClick(word)}
                >
                  {word}
                </button>
                <button
                  className="chip-x"
                  onClick={() => removeRecent(word)}
                  aria-label={`${word} 삭제`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* 필터칩 (지금은 비어 있음 – 나중에 연동) */}
        {filters.length > 0 && (
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
        )}

        {/* 상품 개수 + 정렬 */}
        <div className="sp-list-header">
          <div className="left">
            <span className="label">상품</span>
            <span className="count">{visibleProducts.length}</span>
          </div>
          <button className="right" onClick={() => setSortOpen(true)}>
            <span className="sort">{sortType}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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

        {/* 상품 카드 리스트 */}
        <div className="sp-product-list">
          {visibleProducts.map((p) => (
            <article
              key={p.id}
              className="sp-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              {/* 썸네일 + 흑백 + 상태 스티커 (카테고리와 동일 구조) */}
              <div className="sp-thumb-wrap">
                <img
                  src={p.img}
                  alt={p.title}
                  className={
                    p.status === "예약중" || p.status === "판매완료"
                      ? "sp-thumb-img gray"
                      : "sp-thumb-img"
                  }
                />

                {p.status === "예약중" && (
                  <img
                    src={stickerReserved}
                    alt="예약중"
                    className="sp-status-sticker"
                  />
                )}

                {p.status === "판매완료" && (
                  <img
                    src={stickerSoldout}
                    alt="판매완료"
                    className="sp-status-sticker"
                  />
                )}
              </div>

              {/* 정보 영역 (카테고리 / 제목 / 가격 / 닉네임) */}
              <div className="info">
                <div className="category">의류</div>
                <h3 className="title">{p.title}</h3>
                <div className="price">{p.price.toLocaleString()}원</div>

                <div className="meta">
                  <span className="seller">{p.seller}</span>
                </div>
              </div>

              {/* 찜 버튼 – 카테고리 페이지처럼 우측에 분리 */}
              <button
                className={"like-btn" + (p.liked ? " liked" : "")}
                onClick={(e) => {
                  e.stopPropagation(); // 상세 이동 막기
                  toggleLike(p.id);
                }}
                type="button"
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
              <button
                className="sheet-item"
                onClick={() => pickSort("거래 가능")}
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

        <div className="sp-bottom-space" />
        <BottomNav />
      </div>
    </div>
  );
}
