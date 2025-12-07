// src/pages/CategoryPage.jsx

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../image/Group 23.png";
import backIcon from "../image/vector-33.png";
import "../styles/CategoryPage.css";
import BottomNav from "./BottomNav";
// Mock 데이터 제거됨

// 상태 스티커 이미지
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

// 🔹 로딩 이미지
import loaderImg from "../image/loader.png";

// 🔹 공통 상품/카테고리 유틸
//   - resolveCategoryFromParam: URL 파라미터 → { code, id, label }
//   - buildImageUrl: /uploads/... → 절대 URL
//   - getProducts: 카테고리별 상품 조회
//   - getCategories: 백엔드 카테고리 목록 가져오기
import { resolveCategoryFromParam, buildImageUrl, getProducts, getCategories } from "../lib/products";

// 🔹 공통 API 함수
import { api } from "../lib/api";

// ✅ 공통 인증 유틸리티 사용
import { getUserId } from "../utils/auth";

/** mock 상태(한글) → enum 변환 */
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

/** 백엔드/모크 섞여도 enum으로 정규화 */
const normalizeStatus = (status) => {
  if (!status) return "ON_SALE";
  if (status === "ON_SALE" || status === "RESERVED" || status === "SOLD_OUT") {
    return status;
  }
  // mock에서 오는 한글 상태 대응
  return mapStatusFromKorean(status);
};

// 백엔드 카테고리 이름 -> 프론트 코드 매핑 (컴포넌트 외부로 이동)
const BACKEND_CATEGORY_MAP = {
  "의류": "clothes",
  "도서": "books",
  "도서 / 문구": "books",
  "전자제품": "appliances",
  "가전 / 주방": "appliances",
  "가구": "helper",
  "도우미 / 기타": "helper",
};

