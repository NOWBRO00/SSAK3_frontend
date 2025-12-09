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
 * 백엔드 카테고리 이름을 프론트엔드 표시 이름으로 변환
 * - "도서" -> "도서 / 문구"
 * - "전자제품" -> "가전 / 주방"
 * - "가구" -> "도우미 / 기타"
 * - "의류" -> "의류"
 * 
 * @param {string} backendCategoryName - 백엔드에서 받은 카테고리 이름
 * @returns {string} 프론트엔드 표시 이름
 */
export function formatCategoryName(backendCategoryName) {
  if (!backendCategoryName) return "";
  
  // 백엔드 카테고리 이름 -> 프론트 코드 매핑
  const BACKEND_CATEGORY_MAP = {
    "의류": "clothes",
    "도서": "books",
    "도서 / 문구": "books",
    "전자제품": "appliances",
    "가전 / 주방": "appliances",
    "가구": "helper",
    "도우미 / 기타": "helper",
  };
  
  const code = BACKEND_CATEGORY_MAP[backendCategoryName];
  if (code && CATEGORY_INFO[code]) {
    return CATEGORY_INFO[code].label;
  }
  
  // 매핑되지 않은 경우 원본 반환
  return backendCategoryName;
}

/**
 * 상품 단건 조회
 */
export const getProduct = (id) => api(`/api/products/${id}`);

/**
 * 상품 리스트 조회
 *  - categoryId가 있으면 /api/products/category/{categoryId} 사용
 *  - keyword가 있으면 /api/products/search?keyword={keyword} 사용
 *  - 그 외에는 /api/products 사용
 */
export const getProducts = (params = {}) => {
  // categoryId가 있으면 백엔드의 /api/products/category/{categoryId} 엔드포인트 사용
  if (params.categoryId) {
    const url = `/api/products/category/${params.categoryId}`;
    console.log(`[getProducts] 카테고리별 조회:`, url, { categoryId: params.categoryId });
    return api(url);
  }
  
  // keyword가 있으면 검색 API 사용
  if (params.keyword) {
    const url = `/api/products/search?keyword=${encodeURIComponent(params.keyword)}`;
    console.log(`[getProducts] 키워드 검색:`, url, { keyword: params.keyword });
    return api(url);
  }
  
  // 그 외에는 전체 상품 조회
  const url = `/api/products`;
  console.log(`[getProducts] 전체 상품 조회:`, url);
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


