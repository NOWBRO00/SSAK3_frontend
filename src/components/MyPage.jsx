// src/components/MyPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/MyPage.css";

// 이미지들
import logo from "../image/Group 23.png";
import defaultProfile from "../image/profile-default.png";
import backIcon from "../image/vector-33.png";
import searchIcon from "../image/icon-search.png";

// PNG 탭 버튼 이미지
import tabMyOn from "../image/tab-my-on.png";
import tabWishOn from "../image/tab-wish-on.png";
import tabMyOff from "../image/tab-my-off.png";
import tabWishOff from "../image/tab-wish-off.png";

// 상태 스티커 이미지
import stickerReserved from "../image/status-reserved.png";
import stickerSoldout from "../image/status-soldout.png";

// 🔹 공통 더미 상품
// Mock 데이터 제거됨

// 🔹 API BASE + 이미지 URL 유틸 (카테고리/상품에서 쓰는 것과 동일하게)
import { BASE_URL } from "../lib/api";
import { buildImageUrl } from "../lib/products";
// ✅ 공통 인증 유틸리티 사용
import { getUserId, getUserProfile } from "../utils/auth";

const API_BASE = BASE_URL;

/** 내부 enum → 한글 상태 (UI 표시용) */
const mapStatusToKorean = (code) => {
  switch (code) {
    case "ON_SALE":
      return "판매중";
    case "RESERVED":
      return "예약중";
    case "SOLD_OUT":
      return "판매완료";
    default:
      return "판매중";
  }
};

