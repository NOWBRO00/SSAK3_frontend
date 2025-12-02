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

        // 백엔드 응답 구조:
        // { accessToken, refreshToken, profile: { id: DB_PK, kakaoId: 카카오ID, nickname, email, ... } }
        // 또는 직접 { id: DB_PK, kakaoId: 카카오ID, nickname, ... } 형식일 수 있음
        
        // 토큰 먼저 저장 (이후 API 호출에 필요)
        if (data?.accessToken) {
          localStorage.setItem("ssak3.accessToken", data.accessToken);
        }
        if (data?.refreshToken) {
          localStorage.setItem("ssak3.refreshToken", data.refreshToken);
        }
        
        // 프로필 저장: DB PK(id)와 카카오 ID(kakaoId) 분리 저장
        if (data?.profile || data?.id) {
          const profile = data.profile || data;
          
          // 백엔드 응답 구조 확인:
          // 백엔드 로그: "구매자 조회 성공: id=1, kakaoId=4474375438"
          // 즉, 백엔드가 DB PK(id=1)와 카카오 ID(kakaoId=4474375438)를 모두 제공함
          
          // 백엔드가 명시적으로 kakaoId를 제공하는지 확인
          const hasKakaoId = profile.kakaoId !== undefined && profile.kakaoId !== null;
          
          // DB PK와 카카오 ID 분리
          let dbPk = null;
          let kakaoId = null;
          
          if (hasKakaoId) {
            // 백엔드가 명시적으로 kakaoId를 제공하는 경우
            dbPk = profile.id; // id는 DB PK
            kakaoId = profile.kakaoId; // kakaoId는 카카오 ID
          } else if (profile.id && profile.id < 1000000) {
            // id가 작은 숫자면 DB PK로 간주
            dbPk = profile.id;
            kakaoId = null; // kakaoId는 알 수 없음
          } else {
            // id가 큰 숫자면 카카오 ID로 간주 (하위 호환)
            // 이 경우 백엔드에서 DB PK를 가져와야 함
            kakaoId = profile.id;
            dbPk = null; // DB PK는 백엔드에서 가져와야 함
          }
          
          // DB PK가 없으면 백엔드에서 가져오기 시도 (토큰 저장 후)
          if (!dbPk && kakaoId && data?.accessToken) {
            try {
              // 방법 1: /api/users/kakao/{kakaoId}로 시도 (카카오 ID로 사용자 조회)
              let userRes = await fetch(getApiUrl(`/api/users/kakao/${kakaoId}`), {
                method: "GET",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              
              if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.id && userData.id < 1000000) {
                  // DB PK 찾음
                  dbPk = userData.id;
                  if (process.env.NODE_ENV === "development") {
                    console.log("[카카오 로그인] /api/users/kakao/{kakaoId}에서 DB PK 조회 성공:", dbPk);
                  }
                }
              } else {
                // 방법 2: /api/users/me로 시도 (현재 로그인한 사용자)
                if (process.env.NODE_ENV === "development") {
                  console.log("[카카오 로그인] /api/users/kakao/{kakaoId} 실패, /api/users/me 시도:", userRes.status);
                }
                
                userRes = await fetch(getApiUrl("/api/users/me"), {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                
                if (userRes.ok) {
                  const userData = await userRes.json();
                  if (userData.id && userData.id < 1000000) {
                    // DB PK 찾음
                    dbPk = userData.id;
                    if (process.env.NODE_ENV === "development") {
                      console.log("[카카오 로그인] /api/users/me에서 DB PK 조회 성공:", dbPk);
                    }
                  }
                } else {
                  // 모든 방법 실패 - 카카오 ID 사용 (백엔드가 카카오 ID로도 처리 가능)
                  if (process.env.NODE_ENV === "development") {
                    console.warn("[카카오 로그인] 모든 DB PK 조회 방법 실패. 카카오 ID 사용:", kakaoId, userRes.status);
                  }
                }
              }
            } catch (e) {
              // 네트워크 오류 등 - 카카오 ID 사용 (백엔드가 카카오 ID로도 처리 가능)
              if (process.env.NODE_ENV === "development") {
                console.warn("[카카오 로그인] DB PK 조회 중 오류 발생, 카카오 ID 사용:", kakaoId, e);
              }
            }
          }
          
          const profileToSave = {
            id: dbPk || kakaoId, // DB PK가 있으면 사용, 없으면 카카오 ID (하위 호환)
            kakaoId: kakaoId || dbPk, // 카카오 ID가 있으면 사용, 없으면 id 사용 (하위 호환)
            nickname: profile.nickname,
            email: profile.email,
            profileImageUrl: profile.profileImageUrl || profile.profileImage,
            thumbnailImageUrl: profile.thumbnailImageUrl || profile.thumbnailImage,
          };
          
          localStorage.setItem("ssak3.profile", JSON.stringify(profileToSave));
          
          if (process.env.NODE_ENV === "development") {
            console.log("[카카오 로그인] 백엔드 응답:", data);
            console.log("[카카오 로그인] 프로필 저장:", {
              id: profileToSave.id,        // DB PK (또는 카카오 ID)
              kakaoId: profileToSave.kakaoId, // 카카오 ID
              nickname: profileToSave.nickname,
              originalProfile: profile,
              dbPkFound: !!dbPk,
            });
          }
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

