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

// ✅ 실제 로그인 여부 확인 (localStorage의 토큰 확인)
const isLoggedIn = () => {
  const token = localStorage.getItem("ssak3.accessToken");
  return !!token; // 토큰이 있으면 로그인 상태
};

// ✅ 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  if (isLoggedIn()) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  // ✅ 401 에러 발생 시 로그인 페이지로 리다이렉트
  React.useEffect(() => {
    const handleAuthExpired = () => {
      // 이미 로그인 페이지가 아니면 리다이렉트
      if (window.location.pathname !== "/login" && 
          !window.location.pathname.includes("/auth/kakao/callback")) {
        window.location.href = "/login";
      }
    };

    window.addEventListener("authExpired", handleAuthExpired);
    
    return () => {
      window.removeEventListener("authExpired", handleAuthExpired);
    };
  }, []);

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
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />

          {/* 상품 등록 */}
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <ProductPostPage />
              </ProtectedRoute>
            }
          />

          {/* 상품 수정: /product/:id/edit → ProductPostPage 재사용 */}
          <Route
            path="/product/:id/edit"
            element={
              <ProtectedRoute>
                <ProductPostPage />
              </ProtectedRoute>
            }
          />

          {/* 채팅 리스트 / 채팅방 */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatListPage BottomNavComponent={BottomNav} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          {/* 혹시 /detail/:id 를 쓰는 곳이 있으면 같이 열어주기 */}
          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          {/* /detail 단독 진입용 (옵션) */}
          <Route
            path="/detail"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
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