export default function MyPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my"); // "my" | "wish"
  const [filterOpen, setFilterOpen] = useState(false);
  // ✅ 내부 status enum: "ON_SALE" | "RESERVED" | "SOLD_OUT"
  const [filterStatus, setFilterStatus] = useState("ON_SALE");

  // ✅ 카카오 로그인 사용자 정보 가져오기
  const userProfile = getUserProfile();
  const nickname = userProfile?.nickname || "사용자";
  const profileImage = userProfile?.profileImageUrl || userProfile?.thumbnailImageUrl || defaultProfile;

  // ✅ 사용자 프로필 및 온도 정보 (백엔드 API에서 가져오기)
  const [temperature, setTemperature] = useState(36.5); // 기본값
  const [sellCount, setSellCount] = useState(0);

  // ✅ 1) 내 상품 목록 (백엔드 API에서 가져오기)
  const [myItems, setMyItems] = useState([]);

  // 사용자 정보 로드 (온도 등)
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        
        // 방법 1: /api/users/me (현재 로그인한 사용자 정보)
        try {
          const resMe = await fetch(`${API_BASE}/api/users/me`, {
            credentials: "include",
          });
          
          if (resMe.ok) {
            const userData = await resMe.json();
            if (userData.temperature !== undefined) {
              setTemperature(userData.temperature);
              if (process.env.NODE_ENV === "development") {
                console.log("[사용자 정보] /api/users/me에서 온도 가져옴:", userData.temperature);
              }
              return; // 성공하면 여기서 종료
            }
          } else {
            // 400, 404 등 에러 응답은 조용히 다음 방법으로 넘어감
            if (process.env.NODE_ENV === "development") {
              console.log("[사용자 정보] /api/users/me 응답 실패:", resMe.status, "다른 방법 시도");
            }
          }
        } catch (e) {
          // 네트워크 에러 등 - 다음 방법 시도
          if (process.env.NODE_ENV === "development") {
            console.log("[사용자 정보] /api/users/me 실패, 다른 방법 시도:", e.message);
          }
        }
        
        // 방법 2: /api/users/{kakaoId} (카카오 ID로 조회)
        try {
          const res = await fetch(`${API_BASE}/api/users/${userId}`, {
            credentials: "include",
          });
          
          if (res.ok) {
            const userData = await res.json();
            if (userData.temperature !== undefined) {
              setTemperature(userData.temperature);
              if (process.env.NODE_ENV === "development") {
                console.log("[사용자 정보] /api/users/{id}에서 온도 가져옴:", userData.temperature);
              }
              return;
            }
          } else {
            // 400, 404 등 에러 응답은 조용히 다음 방법으로 넘어감
            if (process.env.NODE_ENV === "development") {
              console.log("[사용자 정보] /api/users/{id} 응답 실패:", res.status, "다음 방법 시도");
            }
          }
        } catch (e) {
          // 네트워크 에러 등 - 다음 방법 시도
          if (process.env.NODE_ENV === "development") {
            console.log("[사용자 정보] /api/users/{id} 실패, 다음 방법 시도:", e.message);
          }
        }
        
        // 방법 3: 내 상품 목록에서 첫 번째 상품의 seller 정보 활용
        try {
          const res = await fetch(`${API_BASE}/api/products/seller/${userId}`, {
            credentials: "include",
          });
          
          if (res.ok) {
            const products = await res.json();
            if (Array.isArray(products) && products.length > 0) {
              // 첫 번째 상품의 seller 정보에서 온도 확인
              const firstProduct = products[0];
              const sellerTemp = firstProduct.seller?.temperature || 
                                firstProduct.seller?.mannerTemperature ||
                                firstProduct.mannerTemperature;
              
              if (sellerTemp !== undefined) {
                setTemperature(sellerTemp);
                if (process.env.NODE_ENV === "development") {
                  console.log("[사용자 정보] 내 상품 목록에서 온도 가져옴:", sellerTemp);
                }
                return;
              }
            }
          }
        } catch (e) {
          // 모든 방법 실패 시 기본값 유지
        }
        
        // 모든 방법 실패 시 기본값 유지
        if (process.env.NODE_ENV === "development") {
          console.log("[사용자 정보] 모든 방법 실패, 기본 온도 사용:", 36.5);
        }
      } catch (e) {
        // 네트워크 에러 등 - 기본값 유지
        if (process.env.NODE_ENV === "development") {
          console.error("[사용자 정보 조회 실패]:", e);
        }
      }
    };
    
    loadUserInfo();
  }, []);

  // 판매 수는 내 상품 목록 길이로 계산
  useEffect(() => {
    setSellCount(myItems.length);
  }, [myItems]);

  // ✅ 2) 찜 목록: 명세서 기준 /api/likes/user/{userId}
  const [wishItems, setWishItems] = useState([]);
  const [loadingWish, setLoadingWish] = useState(true);

  // ✅ 내 상품 목록 로드
  useEffect(() => {
    const loadMyItems = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error("사용자 ID를 찾을 수 없습니다.");
        }
        // GET /api/products/seller/{sellerId}
        const res = await fetch(`${API_BASE}/api/products/seller/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("내 상품 목록 조회 실패");

        const rawList = await res.json();
        
        const mapped = (Array.isArray(rawList) ? rawList : []).map((raw) => ({
          id: raw.id,
          title: raw.title || "",
          price: raw.price != null ? Number(raw.price) : 0,
          img: buildImageUrl(raw.imageUrls?.[0] || ""),
          category: raw.categoryName || raw.category?.name || "",
          status: raw.status || "ON_SALE",
          wished: !!raw.isWishlisted,
        }));

        setMyItems(mapped);
        setSellCount(mapped.length); // 판매 수 업데이트
        
        // 내 상품 목록에서 사용자 온도 정보도 확인 (없으면 기본값 유지)
        // temperature가 기본값(36.5)이고 내 상품이 있으면 온도 정보 확인
        if (mapped.length > 0) {
          const currentTemp = temperature;
          if (currentTemp === 36.5) {
            // 온도가 아직 기본값이면 내 상품 목록 응답에서 확인
            const firstProduct = rawList[0];
            const sellerTemp = firstProduct.seller?.temperature || 
                              firstProduct.seller?.mannerTemperature ||
                              firstProduct.mannerTemperature;
            
            if (sellerTemp !== undefined && sellerTemp !== null) {
              setTemperature(sellerTemp);
              if (process.env.NODE_ENV === "development") {
                console.log("[사용자 정보] 내 상품 목록에서 온도 업데이트:", sellerTemp);
              }
            }
          }
        }
      } catch (e) {
        // 백엔드 실패 시 빈 배열로 표시
        setMyItems([]);
        if (process.env.NODE_ENV === "development") {
          console.error("[내 상품 목록 조회 실패]:", e);
        }
      }
    };

    loadMyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadWish = async () => {
      setLoadingWish(true);
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error("사용자 ID를 찾을 수 없습니다.");
        }
        const res = await fetch(`${API_BASE}/api/likes/user/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("찜 목록 조회 실패");

        const rawList = await res.json();
        
        // API 응답 형식: [{id, user, product, ...}] 또는 [{productId, title, price, imageUrl, ...}]
        const mapped = rawList.map((w) => {
          // 백엔드 응답 형식에 따라 product 객체가 있을 수도 있고 없을 수도 있음
          const product = w.product || w;
          const productId = product.id || w.productId || w.id;
          const title = product.title || w.title || "";
          const price = product.price != null ? product.price : (w.price != null ? Number(w.price) : 0);
          const imageUrl = product.imageUrls?.[0] || product.imageUrl || w.imageUrl || "";
          const categoryName = product.categoryName || product.category?.name || w.categoryName || "";
          
          return {
            id: productId,
            title: title,
            price: price,
            img: buildImageUrl(imageUrl),
            category: categoryName,
            status: product.status || w.status || "ON_SALE",
            wished: true,
          };
        });

        setWishItems(mapped);
      } catch (e) {
        // 백엔드 실패 시 빈 배열로 표시
        setWishItems([]);
      } finally {
        setLoadingWish(false);
      }
    };

    loadWish();
    
    // 찜 목록 갱신 이벤트 리스너
    const handleWishListUpdate = () => {
      loadWish();
    };
    
    window.addEventListener('wishListUpdated', handleWishListUpdate);
    
    return () => {
      window.removeEventListener('wishListUpdated', handleWishListUpdate);
    };
  }, []);

  // 찜 목록이 로드되면 내 상품의 찜 상태 업데이트
  useEffect(() => {
    if (wishItems.length > 0) {
      const wishedProductIds = new Set(wishItems.map((p) => p.id));
      setMyItems((prev) =>
        prev.map((item) => ({
          ...item,
          wished: wishedProductIds.has(item.id),
        }))
      );
    }
  }, [wishItems]);

  // 상품 상태 변경 및 삭제 이벤트 리스너
  useEffect(() => {
    // 상품 상태 변경 이벤트 리스너 (내 상품 목록 갱신)
    const handleProductStatusUpdate = () => {
      // 내 상품 목록 다시 로드
      const loadMyItems = async () => {
        try {
          const userId = getUserId();
          if (!userId) return;
          const res = await fetch(`${API_BASE}/api/products/seller/${userId}`, {
            credentials: "include",
          });
          if (!res.ok) return;
          const rawList = await res.json();
          const mapped = (Array.isArray(rawList) ? rawList : []).map((raw) => ({
            id: raw.id,
            title: raw.title || "",
            price: raw.price != null ? Number(raw.price) : 0,
            img: buildImageUrl(raw.imageUrls?.[0] || ""),
            category: raw.categoryName || raw.category?.name || "",
            status: raw.status || "ON_SALE",
            wished: !!raw.isWishlisted,
          }));
          setMyItems(mapped);
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error("[내 상품 목록 갱신 실패]:", e);
          }
        }
      };
      loadMyItems();
    };
    
    // 상품 삭제 이벤트 리스너
    const handleProductDeleted = () => {
      // 내 상품 목록 다시 로드
      const loadMyItems = async () => {
        try {
          const userId = getUserId();
          if (!userId) return;
          const res = await fetch(`${API_BASE}/api/products/seller/${userId}`, {
            credentials: "include",
          });
          if (!res.ok) return;
          const rawList = await res.json();
          const mapped = (Array.isArray(rawList) ? rawList : []).map((raw) => ({
            id: raw.id,
            title: raw.title || "",
            price: raw.price != null ? Number(raw.price) : 0,
            img: buildImageUrl(raw.imageUrls?.[0] || ""),
            category: raw.categoryName || raw.category?.name || "",
            status: raw.status || "ON_SALE",
            wished: !!raw.isWishlisted,
          }));
          setMyItems(mapped);
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error("[내 상품 목록 갱신 실패]:", e);
          }
        }
      };
      loadMyItems();
    };
    
    window.addEventListener('productStatusUpdated', handleProductStatusUpdate);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    return () => {
      window.removeEventListener('productStatusUpdated', handleProductStatusUpdate);
      window.removeEventListener('productDeleted', handleProductDeleted);
    };
  }, []);

  // 선택된 탭에 따라 보여줄 base 리스트
  const baseList = activeTab === "my" ? myItems : wishItems;

  // ✅ 선택된 status(enum)만 필터링 + 안전한 데이터 필터링
  const filteredItems = useMemo(
    () => baseList
      .filter((item) => item && item.status === filterStatus)
      .map((item) => {
        const price = item.price;
        const numPrice = price != null 
          ? (typeof price === 'number' ? price : (isNaN(Number(price)) ? 0 : Number(price)))
          : 0;
        
        return {
          ...item,
          price: numPrice,
          title: item.title || "",
          category: item.category || "",
        };
      }),
    [baseList, filterStatus]
  );

  const productCount = myItems.length;
  const wishCount = wishItems.length;

  const countLabel = activeTab === "my" ? "상품" : "찜";
  const countValue = activeTab === "my" ? productCount : wishCount;

  const handleSelectFilter = (statusCode) => {
    setFilterStatus(statusCode); // "ON_SALE" | "RESERVED" | "SOLD_OUT"
    setFilterOpen(false);
  };

  // ❤️ 토글
  const toggleLike = (id) => {
    if (activeTab === "my") {
      // 내 상품 탭에서는 단순히 표시만 바꿔줌 (실제 찜 API 연동은 상세/리스트에서 처리)
      setMyItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, wished: !item.wished } : item
        )
      );
    } else {
      // 찜 탭에서 하트를 다시 누르면 목록에서 제거
      setWishItems((prev) => prev.filter((item) => item.id !== id));
      // TODO: 명세서 기준 DELETE /api/likes 로 실제 찜 해제 API 연결 가능
    }
  };

  const handleLogout = () => {
    // TODO: 나중에 토큰/세션 초기화 추가
    navigate("/login");
  };

  return (
    <div className="mypage-root">
      <div className="mypage-wrapper">
        {/* 상단 헤더 */}
        <header className="mypage-header">
          <button onClick={() => navigate(-1)} className="mypage-back-btn">
            <img src={backIcon} alt="뒤로가기" className="mypage-top-icon" />
          </button>

          <div className="mypage-logo-box">
            <img src={logo} className="mypage-logo" alt="logo" />
          </div>

          <button
            className="mypage-search-btn"
            onClick={() => navigate("/search")}
          >
            <img src={searchIcon} alt="검색" className="mypage-top-icon" />
          </button>
        </header>

        {/* 프로필 영역 */}
        <section className="mypage-profile-section">
          <div className="mypage-profile-top">
            <div className="mypage-profile-left">
              <img
                src={profileImage}
                alt=""
                className="mypage-profile-img"
              />
              <div>
                <div className="mypage-nickname">{nickname}</div>
                <div className="mypage-selltext">판매수 {sellCount}</div>
              </div>
            </div>

            {/* 오른쪽 위 로그아웃 */}
            <button className="mypage-logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>

          {/* 나눔 온기 바 */}
          <div className="mypage-temp-barwrap">
            <div className="mypage-temp-row">
              <span className="mypage-temp-label">나눔 온기</span>
              <span className="mypage-temp-value">
                {temperature.toFixed(1)}°C
              </span>
            </div>

            <div className="mypage-temp-bar">
              <div
                className="mypage-temp-fill"
                style={{
                  width: `${Math.max(0, Math.min(temperature, 100))}%`,
                }}
              ></div>
            </div>
          </div>

          {/* 탭 PNG */}
          <div className="mypage-tab-png-row">
            <button
              onClick={() => setActiveTab("my")}
              className="mypage-tab-btn"
            >
              <img
                src={activeTab === "my" ? tabMyOn : tabMyOff}
                alt="내 상품"
              />
            </button>
            <button
              onClick={() => setActiveTab("wish")}
              className="mypage-tab-btn"
            >
              <img
                src={activeTab === "wish" ? tabWishOn : tabWishOff}
                alt="찜"
              />
            </button>
          </div>
        </section>

        {/* 콘텐츠 */}
        <section className="mypage-content">
          <div className="mypage-filter-wrap">
            <div className="mypage-count">
              <span className="mypage-count-label">{countLabel}</span>
              <span className="mypage-count-number">{countValue}</span>
            </div>

            <button
              className="mypage-filter-btn"
              onClick={() => setFilterOpen(true)}
            >
              {mapStatusToKorean(filterStatus)}{" "}
              <span className="arrow">▾</span>
            </button>
          </div>

          {/* 찜 탭 로딩 상태 표시 (필요할 때만) */}
          {activeTab === "wish" && loadingWish && (
            <p className="mypage-loading-text">찜 목록을 불러오는 중이에요...</p>
          )}

          {/* 리스트 */}
          <div className="mypage-item-grid">
            {filteredItems.map((item) => {
              const isLiked = !!item.wished;
              const isReserved = item.status === "RESERVED";
              const isSoldOut = item.status === "SOLD_OUT";

              return (
                <div
                  key={item.id}
                  className="mypage-item-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="mypage-card-thumb">
                    {/* 썸네일 이미지 */}
                    <img
                      src={item.img}
                      alt={item.title}
                      className={
                        isReserved || isSoldOut
                          ? "mypage-card-img gray"
                          : "mypage-card-img"
                      }
                    />

                    {/* 상태 스티커 */}
                    {isReserved && (
                      <img
                        src={stickerReserved}
                        alt="예약중"
                        className="mypage-status-sticker"
                      />
                    )}

                    {isSoldOut && (
                      <img
                        src={stickerSoldout}
                        alt="판매완료"
                        className="mypage-status-sticker"
                      />
                    )}

                    {/* ❤️ 하트 */}
                    <button
                      className="mypage-heart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                    >
                      <HeartIcon filled={isLiked} />
                    </button>
                  </div>

                  <div className="mypage-card-info">
                    <div className="mypage-card-category">
                      {item?.category || ""}
                    </div>
                    <div className="mypage-card-title">{item?.title || ""}</div>
                    <div className="mypage-card-price">
                      {(() => {
                        const price = item?.price;
                        if (price == null) return "0";
                        const numPrice = typeof price === 'number' ? price : Number(price);
                        return isNaN(numPrice) ? "0" : numPrice.toLocaleString();
                      })()} <span>원</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <BottomNav />

        {/* 필터 모달 */}
        {filterOpen && (
          <div
            className="mypage-filter-modal-backdrop"
            onClick={() => setFilterOpen(false)}
          >
            <div
              className="mypage-filter-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mypage-filter-panel">
                <div className="mypage-filter-inner">
                  <button
                    className="mypage-filter-option"
                    onClick={() => handleSelectFilter("ON_SALE")}
                  >
                    판매중
                  </button>
                  <button
                    className="mypage-filter-option"
                    onClick={() => handleSelectFilter("RESERVED")}
                  >
                    예약중
                  </button>
                  <button
                    className="mypage-filter-option"
                    onClick={() => handleSelectFilter("SOLD_OUT")}
                  >
                    판매완료
                  </button>
                </div>

                <button
                  className="mypage-filter-close-btn"
                  onClick={() => setFilterOpen(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 하트 아이콘 */
function HeartIcon({ filled }) {
  return filled ? (
    <svg
      className="mypage-heart-icon-svg mypage-heart-icon-svg--filled"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ) : (
    <svg
      className="mypage-heart-icon-svg mypage-heart-icon-svg--empty"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
