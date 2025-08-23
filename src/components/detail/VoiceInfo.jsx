import React, { useRef, useState } from "react";
import { FiPhoneCall, FiDownload } from "react-icons/fi";
import html2canvas from "html2canvas";

const getScrollParent = (node) => {
  if (!node) return document.scrollingElement || document.documentElement;
  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;
  const isScrollable = /(auto|scroll)/.test(overflowY);
  if (isScrollable && node.scrollHeight > node.clientHeight) return node;
  return getScrollParent(node.parentElement);
};

const VoiceAnalysisInfo = ({ messages, type, tips, captureRef }) => {
  const sectionRef = useRef(null); // 섹션만 캡처하는 백업
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleReportClick = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);
  const confirmCall112 = () => {
    setConfirmOpen(false);
    window.location.href = "tel:112";
  };

  const handleSaveImage = async () => {
    if (saving) return;
    try {
      setSaving(true);

      // ✅ 1) 캡처 대상 엘리먼트
      const el =
        (captureRef && captureRef.current) ||
        sectionRef.current ||
        document.body;

      // ✅ 2) 실제 스크롤 컨테이너를 찾아 맨 위로
      const scroller = getScrollParent(el);
      const prevScrollTop = scroller.scrollTop;
      scroller.scrollTop = 0;

      // ✅ 3) 리플로우 후 전체 크기 계산
      await new Promise((r) => requestAnimationFrame(r));
      const width = Math.ceil(el.scrollWidth);
      const height = Math.ceil(el.scrollHeight);

      // ✅ 4) 전체 영역을 정확히 캡처
      const canvas = await html2canvas(el, {
        backgroundColor:
          getComputedStyle(document.body).backgroundColor || "#0f0f10",
        useCORS: true,
        scale: Math.max(2, window.devicePixelRatio || 1),
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true,
      });

      // ✅ 5) 스크롤 복구
      scroller.scrollTop = prevScrollTop;

      // ✅ 6) 저장
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const now = new Date();
      const ts =
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}` +
        `${String(now.getDate()).padStart(2, "0")}_` +
        `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

      a.href = dataUrl;
      a.download = `voice-analysis_${ts}.png`;
      if (typeof a.download === "string") {
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.open(dataUrl, "_blank");
      }
    } catch (e) {
      console.error(e);
      alert("저장에 실패했어요. 브라우저 인쇄(Ctrl/Cmd+P)로 PDF 저장을 이용해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div ref={sectionRef} className="voice-analysis-info">
        <section className="chat-section">
          <h3>전체 대화 보기</h3>
          {messages.map((msg, index) => (
            <div key={index} className="chat-bubble">
              <p className="chat-text">⚠️ {msg.text}</p>
              {msg.sub && <p className="chat-sub">{msg.sub}</p>}
            </div>
          ))}
        </section>

        <section className="analysis-section">
          <h3>분석 유형</h3>
          <div className="analysis-box">
            <p>사기 유형 : {type.scamType}</p>
            <p>텍스트 특징 : {type.features}</p>
          </div>
        </section>

        <section className="tips-section">
          <h3>대응 방법</h3>
          <div className="tips-box">
            {tips.map((tip, i) => (
              <p key={i}>• {tip}</p>
            ))}
          </div>
        </section>

        <div className="button-row">
          <button className="report-btn" onClick={handleReportClick}>
            <FiPhoneCall /> 신고하기
          </button>
          <button className="save-btn" onClick={handleSaveImage} disabled={saving}>
            <FiDownload /> {saving ? "저장 중..." : "결과 저장"}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-label="112 신고 확인">
          <div className="modal__backdrop" onClick={closeConfirm} />
          <div className="modal__card" style={{ textAlign: "center" }}>
            <h4 className="modal__title" style={{ marginTop: 0 }}>
              112(경찰)에 전화하시겠어요?
            </h4>
            <p className="modal__desc">이 통화는 긴급 신고 번호로 연결됩니다.</p>

            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <button
                className="modal__action"
                style={{ background: "#e53935", fontWeight: 800 }}
                onClick={confirmCall112}
              >
                112로 전화
              </button>
              <button className="modal__action" onClick={closeConfirm}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAnalysisInfo;
