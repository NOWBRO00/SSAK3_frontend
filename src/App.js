// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import WelcomePage from "./components/WelcomePage";
import MainPage from "./components/MainPage";
import MyPage from "./components/MyPage";
import ProductPostPage from "./components/ProductPostPage";
import ChatListPage from "./components/ChatListPage";
import ChatRoomPage from "./components/ChatRoomPage";
import CategoryPage from "./components/CategoryPage";
import BottomNav from "./components/BottomNav";
import SearchPage from "./components/SearchPage";
import ProductDetailPage from "./components/ProductDetailPage";
import KakaoCallbackPage from "./components/KakaoCallbackPage"; // ✅ 카카오 로그인 콜백 유지

import { UnreadProvider } from "./state/UnreadContext";

function App() {
  // ✅ 실제 로그인 여부 확인 (localStorage의 토큰 확인)
  const isLoggedIn = () => {
    const token = localStorage.getItem("ssak3.accessToken");
    return !!token; // 토큰이 있으면 로그인 상태
  };
  
  const loggedIn = isLoggedIn();

  return (
    <UnreadProvider>
      <BrowserRouter>
        <Routes>
          {/* 기본 진입: 로그인으로 이동 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 인증 불필요 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
          <Route path="/welcome" element={<WelcomePage />} />

          {/* 메인 / 마이페이지 */}
          <Route
            path="/home"
            element={
              loggedIn ? <MainPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/mypage"
            element={
              loggedIn ? <MyPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 상품 등록 */}
          <Route
            path="/post"
            element={
              loggedIn ? <ProductPostPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 상품 수정: /product/:id/edit → ProductPostPage 재사용 */}
          <Route
            path="/product/:id/edit"
            element={
              loggedIn ? <ProductPostPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 채팅 리스트 / 채팅방 */}
          <Route
            path="/chat"
            element={
              loggedIn ? (
                <ChatListPage BottomNavComponent={BottomNav} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              loggedIn ? <ChatRoomPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 검색 */}
          <Route path="/search" element={<SearchPage />} />

          {/* 카테고리 */}
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:name" element={<CategoryPage />} />

          {/* 상품 상세 */}
          <Route
            path="/product/:id"
            element={
              loggedIn ? (
                <ProductDetailPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* 혹시 /detail/:id 를 쓰는 곳이 있으면 같이 열어주기 */}
          <Route
            path="/detail/:id"
            element={
              loggedIn ? (
                <ProductDetailPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* /detail 단독 진입용 (옵션) */}
          <Route
            path="/detail"
            element={
              loggedIn ? (
                <ProductDetailPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 나머지 모든 경로는 로그인으로 보냄 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UnreadProvider>
  );
}

export default App;
