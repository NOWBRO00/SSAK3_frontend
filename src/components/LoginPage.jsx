import React, { useEffect, useState } from "react";
import "../styles/LoginPage.css";

import brand23 from "../image/Group 23.png";
import brand19 from "../image/Group 19.png";

export default function LoginPage() {
  const fallback = (e) => (e.currentTarget.src = brand19);
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  const kakaoJavascriptKey =
    process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY || process.env.REACT_APP_KAKAO_JS_KEY;
  const redirectUri =
    process.env.REACT_APP_KAKAO_REDIRECT_URI ||
    `${window.location.origin}/auth/kakao/callback`;

  useEffect(() => {
    const initializeKakao = () => {
      if (!window.Kakao) {
        console.error("Kakao SDK 로드에 실패했습니다.");
        return;
      }

      if (!window.Kakao.isInitialized()) {
        if (!kakaoJavascriptKey) {
          console.error(
            "REACT_APP_KAKAO_JAVASCRIPT_KEY(또는 구 이름 REACT_APP_KAKAO_JS_KEY) 환경 변수가 설정되지 않았습니다."
          );
          return;
        }
        window.Kakao.init(kakaoJavascriptKey);
      }
      setIsKakaoReady(true);
    };

    if (window.Kakao && window.Kakao.isInitialized()) {
      setIsKakaoReady(true);
      return;
    }

    const existingScript = document.getElementById("kakao-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", initializeKakao, { once: true });
      return () => {
        existingScript.removeEventListener("load", initializeKakao);
      };
    }

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.onload = initializeKakao;
    script.onerror = () => console.error("Kakao SDK 스크립트 로드에 실패했습니다.");
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [kakaoJavascriptKey]);

  // ✅ 카카오 로그인 처리 후 웰컴 페이지로 이동
  const handleKakaoLogin = async () => {
    try {
      if (!window.Kakao) {
        throw new Error("Kakao SDK가 준비되지 않았습니다.");
      }

      if (!isKakaoReady) {
        throw new Error("카카오 로그인을 초기화하는 중입니다. 잠시 후 다시 시도해 주세요.");
      }

      window.Kakao.Auth.authorize({
        redirectUri,
        scope: "profile_nickname,account_email",
      });
    } catch (err) {
      console.error("카카오 로그인 실패:", err);
      alert(err.message || "카카오 로그인 중 문제가 발생했습니다.");
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

              <button
                className="kakao-btn"
                type="button"
                onClick={handleKakaoLogin}
                disabled={!isKakaoReady}
              >
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
