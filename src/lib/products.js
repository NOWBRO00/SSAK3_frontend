// src/lib/products.js

import { api, BASE_URL } from "./api";

/**
 * 프론트 카테고리 코드 기준 정보
 * - code: clothes / books / appliances / helper
 * - id: 백엔드 categoryId (숫자)
 * - label: 화면에 보여줄 한글 이름
 */
export const CATEGORY_INFO = {
  clothes: { id: 1, label: "의류" },
  books: { id: 2, label: "도서 / 문구" },
  appliances: { id: 3, label: "가전 / 주방" },
  helper: { id: 4, label: "도우미 / 기타" },
};

// 한글 라벨 → 코드 역매핑
const LABEL_TO_CODE = Object.entries(CATEGORY_INFO).reduce(
  (acc, [code, { label }]) => {
    acc[label] = code;
    return acc;
  },
  {}
);

/**
 * 라우트 파라미터(영문코드 또는 한글 라벨)를
 * 내부에서 쓰기 쉬운 형태로 변환
 *
 * @param {string} param - URL의 :name (예: "clothes" 또는 "의류")
 * @returns {{ code: string, id: number, label: string }}
 */
export function resolveCategoryFromParam(param) {
  const decoded = decodeURIComponent(param || "");

  let code;

  // 1) clothes / books / appliances / helper 같은 코드로 들어온 경우
  if (decoded && CATEGORY_INFO[decoded]) {
    code = decoded;
  }
  // 2) "의류" / "도서 / 문구" 같은 한글 라벨로 들어온 경우
  else if (decoded && LABEL_TO_CODE[decoded]) {
    code = LABEL_TO_CODE[decoded];
  }
  // 3) 그 외에는 기본값
  else {
    code = "clothes";
  }

  const { id, label } = CATEGORY_INFO[code];
  return { code, id, label };
}

export function getCategoryIdByCode(code) {
  return CATEGORY_INFO[code]?.id ?? null;
}

export function getCategoryLabelByCode(code) {
  return CATEGORY_INFO[code]?.label ?? "";
}

/**
 * 상품 단건 조회
 */
export const getProduct = (id) => api(`/api/products/${id}`);

/**
 * 상품 리스트 조회
 *  - categoryId, keyword, page, size 등 쿼리 파라미터 지원
 */
export const getProducts = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.page) searchParams.set("page", params.page);
  if (params.size) searchParams.set("size", params.size);

  const qs = searchParams.toString();
  const url = `/api/products${qs ? `?${qs}` : ""}`;
  
  // 디버깅: API 호출 URL 로그
  console.log(`[getProducts] API 호출:`, url, { params });
  
  return api(url);
};

/**
 * 라우트 파라미터 기준으로 카테고리 상품 조회
 */
export const getProductsByCategoryParam = (categoryParam) => {
  const { id } = resolveCategoryFromParam(categoryParam);
  return getProducts({ categoryId: id });
};

/**
 * 이미지 경로를 절대 URL로 변환
 *  - 백엔드에서 "/uploads/xxx.jpg"처럼 내려줄 때 사용
 */
export function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * 백엔드에서 카테고리 목록 가져오기
 */
export const getCategories = async () => {
  try {
    const categories = await api("/api/categories");
    return Array.isArray(categories) ? categories : [];
  } catch (e) {
    console.error("[카테고리 목록] 조회 실패:", e);
    return [];
  }
};

// 필요하면 외부에서 BASE_URL도 재사용 가능하게 export
export { BASE_URL };


