import React, { useRef, useState } from "react";
import "../styles/ProductPostPage.css";
import galleryIcon from "../image/gallery1.png";
import BottomNav from "./BottomNav";

export default function ProductPostPage() {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");       // 제목
  const [price, setPrice] = useState("");       // 가격(문자열 상태)
  const [category, setCategory] = useState(""); // 카테고리
  const [details, setDetails] = useState("");   // 상세 내용
  const [status, setStatus] = useState("거래가능"); // 상품현황 (기본 거래가능)

  const stripRef = useRef(null);

  // 이미지 업로드 (최대 5장, 아직 서버 전송 X)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert("이미지는 최대 5장까지 업로드 가능합니다.");
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);

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
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // 🔎 백엔드 연동 전: 폼 제출 시 서버 호출 없이 데이터만 콘솔에 찍기
  const handleSubmit = (e) => {
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
    if (images.length === 0) {
      alert("상품 이미지를 한 장 이상 업로드해 주세요.");
      return;
    }

    // 숫자만 추출해서 price 숫자형으로 변환 (백엔드 연동 시 참고용)
    const numericPrice = Number(price.replace(/[^0-9]/g, "") || 0);

    const payload = {
      title: title.trim(),
      price: numericPrice,
      category,
      status,
      details: details.trim(),
      images, // 현재는 blob URL 배열 (실제 파일 업로드는 연동 시 변경)
    };

    console.log("📦 [백엔드 연동 전] 제출 데이터:", payload);
    alert("백엔드 연동 전 상태입니다.\n콘솔에서 전송될 데이터를 확인해 보세요!");
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="post-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            ←
          </button>
          <h1>상품 등록하기</h1>
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
                  {images.map((src, i) => (
                    <div className="image-thumb" key={i}>
                      <span className="thumb-order">{i + 1}</span>
                      <img src={src} alt={`uploaded-${i}`} />
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

            {/* 카테고리 (위) */}
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
                  <option value="의류">의류</option>
                  <option value="도서 / 문구">도서 / 문구</option>
                  <option value="가전 / 주방">가전 / 주방</option>
                  <option value="도우미 / 기타">도우미 / 기타</option>
                </select>
                <span className="chevron" aria-hidden="true">
                  ▾
                </span>
              </div>
            </section>

            {/* 상품현황 (아래) */}
            <section className="input-section">
              <label>상품현황</label>
              <div className="status-select-wrap">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="거래가능">거래가능</option>
                  <option value="예약중">예약중</option>
                  <option value="판매완료">판매완료</option>
                </select>
                <span className="status-chevron" aria-hidden="true">
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
              상품 등록
            </button>
          </form>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
