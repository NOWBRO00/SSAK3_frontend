// src/data/mockProducts.js

// 전체 더미 상품 목록 (백엔드 붙기 전까지 여기만 수정해서 공통 사용)
export const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "썸플레이스 후드 바람막이 중고",
    description:
      "산 이후로 몇 번 안 탔던 바람막이입니다.\n가격 네고 가능해요.\n○○ 근처 편의점에서 직거래 원해요.",
    price: 52800,
    status: "판매중", // 판매중 | 예약중 | 판매완료
    category: "의류",
    thumbnail: "https://picsum.photos/300?10",
    images: [
      "https://picsum.photos/800/800?101",
      "https://picsum.photos/800/800?102",
    ],
    seller: {
      id: "u1",
      nickname: "닉네임12345",
      profile_image_url: "",
      mannerTemperature: 55.7,
    },
    likes: 0,
    isWishlisted: false,
    createdAt: "2025-01-03T08:00:00Z",
    tags: ["search", "recommended", "mypage"], // 어디에서 쓸지 표시
  },

  {
    id: 2,
    title: "중고 소형 전자레인지 팔아요",
    description:
      "기숙사에서 사용하던 전자레인지입니다.\n사용감 있지만 정상 작동합니다.",
    price: 35000,
    status: "예약중",
    category: "가전 / 주방",
    thumbnail: "https://picsum.photos/300?20",
    images: ["https://picsum.photos/800/800?201"],
    seller: {
      id: "u2",
      nickname: "닉네임89",
      profile_image_url: "",
      mannerTemperature: 48.2,
    },
    likes: 0,
    isWishlisted: true,
    createdAt: "2025-01-02T09:30:00Z",
    tags: ["search", "liked", "mypage"],
  },

  {
    id: 3,
    title: "전공책 세트 판매합니다",
    description:
      "전공 필수 과목 책들입니다.\n필기 살짝 있고, 상태는 양호해요.",
    price: 50000,
    status: "판매완료",
    category: "도서 / 문구",
    thumbnail: "https://picsum.photos/300?30",
    images: ["https://picsum.photos/800/800?301"],
    seller: {
      id: "u3",
      nickname: "책정리중",
      profile_image_url: "",
      mannerTemperature: 62.3,
    },
    likes: 0,
    isWishlisted: false,
    createdAt: "2025-01-01T10:00:00Z",
    tags: ["search", "mypage"],
  },
];
