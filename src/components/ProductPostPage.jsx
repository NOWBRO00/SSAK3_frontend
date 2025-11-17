import React, { useRef, useState } from "react";
import "../styles/ProductPostPage.css";
import galleryIcon from "../image/gallery1.png";
import BottomNav from "./BottomNav";

export default function ProductPostPage() {
  const [images, setImages] = useState([]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("예약중"); // 상품현황
  const stripRef = useRef(null);

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
            <input type="text" placeholder="상품명을 입력해 주세요." />
          </section>

          {/* 가격 */}
          <section className="input-section">
            <label>가격</label>
            <input type="text" placeholder="가격을 입력해 주세요." />
          </section>

          {/* 카테고리 (위) */}
          <section className="input-section">
            <label>카테고리</label>
            <div className="select-wrap">
              <select defaultValue="">
                <option value="" disabled>
                  카테고리 선택
                </option>
                <option>의류</option>
                <option>도서 / 문구</option>
                <option>가전 / 주방</option>
                <option>도우미 / 기타</option>
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

          <button className="submit-btn">상품 등록</button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
