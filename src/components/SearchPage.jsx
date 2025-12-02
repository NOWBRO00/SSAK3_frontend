// src/components/SearchPage.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

import flamel1 from "../image/flamel-ai-edit-1982838-2-2-4.png";
import flamel2 from "../image/flamel-ai-edit-1982838-2-2-3.png";
import group115 from "../image/Group 23.png";
import vector33 from "../image/vector-33.png";
import "../styles/SearchPage.css";

import BottomNav from "./BottomNav";

// 상태 스티커
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

// Mock 데이터 제거됨

// 공통 api
import { api } from "../lib/api";

// ✅ 공통 인증 유틸리티 사용
import { getUserId } from "../utils/auth";

export default function SearchPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("가디건"); // 입력창 값
  const [keyword, setKeyword] = useState(""); // 실제 검색에 사용된 키워드

  const [recent, setRecent] = useState(["가디건", "자켓", "패딩"]);
  const removeRecent = (word) =>
    setRecent((prev) => prev.filter((w) => w !== word));

  const [filters, setFilters] = useState([]);
  const removeFilter = (tag) =>
    setFilters((prev) => prev.filter((t) => t !== tag));

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");

  // 실제 검색 결과
  const [products, setProducts] = useState([]);
  const [wishList, setWishList] = useState([]); // 찜 목록

  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // ✅ 공통 검색 함수 (백엔드 + mock fallback)
  const runSearch = useCallback(
    async (raw) => {
      const q = raw.trim();
      if (!q) return;

      setKeyword(q);
      setSearchTerm(q);

      // 최근 검색어 갱신
      setRecent((prev) => {
        const next = [q, ...prev.filter((w) => w !== q)];
        return next.slice(0, 3);
      });

      try {
        // GET /api/products/search?keyword={검색어}
        const list = await api(
          `/api/products/search?keyword=${encodeURIComponent(q)}`
        );

        const mapped = list.map((raw) => ({
          id: raw.id,
          title: raw.title,
          price: raw.price,
          status: raw.status || "ON_SALE", // ON_SALE / RESERVED / SOLD_OUT
          category: raw.categoryName || "",
          seller: raw.sellerNickname || "닉네임",
          liked: !!raw.isWishlisted,
          likes: raw.likeCount ?? 0,
          thumbnail: Array.isArray(raw.imageUrls)
            ? raw.imageUrls[0]
            : "",
        }));

        setProducts(mapped);
      } catch (err) {
        // 백엔드 실패 시 빈 배열로 표시
        setProducts([]);
      }
    },
    [] // setState 들은 안정적이어서 deps에 안 넣어도 ESLint 통과
  );

  // 찜 목록 로드
  useEffect(() => {
    const loadWishList = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        
        const likes = await api(`/api/likes/user/${userId}`);
        const wishProductIds = (likes || []).map((raw) => {
          const product = raw.product || raw;
          return product.id || raw.productId || raw.id;
        });
        setWishList(wishProductIds);
      } catch (e) {
        // 찜 목록 로드 실패 시 빈 배열
        setWishList([]);
      }
    };
    
    loadWishList();
  }, []);

  // 찜 목록이 로드되면 검색 결과의 찜 상태 업데이트
  useEffect(() => {
    if (wishList.length > 0) {
      const wishSet = new Set(wishList);
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          liked: wishSet.has(p.id),
        }))
      );
    }
  }, [wishList]);

  // 🔹 페이지 처음 열릴 때 기본 검색 한 번 실행
  useEffect(() => {
    runSearch("가디건");
  }, [runSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  const handleRecentClick = (word) => {
    runSearch(word);
  };

  const toggleLike = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? Math.max(0, (p.likes || 0) - 1) : (p.likes || 0) + 1,
            }
          : p
      )
    );
  };

  const pickSort = (t) => {
    setSortType(t);
    setSortOpen(false);
  };

  const visibleProducts = useMemo(() => {
    let base = products;

    const q = keyword.trim().toLowerCase();
    if (q) {
      base = base.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (sortType === "거래 가능") {
      base = base.filter(
        (p) => p.status === "ON_SALE" || p.status === "판매중"
      );
    }

    const copied = [...base];

    if (sortType === "인기순") {
      copied.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortType === "최신순") {
      copied.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
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
            onClick={() => navigate(-1)}
          >
            <img src={vector33} alt="뒤로가기" />
          </button>
          <img className="sp-logo" src={group115} alt="logo" />
          <div className="sp-mascot">
            <img className="mascot-1" src={flamel1} alt="마스코트1" />
            <img className="mascot-2" src={flamel2} alt="마스코트2" />
          </div>
        </header>

        {/* 검색영역 전체 블럭 */}
        <div className="sp-header-block">
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

          {/* 필터칩 (지금은 안 씀) */}
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
        </div>

        {/* 상품 리스트 */}
        <div className="sp-product-list">
          {visibleProducts.map((p) => (
            <article
              key={p.id}
              className="sp-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <div className="sp-thumb-wrap">
                <img
                  src={p.thumbnail || p.img}
                  alt={p.title || "상품 이미지"}
                  className={
                    p.status === "RESERVED" ||
                    p.status === "SOLD_OUT" ||
                    p.status === "예약중" ||
                    p.status === "판매완료"
                      ? "sp-thumb-img gray"
                      : "sp-thumb-img"
                  }
                />
                {(p.status === "RESERVED" || p.status === "예약중") && (
                  <img
                    src={stickerReserved}
                    alt="예약중"
                    className="sp-status-sticker"
                  />
                )}
                {(p.status === "SOLD_OUT" || p.status === "판매완료") && (
                  <img
                    src={stickerSoldout}
                    alt="판매완료"
                    className="sp-status-sticker"
                  />
                )}
              </div>

              <div className="info">
                <div className="category">{p.category || "의류"}</div>
                <h3 className="title">{p.title}</h3>
                <div className="price">
                  {p.price != null ? p.price.toLocaleString() : 0}원
                </div>
                <div className="meta">
                  <span className="seller">
                    {p.seller?.nickname || p.seller || "닉네임"}
                  </span>
                </div>
              </div>

              <button
                className={"like-btn" + (p.liked ? " liked" : "")}
                onClick={(e) => {
                  e.stopPropagation();
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
                <span className="like-num">{p.likes ?? 0}</span>
              </button>
            </article>
          ))}
        </div>

        {/* 정렬 바텀시트 */}
        {sortOpen && (
          <div className="sheet-backdrop" onClick={() => setSortOpen(false)}>
            <div
              className="bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
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
