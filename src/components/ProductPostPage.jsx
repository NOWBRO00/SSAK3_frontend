// src/components/ProductPostPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ProductPostPage.css";
import galleryIcon from "../image/gallery1.png";
import BottomNav from "./BottomNav";

// ✅ api.js에서 BASE_URL 가져오기
import { BASE_URL } from "../lib/api";

// ✅ 실제로 사용할 API_BASE
const API_BASE = BASE_URL;

// 프론트 카테고리 코드 -> 백엔드 categoryId(숫자) 매핑
const CATEGORY_ID_MAP = {
  clothes: 1, // 의류
  books: 2, // 도서 / 문구
  appliances: 3, // 가전 / 주방
  helper: 4, // 도우미 / 기타
};

// 백엔드 categoryName -> 프론트 코드 매핑 (수정 모드에서 사용)
const CATEGORY_CODE_MAP = {
  "의류": "clothes",
  "도서 / 문구": "books",
  "가전 / 주방": "appliances",
  "도우미 / 기타": "helper",
};

// 프론트 코드 -> 백엔드 categoryName 매핑 (등록 모드에서 사용)
const CATEGORY_NAME_MAP = {
  "clothes": "의류",
  "books": "도서 / 문구",
  "appliances": "가전 / 주방",
  "helper": "도우미 / 기타",
};

// ✅ 판매자 ID 가져오기 (카카오 로그인)
const getSellerId = () => {
  try {
    const profileStr = localStorage.getItem("ssak3.profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.id;
    }
  } catch (e) {
    console.error("프로필 파싱 실패:", e);
  }
  return null;
};

