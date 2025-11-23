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
import ProductDetailPage from "./components/ProductDetailPage"; // ✅ 상세페이지

import { UnreadProvider } from "./state/UnreadContext";

function App() {
  // TODO: 나중에 실제 로그인 여부로 교체
  const isLoggedIn = true;

  return (
    <UnreadProvider>
      <BrowserRouter>
        <Routes>
          {/* 기본 진입은 로그인으로 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 인증 필요 없는 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />

          {/* 메인 / 마이 / 글쓰기 */}
          <Route
            path="/home"
            element={isLoggedIn ? <MainPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/mypage"
            element={isLoggedIn ? <MyPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/post"
            element={
              isLoggedIn ? <ProductPostPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 채팅 리스트 / 채팅방 */}
          <Route
            path="/chat"
            element={
              isLoggedIn ? (
                <ChatListPage BottomNavComponent={BottomNav} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              isLoggedIn ? <ChatRoomPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 검색 */}
          <Route path="/search" element={<SearchPage />} />

          {/* 카테고리 */}
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:name" element={<CategoryPage />} />

          {/* ✅ 상품 상세페이지
              - /product/:id 로 주로 사용할 것
              - /detail/:id 도 같이 열리게 해 둠 (혹시 다른 곳에서 이 경로를 쓰고 있을 수 있어서)
          */}
          <Route
            path="/product/:id"
            element={
              isLoggedIn ? <ProductDetailPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/detail/:id"
            element={
              isLoggedIn ? <ProductDetailPage /> : <Navigate to="/login" replace />
            }
          />
          {/* (선택) /detail 로만 들어오면 id 없는 버전도 열어주고 싶으면 아래 유지 */}
          <Route
            path="/detail"
            element={
              isLoggedIn ? <ProductDetailPage /> : <Navigate to="/login" replace />
            }
          />

          {/* 나머지는 전부 로그인으로 보냄 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UnreadProvider>
  );
}

export default App;
