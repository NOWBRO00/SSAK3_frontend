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

const API_BASE = BASE_URL;

// ✅ 사용자 ID 가져오기 (카카오 로그인)
const getUserId = () => {
  try {
    const profileStr = localStorage.getItem("ssak3.profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.id;
    }
  } catch (e) {
    console.error("프로필 파싱 실패:", e);
  }
  return null;
};

/** 한글 상태 → 내부 enum */
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
  const profile = useMemo(() => {
    try {
      const profileStr = localStorage.getItem("ssak3.profile");
      if (profileStr) {
        return JSON.parse(profileStr);
      }
    } catch (e) {
      console.error("프로필 파싱 실패:", e);
    }
    return null;
  }, []);

  // TODO: 나중에 백엔드 연동
  const temperature = 55.7;
  const sellCount = 12;
  const nickname = profile?.nickname || "사용자";
  const profileImage = profile?.profileImageUrl || profile?.thumbnailImageUrl || defaultProfile;

  // ✅ 1) 내 상품 목록 (백엔드 API에서 가져오기)
  const [myItems, setMyItems] = useState([]);

  // ✅ 2) 찜 목록: 명세서 기준 /api/likes/user/{userId}
  const [wishItems, setWishItems] = useState([]);
  const [loadingWish, setLoadingWish] = useState(true);

  useEffect(() => {
    const loadWish = async () => {
      setLoadingWish(true);
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error("사용자 ID를 찾을 수 없습니다.");
        }
        const res = await fetch(`${API_BASE}/api/likes/user/${userId}`);
        if (!res.ok) throw new Error("찜 목록 조회 실패");

        const rawList = await res.json(); // 예시: [{ productId, title, price, imageUrl }]
        const mapped = rawList.map((w) => ({
          id: w.productId,
          title: w.title,
          price: w.price,
          img: buildImageUrl(w.imageUrl),
          category: w.categoryName || "", // 나중에 백엔드가 붙여주면 사용
          status: "ON_SALE", // 👍 likes 응답엔 상태가 없어서 기본값
          wished: true,
        }));

        setWishItems(mapped);
      } catch (e) {
        // 백엔드 실패 시 빈 배열로 표시
        setWishItems([]);
      } finally {
        setLoadingWish(false);
      }
    };

    loadWish();
  }, []);

  // 선택된 탭에 따라 보여줄 base 리스트
  const baseList = activeTab === "my" ? myItems : wishItems;

  // ✅ 선택된 status(enum)만 필터링
  const filteredItems = useMemo(
    () => baseList.filter((item) => item.status === filterStatus),
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
                      {item.category}
                    </div>
                    <div className="mypage-card-title">{item.title}</div>
                    <div className="mypage-card-price">
                      {item.price.toLocaleString()} <span>원</span>
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
