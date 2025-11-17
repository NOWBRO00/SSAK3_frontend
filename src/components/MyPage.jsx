import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/MyPage.css";

// 이미지들 (경로는 프로젝트에 맞게 조정)
import logo from "../image/Group 23.png";
import defaultProfile from "../image/profile-default.png";
import backIcon from "../image/vector-33.png";
import searchIcon from "../image/icon-search.png";

// PNG 탭 버튼 이미지
import tabMyOn from "../image/tab-my-on.png";
import tabWishOn from "../image/tab-wish-on.png";
import tabMyOff from "../image/tab-my-off.png";
import tabWishOff from "../image/tab-wish-off.png";

export default function MyPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my"); // "my" | "wish"
  const [filterOpen, setFilterOpen] = useState(false); // 바텀시트 열림 여부
  const [filterStatus, setFilterStatus] = useState("판매중"); // 선택된 상태

  const temperature = 55.7;
  const sellCount = 12;

  // 임시 아이템 데이터 (나중에 백엔드 연동 시 교체)
  const items = [
    { id: 1, category: "가전 / 주방", title: "00자전거 팝니다 ...", price: 5350000 },
    { id: 2, category: "의류", title: "옷 사실 분~~", price: 500 },
    { id: 3, category: "가전 / 주방", title: "00자전거 팝니다 ...", price: 5350000 },
    { id: 4, category: "가전 / 주방", title: "중고 아이폰 사실분", price: 5350000 },
    { id: 5, category: "도우미 / 기타", title: "향수 ㅇㅇ 개봉만함", price: 350000 },
    { id: 6, category: "도서 / 문구", title: "00전공서적 팝니다", price: 50000 },
  ];

  // ❤️ 각 상품별 찜 상태 관리 (id -> true/false)
  const [likedMap, setLikedMap] = useState(() => {
    const init = {};
    items.forEach((item) => {
      init[item.id] = false; // 기본: 찜 안 함
    });
    return init;
  });

  const filteredItems = items; // 일단 UI만, 필터 동작은 나중에 연결

  const handleSelectFilter = (status) => {
    setFilterStatus(status);
    setFilterOpen(false);
  };

  const toggleLike = (id) => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="mypage-root">
      <div className="mypage-wrapper">
        {/* --- 상단 헤더 --- */}
        <header className="mypage-header">
          <button onClick={() => navigate(-1)} className="mypage-back-btn">
            <img src={backIcon} alt="뒤로가기" />
          </button>

          <div className="mypage-logo-box">
            <img src={logo} className="mypage-logo" alt="logo" />
          </div>

          <button className="mypage-search-btn">
            <img src={searchIcon} alt="검색" />
          </button>
        </header>

        {/* --- 갈색 프로필 영역 --- */}
        <section className="mypage-profile-section">
          <div className="mypage-profile-top">
            <div className="mypage-profile-left">
              <img src={defaultProfile} alt="" className="mypage-profile-img" />
              <div>
                <div className="mypage-nickname">닉네임님 안녕하세요</div>
                <div className="mypage-selltext">판매수 {sellCount}</div>
              </div>
            </div>

            <div className="mypage-temperature">
              {temperature.toFixed(1)}°C
            </div>
          </div>

          <div className="mypage-temp-barwrap">
            <span className="mypage-temp-label">나눔 온기</span>
            <div className="mypage-temp-bar">
              <div
                className="mypage-temp-fill"
                style={{ width: `${Math.max(0, Math.min(temperature, 100))}%` }}
              ></div>
            </div>
          </div>

          {/* --- PNG 탭: 갈색 영역 맨 아래쪽 --- */}
          <div className="mypage-tab-png-row">
            <button
              onClick={() => setActiveTab("my")}
              className="mypage-tab-btn"
            >
              <img
                src={activeTab === "my" ? tabMyOn : tabMyOff}
                alt="내상품"
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

        {/* --- 흰색 콘텐츠 영역 시작 --- */}
        <section className="mypage-content">
          {/* 판매중 ▾ 버튼 */}
          <div className="mypage-filter-wrap">
            <button
              className="mypage-filter-btn"
              onClick={() => setFilterOpen(true)}
            >
              {filterStatus} <span className="arrow">▾</span>
            </button>
          </div>

          {/* 상품 리스트 */}
          <div className="mypage-item-grid">
            {filteredItems.map((item) => {
              const isLiked = likedMap[item.id] || false;

              return (
                <div key={item.id} className="mypage-item-card">
                  <div className="mypage-item-img" />

                  {/* ❤️ 하트 버튼: 클릭 시 채워지거나 비워짐 */}
                  <button
                    className="mypage-heart-btn"
                    aria-label="찜"
                    type="button"
                    onClick={() => toggleLike(item.id)}
                  >
                    <HeartIcon filled={isLiked} />
                  </button>

                  <div className="mypage-item-cat">{item.category}</div>
                  <div className="mypage-item-title">{item.title}</div>
                  <div className="mypage-item-price">
                    {item.price.toLocaleString()}원
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BottomNav */}
        <BottomNav />

        {/* --- 판매 상태 바텀시트 모달 --- */}
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
                    onClick={() => handleSelectFilter("판매중")}
                  >
                    판매중
                  </button>
                  <button
                    className="mypage-filter-option"
                    onClick={() => handleSelectFilter("예약중")}
                  >
                    예약중
                  </button>
                  <button
                    className="mypage-filter-option"
                    onClick={() => handleSelectFilter("판매완료")}
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

/* ====== 하트 아이콘 (빈/꽉 찬 토글) — 스타일은 CSS에서 ====== */
function HeartIcon({ filled }) {
  return filled ? (
    // 꽉 찬 하트
    <svg
      className="mypage-heart-icon-svg mypage-heart-icon-svg--filled"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ) : (
    // 빈 하트
    <svg
      className="mypage-heart-icon-svg mypage-heart-icon-svg--empty"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
