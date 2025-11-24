// src/components/ProductPostPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ProductPostPage.css";
import galleryIcon from "../image/gallery1.png";
import BottomNav from "./BottomNav";

// 백엔드 서버 주소 (명세서 기준)
const API_BASE = "http://localhost:8080";

// 카테고리 코드 -> 백엔드 categoryName 매핑
const CATEGORY_NAME_MAP = {
  clothes: "의류",
  books: "도서 / 문구",
  appliances: "가전 / 주방",
  helper: "도우미 / 기타",
};

// 백엔드 categoryName -> 프론트 코드 매핑 (수정 모드에서 사용)
const CATEGORY_CODE_MAP = {
  "의류": "clothes",
  "도서 / 문구": "books",
  "가전 / 주방": "appliances",
  "도우미 / 기타": "helper",
};

// 임시 판매자 ID (로그인 연동 전까지 사용)
const MOCK_SELLER_ID = 1;

export default function ProductPostPage() {
  const { id } = useParams();              // /product/:id/edit 인 경우 id 존재
  const navigate = useNavigate();
  const isEdit = !!id;                     // true면 수정 모드, false면 등록 모드

  // 이미지: File + 미리보기 URL 같이 들고 있기
  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [title, setTitle] = useState("");   // 제목
  const [price, setPrice] = useState("");   // 가격(문자열 상태)
  // clothes / books / appliances / helper
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState(""); // 상세 내용
  const [loading, setLoading] = useState(isEdit); // 수정모드면 로딩 true로 시작

  const stripRef = useRef(null);

  // =========================
  // 수정 모드일 때 기존 데이터 불러오기
  // =========================
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("상품 조회 실패");
        const raw = await res.json();

        // 명세서 기준 예시:
        // {
        //   id, title, description, price,
        //   status: "ON_SALE" | "RESERVED" | "SOLD_OUT",
        //   categoryName,
        //   sellerId,
        //   sellerNickname,
        //   likeCount,
        //   imageUrls: ["/uploads/a.jpg", ...]
        // }

        setTitle(raw.title ?? "");
        setDetails(raw.description ?? "");
        setPrice(
          raw.price !== undefined && raw.price !== null
            ? String(raw.price)
            : ""
        );

        const code = CATEGORY_CODE_MAP[raw.categoryName] || "";
        setCategory(code);

        // 이미지: 일단 프리뷰용으로만 표시 (기존 이미지)
        if (Array.isArray(raw.imageUrls)) {
          const previewItems = raw.imageUrls.map((path) => {
            const fullUrl = path?.startsWith("http")
              ? path
              : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
            return {
              file: null,        // 기존 파일은 없고, URL만 있는 상태
              previewUrl: fullUrl,
              isExisting: true,  // 기존 이미지 표시용 플래그 (선택적으로 활용 가능)
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

  // 이미지 업로드 (최대 5장)
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
        // 새로 올린 이미지에 대해서만 revoke (기존 URL은 브라우저가 관리)
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  // =========================
  // 등록 / 수정 공통 submit
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
    // 신규 등록일 때만 이미지 필수
    if (!isEdit && images.length === 0) {
      alert("상품 이미지를 한 장 이상 업로드해 주세요.");
      return;
    }

    // 숫자만 추출해서 price 숫자형으로 변환
    const numericPrice = Number(price.replace(/[^0-9]/g, "") || 0);

    // 선택된 카테고리 코드 -> 백엔드용 categoryName으로 변환
    const categoryName = CATEGORY_NAME_MAP[category];

    try {
      if (isEdit) {
        // =========================
        // 수정 모드: PUT /api/products/{id}
        // 이미지 수정은 명세에 없으니 텍스트 정보만 수정하는 것으로 가정
        // =========================
        const payload = {
          title: title.trim(),
          description: details.trim(),
          price: numericPrice,
          // 필요하면 status도 함께 전송 가능
          // status: "ON_SALE",
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
        // =========================
        // 신규 등록: POST /api/products/with-upload (FormData)
        // =========================
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("price", String(numericPrice));
        formData.append("description", details.trim());
        formData.append("categoryName", categoryName);
        formData.append("sellerId", String(MOCK_SELLER_ID));

        images.forEach((item) => {
          if (item.file) {
            formData.append("images", item.file);
          }
        });

        console.log("🆕 [등록] FormData 전송 예정");

        const res = await fetch(
          `${API_BASE}/api/products/with-upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("상품 등록 실패");
        const created = await res.json();

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
          {/* 폼 전체를 감싸서 submit 버튼으로 처리 */}
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
                  {/* 업로드 버튼(플레이스홀더) */}
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

                  {/* 업로드 썸네일 */}
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
                onChange={(e) => setPrice(e.target.value)}
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
