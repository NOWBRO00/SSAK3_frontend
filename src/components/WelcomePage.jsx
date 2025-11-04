import React from "react";
import { useNavigate } from "react-router-dom";

import confetti from "../image/1.png";                          // 축포 이미지
import bear from "../image/flamel-ai-edit-1982838-2-2-2.png";   // 곰돌이
import logo from "../image/Group 23.png";                      // 상단 로고

import "../styles/WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* 상단바 */}
        <header className="m-topbar">
          <img className="topbar-logo" alt="싹쓰리 로고" src={logo} />
        </header>

        {/* 본문 */}
        <main className="welcome">
          {/* 히어로 영역 */}
          <div className="hero">
            <h1 className="hero-title">환영합니다!</h1>

            <img className="hero-bg" src={confetti} alt="축포" />
            <img className="hero-bear" src={bear} alt="환영 캐릭터" />
            <span className="hero-shadow" aria-hidden="true" />
          </div>

          <p className="desc">
            캠퍼스 내 알뜰한 중고거래,<br />
            <strong>싹쓰리</strong>에서 필요한 물건을 찾고 나누는 즐거움을<br />
            지금 바로 시작해 보세요!
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("/home")}
          >
            시작하기
          </button>
        </main>
      </div>
    </div>
  );
}
