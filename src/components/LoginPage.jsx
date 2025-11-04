import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import "../styles/LoginPage.css";

import brand23 from "../image/Group 23.png";
import brand19 from "../image/Group 19.png";

export default function LoginPage() {
  const navigate = useNavigate(); // ✅ 추가
  const fallback = (e) => (e.currentTarget.src = brand19);

  // ✅ 카카오 로그인 처리 후 웰컴 페이지로 이동
  const handleKakaoLogin = async () => {
    try {
      // TODO: 여기서 실제 카카오 SDK 로그인 로직 수행
      // ex) await Kakao.Auth.authorize({ redirectUri: ... });

      // 로그인 성공했다고 가정하고 웰컴으로 이동
      navigate("/welcome");
    } catch (err) {
      console.error("카카오 로그인 실패:", err);
      // 실패 시 처리(알림 등) 필요하면 여기에
    }
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* 상단바: 좌측 로고 */}
        <header className="m-topbar">
          <img
            src={brand23}
            onError={fallback}
            alt="ssaksseuri"
            className="topbar-logo"
          />
        </header>

        {/* 본문: 카드 정중앙 */}
        <main className="m-main">
          <section className="m-card" role="dialog" aria-labelledby="login-title">
            {/* 닫기(X) */}
            <button className="m-close" aria-label="닫기" type="button" />

            {/* 카드 내용 덩어리 */}
            <div className="card-body">
              <img
                className="brand-hero"
                alt="ssaksseuri"
                src={brand23}
                onError={fallback}
              />

              <h1 id="login-title" className="m-headline">
                카카오로 <span className="m-accent">싹쓰리</span> 시작하기
              </h1>

              <p className="m-sub">간편하게 가입하고 원하는 상품을 확인하세요.</p>

              <hr className="m-divider" />

              <div className="m-bubble">SNS 로그인으로 쉽게 가입해 보세요!</div>

              {/* ✅ 클릭 시 /welcome 이동 */}
              <button className="kakao-btn" type="button" onClick={handleKakaoLogin}>
                <span className="kakao-icon" aria-hidden="true" />
                <span className="kakao-text">카카오 로그인</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
