// src/components/MyPage.jsx
import React, { useState, useMemo } from "react";
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

export default function MyPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my");
  const [filterOpen, setFilterOpen] = useState(false);
  // ✅ 상태값: "판매중" | "예약중" | "판매완료"
  const [filterStatus, setFilterStatus] = useState("판매중");

  const temperature = 55.7;
  const sellCount = 12;
  const nickname = "닉네임님안녕하세요";

  // ✅ 임시 상품 데이터 (status 통일)
  const [items, setItems] = useState([
    {
      id: 1,
      category: "가전 / 주방",
      title: "00자전거 팝니다 ...",
      price: 5350000,
      status: "판매중",
      wished: true,
      img: "https://picsum.photos/300?1",
    },
    {
      id: 2,
      category: "의류",
      title: "옷 사실 분~~",
      price: 500,
      status: "판매중",
      wished: false,
      img: "https://picsum.photos/300?2",
    },
    {
      id: 3,
      category: "가전 / 주방",
      title: "00자전거 팝니다 ...",
      price: 5350000,
      status: "예약중",
      wished: true,
      img: "https://picsum.photos/300?3",
    },
    {
      id: 4,
      category: "가전 / 주방",
      title: "중고 아이폰 사실분",
      price: 5350000,
      status: "판매완료",
      wished: false,
      img: "https://picsum.photos/300?4",
    },
    {
      id: 5,
      category: "도우미 / 기타",
      title: "향수 ㅇㅇ 개봉만함",
      price: 350000,
      status: "판매중",
      wished: true,
      img: "https://picsum.photos/300?5",
    },
    {
      id: 6,
      category: "도서 / 문구",
      title: "00전공서적 팝니다",
      price: 50000,
      status: "판매중",
      wished: false,
      img: "https://picsum.photos/300?6",
    },
  ]);

  const myItems = items;
  const wishItems = useMemo(
    () => items.filter((item) => item.wished),
    [items]
  );

  const baseList = activeTab === "my" ? myItems : wishItems;

  // ✅ 선택된 상태만 필터링
  const filteredItems = baseList.filter(
    (item) => item.status === filterStatus
  );

  const productCount = myItems.length;
  const wishCount = wishItems.length;

  const countLabel = activeTab === "my" ? "상품" : "찜";
  const countValue = activeTab === "my" ? productCount : wishCount;

  const handleSelectFilter = (status) => {
    setFilterStatus(status);
    setFilterOpen(false);
  };

  const toggleLike = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, wished: !item.wished } : item
      )
    );
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
                src={defaultProfile}
                alt=""
                className="mypage-profile-img"
              />
              <div>
                <div className="mypage-nickname">{nickname}</div>
                <div className="mypage-selltext">판매수 {sellCount}</div>
              </div>
            </div>
          </div>

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
              {filterStatus} <span className="arrow">▾</span>
            </button>
          </div>

          {/* 리스트 */}
          <div className="mypage-item-grid">
            {filteredItems.map((item) => {
              const isLiked = !!item.wished;

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
                        item.status === "예약중" || item.status === "판매완료"
                          ? "mypage-card-img gray"
                          : "mypage-card-img"
                      }
                    />

                    {/* 상태 스티커 (예약중 / 판매완료) */}
                    {item.status === "예약중" && (
                      <img
                        src={stickerReserved}
                        alt="예약중"
                        className="mypage-status-sticker"
                      />
                    )}

                    {item.status === "판매완료" && (
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
                        e.stopPropagation(); // 카드 전체 클릭(상세 이동) 막기
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
