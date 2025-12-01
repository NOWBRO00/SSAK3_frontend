// API 기본 URL 설정
// 개발 환경: http://localhost:8080
// 프로덕션: 환경 변수에서 가져오기
let API_BASE_URL;

if (process.env.REACT_APP_API_URL) {
  API_BASE_URL = process.env.REACT_APP_API_URL;
} else if (process.env.NODE_ENV === "production") {
  API_BASE_URL = "https://ssak3-backend-1.onrender.com";
} else {
  API_BASE_URL = "http://localhost:8080";
}

export default API_BASE_URL;