export default function CategoryPage() {
  const nav = useNavigate();
  const { name } = useParams();

  /**
   * URL 파라미터 → 카테고리 정보
   * - /category/clothes      → { code: "clothes", id: 1, label: "의류" }
   * - /category/books        → { code: "books", id: 2, label: "도서 / 문구" }
   * - /category/appliances   → { code: "appliances", id: 3, label: "가전 / 주방" }
   * - /category/helper       → { code: "helper", id: 4, label: "도우미 / 기타" }
   *
   * ※ resolveCategoryFromParam 안에서 1~4 매핑을 해주고 있다고 가정
   */
  const { id: rawCategoryId, label: categoryName } =
    resolveCategoryFromParam(name);

  // 혹시 undefined가 올 수 있으니 숫자로 한 번 더 안전하게 변환
  const categoryId = Number(rawCategoryId || 1);
  
  // 디버깅: URL 파라미터와 카테고리 매핑 확인
  if (process.env.NODE_ENV === "development") {
    console.log("[카테고리 페이지] URL 파라미터:", name);
    console.log("[카테고리 페이지] 카테고리 정보:", { rawCategoryId, categoryId, categoryName });
  }

  const [items, setItems] = useState([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("인기순");
  const [loading, setLoading] = useState(true);
  const [wishList, setWishList] = useState([]); // 찜 목록
  const [backendCategoryId, setBackendCategoryId] = useState(null); // 백엔드 실제 카테고리 ID

  // 백엔드에서 카테고리 목록을 가져와서 실제 ID 찾기
  useEffect(() => {
    const fetchBackendCategoryId = async () => {
      try {
        const backendCategories = await getCategories();
        
        // 프론트엔드 카테고리 코드에 해당하는 백엔드 카테고리 찾기
        const frontendCode = resolveCategoryFromParam(name).code;
        
        // 백엔드 카테고리 목록에서 매칭되는 카테고리 찾기
        const matchedCategory = backendCategories.find((cat) => {
          const backendName = cat.name || "";
          const mappedCode = BACKEND_CATEGORY_MAP[backendName];
          return mappedCode === frontendCode;
        });
        
        if (matchedCategory && matchedCategory.id) {
          setBackendCategoryId(matchedCategory.id);
          if (process.env.NODE_ENV === "development") {
            console.log(`[카테고리 페이지] 백엔드 카테고리 ID 찾음:`, {
              frontendCode,
              backendName: matchedCategory.name,
              backendId: matchedCategory.id,
            });
          }
        } else {
          // 매칭 실패 시 하드코딩된 ID 사용 (fallback)
          setBackendCategoryId(categoryId);
          if (process.env.NODE_ENV === "development") {
            console.warn(`[카테고리 페이지] 백엔드 카테고리 매칭 실패, 하드코딩된 ID 사용:`, categoryId);
          }
        }
      } catch (e) {
        console.error("[카테고리 페이지] 백엔드 카테고리 목록 조회 실패:", e);
        // 실패 시 하드코딩된 ID 사용 (fallback)
        setBackendCategoryId(categoryId);
      }
    };
    
    fetchBackendCategoryId();
  }, [name, categoryId]);

  /** 🔥 카테고리별 상품 조회 (백엔드 + mock fallback) */
  const load = useCallback(async () => {
    if (backendCategoryId === null) {
      // 백엔드 카테고리 ID를 아직 찾지 못한 경우 대기
      return;
    }

    setLoading(true);

    try {
      // ✅ 핵심: 백엔드 실제 카테고리 ID 사용
      //    GET /api/products?categoryId={backendCategoryId}
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[카테고리 페이지] 백엔드 카테고리 ID ${backendCategoryId}로 상품 조회 시작`);
      }

      // getProducts 함수 사용 (products.js에서 제공)
      const rawList = await getProducts({ categoryId: backendCategoryId });

      if (process.env.NODE_ENV === "development") {
        console.log(`[카테고리 페이지] 상품 조회 성공:`, rawList?.length || 0, "개");
      }

      // rawList가 배열이 아니면 빈 배열로 처리
      if (!Array.isArray(rawList)) {
        console.warn("[카테고리 페이지] 응답이 배열이 아닙니다:", rawList);
        setItems([]);
        return;
      }

      const mapped = rawList.map((raw) => ({
        id: raw.id,
        title: raw.title,
        price: raw.price,
        seller: raw.sellerNickname || raw.seller?.nickname || "",
        likes: raw.likeCount ?? 0,
        liked: !!raw.isWishlisted,
        img: Array.isArray(raw.imageUrls)
          ? buildImageUrl(raw.imageUrls[0])
          : buildImageUrl(raw.imageUrl || ""),
        status: normalizeStatus(raw.status), // ON_SALE / RESERVED / SOLD_OUT
      }));

      setItems(mapped);
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[카테고리 페이지] 상품 매핑 완료:`, mapped.length, "개");
      }
    } catch (e) {
      console.error("[카테고리 페이지] 상품 조회 실패:", e);
      // 백엔드 실패 시 빈 배열로 표시
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [backendCategoryId]);

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

  // 찜 목록이 로드되면 상품 목록의 찜 상태 업데이트
  useEffect(() => {
    if (wishList.length > 0) {
      const wishSet = new Set(wishList);
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          liked: wishSet.has(item.id),
        }))
      );
    }
  }, [wishList]);

  useEffect(() => {
    load();
  }, [load]);

  /** 정렬된 리스트 */
  const visibleItems = useMemo(() => {
    let list = [...items];

    if (sortType === "인기순") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortType === "최신순") {
      // id가 클수록 최신이라고 가정
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortType === "거래 가능") {
      list = list.filter((p) => p.status === "ON_SALE");
    }

    return list;
  }, [items, sortType]);

  /** 찜 토글 (프론트 상태만 변경) */
  const toggleLike = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              liked: !it.liked,
              likes: it.liked ? (it.likes || 0) - 1 : (it.likes || 0) + 1,
            }
          : it
      )
    );
  };

  /** 🔹 로딩 화면 */
  if (loading) {
    return (
      <div className="cat-loading-wrap">
        <div className="cat-loading-inner">
          <img
            src={loaderImg}
            alt="로딩중"
            className="cat-loading-img"
            draggable={false}
          />
          <p className="cat-loading-text">로딩중...</p>
        </div>
      </div>
    );
  }

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
                  <div className="price">
                    {p.price != null ? p.price.toLocaleString() : 0}원
                  </div>
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
                  <span className="like-num">{p.likes ?? 0}</span>
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
              <button
                className="sheet-item"
                onClick={() => setSortType("인기순")}
              >
                인기순
              </button>
              <button
                className="sheet-item"
                onClick={() => setSortType("최신순")}
              >
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