export default function ProductPostPage() {
  const { id } = useParams(); // /product/:id/edit 인 경우 id 존재
  const navigate = useNavigate();
  const isEdit = !!id; // true면 수정 모드, false면 등록 모드

  // 상태값들
  const [images, setImages] = useState([]); // [{ file, previewUrl, isExisting? }]
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); // clothes / books / appliances / helper
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [categoryMap, setCategoryMap] = useState({}); // { "의류": 1, "도서 / 문구": 2, ... }

  const stripRef = useRef(null);

  // =========================
  // ✅ 카테고리 목록 가져오기 (백엔드에서 동적으로)
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) {
          console.warn("카테고리 목록 가져오기 실패, 기본값 사용");
          return;
        }
        const categories = await res.json();
        
        // 카테고리 이름 -> ID 매핑 생성
        const map = {};
        categories.forEach((cat) => {
          if (cat.name && cat.id) {
            map[cat.name] = cat.id;
          }
        });
        setCategoryMap(map);
        console.log("✅ 카테고리 매핑:", map);
      } catch (e) {
        console.error("카테고리 목록 가져오기 오류:", e);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // ✅ 수정 모드: 기존 상품 불러오기
  // =========================
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("상품 조회 실패");
        const raw = await res.json();

        setTitle(raw.title ?? "");
        setDetails(raw.description ?? "");
        setPrice(
          raw.price !== undefined && raw.price !== null
            ? String(raw.price)
            : ""
        );

        const code = raw.categoryName
          ? CATEGORY_CODE_MAP[raw.categoryName] || ""
          : "";
        setCategory(code);

        // 기존 이미지 → 프리뷰용 세팅
        if (Array.isArray(raw.imageUrls)) {
          const previewItems = raw.imageUrls.map((path) => {
            const fullUrl = path?.startsWith("http")
              ? path
              : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
            return {
              file: null, // 기존 이미지는 File 없음
              previewUrl: fullUrl,
              isExisting: true,
            };
          });
          setImages(previewItems);
        }
      } catch (e) {
        console.error(e);
        alert("상품 정보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isEdit, id]);

  // =========================
  // ✅ 이미지 업로드 (최대 5장)
  // =========================
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert("이미지는 최대 5장까지 업로드 가능합니다.");
      return;
    }

    const newItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);

    // 마지막 이미지 쪽으로 스크롤
    requestAnimationFrame(() => {
      if (stripRef.current) {
        stripRef.current.scrollTo({
          left: stripRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    });
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const target = prev[idx];
      if (target && target.previewUrl && !target.isExisting) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  // =========================
  // ✅ 등록 / 수정 공통 submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    if (!price.trim()) {
      alert("가격을 입력해 주세요.");
      return;
    }
    if (!category) {
      alert("카테고리를 선택해 주세요.");
      return;
    }
    if (!isEdit && images.length === 0) {
      alert("상품 이미지를 한 장 이상 업로드해 주세요.");
      return;
    }

    const numericPrice = Number(price.replace(/[^0-9]/g, "") || 0);

    try {
      if (isEdit) {
        // ✏️ 수정 모드: PUT /api/products/{id}
        const payload = {
          title: title.trim(),
          description: details.trim(),
          price: numericPrice,
          // status 등 나중에 필요하면 추가
        };

        console.log("✏️ [수정] 전송 payload:", payload);

        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("상품 수정 실패");

        alert("상품이 수정되었습니다.");
        navigate(`/product/${id}`);
      } else {
        // 🆕 신규 등록: POST /api/products/with-upload
        const formData = new FormData();

        // ✅ 카테고리 코드(clothes, books 등) -> 한글 이름 -> ID 찾기
        const categoryName = CATEGORY_NAME_MAP[category];
        
        if (!categoryName) {
          console.error("카테고리 이름 변환 실패:", category);
          alert("카테고리를 다시 선택해주세요.");
          return;
        }

        const categoryId = categoryMap[categoryName];

        if (!categoryId) {
          console.error("카테고리 ID 매핑 실패:", { category, categoryName, categoryMap });
          alert("카테고리 ID를 찾을 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.");
          return;
        }

        console.log("✅ 카테고리 매핑 성공:", { category, categoryName, categoryId });

        const sellerId = getSellerId();
        if (!sellerId) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        formData.append("title", title.trim());
        formData.append("price", numericPrice); // Number
        formData.append("description", details.trim());
        formData.append("categoryId", categoryId); // Number 1~4
        formData.append("sellerId", sellerId); // Number

        // ✅ 여러 개면 루프 돌려서 images append
        images.forEach((item) => {
          if (item.file) {
            formData.append("images", item.file);
          }
        });

        // 디버깅용: 실제 전송 값 확인
        for (const [key, value] of formData.entries()) {
          console.log("📦 [등록] FormData:", key, value);
        }

        console.log(
          "🆕 [등록] FormData 전송 예정:",
          `${API_BASE}/api/products/with-upload`
        );

        const res = await fetch(`${API_BASE}/api/products/with-upload`, {
          method: "POST",
          body: formData, // FormData는 Content-Type 자동 설정
        });

        const text = await res.text();
        console.log("📥 [등록] 응답 status:", res.status);
        console.log("📥 [등록] 응답 body:", text);

        if (!res.ok) {
          throw new Error("상품 등록 실패");
        }

        let created;
        try {
          created = JSON.parse(text);
        } catch {
          created = null;
        }

        console.log("✅ 등록 결과:", created);

        alert("상품이 등록되었습니다.");
        if (created?.id) {
          navigate(`/product/${created.id}`);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        isEdit
          ? "상품 수정 중 오류가 발생했습니다."
          : "상품 등록 중 오류가 발생했습니다."
      );
    }
  };

  // =========================
  // 로딩 화면
  // =========================
  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-frame">
          <header className="post-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ←
            </button>
            <h1>상품 {isEdit ? "수정하기" : "등록하기"}</h1>
            <span />
          </header>
          <main className="post-main">
            <div>불러오는 중...</div>
          </main>
          <BottomNav />
        </div>
      </div>
    );
  }

  // =========================
  // 실제 화면 렌더링
  // =========================
  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="post-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>상품 {isEdit ? "수정하기" : "등록하기"}</h1>
          <span />
        </header>

        <main className="post-main">
          <form onSubmit={handleSubmit}>
            {/* 이미지 업로드 */}
            <section className="image-upload-section">
              <div className="section-title">
                상품 이미지{" "}
                <span className="limit-text">
                  <b>*</b>최대 5장까지 올릴 수 있습니다.
                  {isEdit && " (이미지 수정은 추후 API에 맞춰 구현 예정)"}
                </span>
              </div>

              <div className="image-carousel">
                <div className="image-strip" ref={stripRef}>
                  {images.length < 5 && (
                    <label className="upload-thumb">
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                      <img src={galleryIcon} alt="업로드" />
                      <span className="upload-count">{images.length}/5</span>
                    </label>
                  )}

                  {images.map((item, i) => (
                    <div className="image-thumb" key={i}>
                      <span className="thumb-order">{i + 1}</span>
                      <img src={item.previewUrl} alt={`uploaded-${i}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(i)}
                        aria-label="이미지 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 제목 */}
            <section className="input-section">
              <label>제목</label>
              <input
                type="text"
                placeholder="상품명을 입력해 주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </section>

            {/* 가격 */}
            <section className="input-section">
              <label>가격</label>
              <input
                type="text"
                placeholder="가격을 입력해 주세요."
                value={price}
                onChange={(e) => {
                  // 숫자만 입력 허용
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setPrice(value);
                }}
                onKeyPress={(e) => {
                  // 숫자가 아닌 키 입력 방지
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault();
                  }
                }}
              />
            </section>

            {/* 카테고리 */}
            <section className="input-section">
              <label>카테고리</label>
              <div className="select-wrap">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>
                    카테고리 선택
                  </option>
                  <option value="clothes">의류</option>
                  <option value="books">도서 / 문구</option>
                  <option value="appliances">가전 / 주방</option>
                  <option value="helper">도우미 / 기타</option>
                </select>
                <span className="chevron" aria-hidden="true">
                  ▾
                </span>
              </div>
            </section>

            {/* 상세 내용 */}
            <section className="detail-section">
              <label>상세 내용</label>
              <div className="textarea-wrapper">
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="· 상품 브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요."
                />
              </div>
            </section>

            {/* 제출 버튼 */}
            <button className="submit-btn" type="submit">
              {isEdit ? "상품 수정" : "상품 등록"}
            </button>
          </form>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
