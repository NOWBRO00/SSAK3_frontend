import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

// API URL 생성 - 개발/프로덕션 모두 절대 경로 사용
// 프록시가 작동하지 않을 경우를 대비해 절대 경로 사용
const getApiUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};

const CALLBACK_STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export default function KakaoCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(CALLBACK_STATUS.LOADING);
  const [message, setMessage] = useState("카카오 로그인 중입니다...");
  const executedRef = useRef(false); // Strict Mode 중복 실행 방지

  const code = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("code");
  }, [location.search]);

  const kakaoError = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("error");
  }, [location.search]);

  useEffect(() => {
    // ✅ Strict Mode 중복 실행 방지: 한 번만 실행
    if (executedRef.current) {
      return;
    }

    if (kakaoError) {
      setStatus(CALLBACK_STATUS.ERROR);
      setMessage(`카카오 인증이 거부되었습니다. (${kakaoError})`);
      return;
    }

    if (!code) {
      setStatus(CALLBACK_STATUS.ERROR);
      setMessage("카카오 인가 코드가 전달되지 않았습니다.");
      return;
    }

    // 이미 로그인 성공한 경우 (토큰이 있으면) 바로 이동
    if (localStorage.getItem("ssak3.accessToken")) {
      navigate("/welcome", { replace: true });
      return;
    }

    executedRef.current = true; // 실행 표시 (한 번만 실행)

    const exchangeCode = async () => {
      try {
        setStatus(CALLBACK_STATUS.LOADING);
        setMessage("카카오 토큰을 발급받는 중입니다...");

        // POST /api/auth/kakao - 백엔드 REST API 엔드포인트
        const response = await fetch(getApiUrl("/api/auth/kakao"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          // 502 에러는 첫 번째 요청 실패일 수 있으므로 조용히 무시
          // Strict Mode로 인한 중복 요청에서 첫 번째가 502면 두 번째 성공을 기다림
          if (response.status === 502) {
            // 502는 조용히 무시하고 종료 (두 번째 요청이 성공할 수 있음)
            return;
          }

          let errorMessage = "카카오 로그인에 실패했습니다.";
          try {
            const errorData = await response.json();
            // 백엔드에서 { code, message } 형식으로 에러를 보낼 경우
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === "string") {
              errorMessage = errorData;
            }
          } catch {
            // JSON 파싱 실패 시 텍스트로 처리
            const errorText = await response.text();
            try {
              const parsed = JSON.parse(errorText);
              errorMessage = parsed.message || parsed.error || errorText;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
          
          // HTTP 상태 코드에 따른 추가 정보
          if (response.status === 401) {
            errorMessage = "카카오 인증에 실패했습니다. 백엔드의 카카오 REST API 키를 확인해주세요.";
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // 백엔드 응답: accessToken, refreshToken (UUID 기반), profile
        // profile 구조: { id, nickname, email, profileImage }
        // 주의: profile.id는 카카오 ID일 수 있고, 백엔드 사용자 ID일 수도 있음
        if (data?.accessToken) {
          localStorage.setItem("ssak3.accessToken", data.accessToken);
        }
        if (data?.refreshToken) {
          localStorage.setItem("ssak3.refreshToken", data.refreshToken);
        }
        if (data?.profile) {
          // profile: { id, nickname, email, profileImage }
          localStorage.setItem("ssak3.profile", JSON.stringify(data.profile));
        }

        setStatus(CALLBACK_STATUS.SUCCESS);
        setMessage("카카오 로그인에 성공했습니다. 메인 화면으로 이동합니다.");

        setTimeout(() => {
          navigate("/welcome", { replace: true });
        }, 1000);
      } catch (error) {
        setStatus(CALLBACK_STATUS.ERROR);
        setMessage(error.message || "카카오 로그인 처리 중 오류가 발생했습니다.");
        // 에러 발생 시에도 executedRef는 유지 (재시도 방지)
      }
    };

    exchangeCode();
  }, [code, kakaoError, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "center",
        padding: "24px",
        backgroundColor: "#f8f8f8",
      }}
    >
      <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>카카오 로그인</h1>
      <p style={{ fontSize: "16px", color: "#555" }}>{message}</p>
      {status === CALLBACK_STATUS.ERROR && (
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#fee500",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          로그인 화면으로 돌아가기
        </button>
      )}
    </div>
  );
}

