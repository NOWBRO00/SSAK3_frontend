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
import ProductDetailPage from "./components/ProductDetailPage";   // ✅ 상세페이지 추가

import { UnreadProvider } from "./state/UnreadContext";

function App() {
  const isLoggedIn = true;

  return (
    <UnreadProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />

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
            element={isLoggedIn ? <ProductPostPage /> : <Navigate to="/login" replace />}
          />

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
            element={isLoggedIn ? <ChatRoomPage /> : <Navigate to="/login" replace />}
          />

          <Route path="/search" element={<SearchPage />} />

          {/* ✅ 카테고리 */}
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:name" element={<CategoryPage />} />

          {/* ✅ 상품 상세 */}
          <Route
            path="/detail"
            element={isLoggedIn ? <ProductDetailPage /> : <Navigate to="/login" replace />}
          />
          {/* 나중에 아이디까지 쓰고 싶으면 /detail/:id 도 하나 더 추가하면 됨 */}

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UnreadProvider>
  );
}

export default App;
