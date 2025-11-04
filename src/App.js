import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import WelcomePage from "./components/WelcomePage";
import MainPage from "./components/MainPage";
import MyPage from "./components/MyPage";
import ProductPostPage from "./components/ProductPostPage"; // ✅ 상품등록 페이지 추가

function App() {
  // 로그인 여부는 필요 시 상태로 교체 false로 바꾸기 임시로 트루로함
  const isLoggedIn = true;

  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 진입 → 로그인 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 로그인 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 로그인 성공 후 환영 페이지 */}
        <Route path="/welcome" element={<WelcomePage />} />

        {/* 메인 페이지 */}
        <Route
          path="/home"
          element={isLoggedIn ? <MainPage /> : <Navigate to="/login" replace />}
        />

        {/* 마이페이지 */}
        <Route
          path="/mypage"
          element={isLoggedIn ? <MyPage /> : <Navigate to="/login" replace />}
        />

        {/* ✅ 상품등록 페이지 추가 */}
        <Route
          path="/post"
          element={
            isLoggedIn ? (
              <ProductPostPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 그 외 → 로그인 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
