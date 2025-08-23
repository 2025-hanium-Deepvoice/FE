import React, { useRef, useState } from "react";
import { FiPhoneCall, FiDownload, FiAlertTriangle, FiChevronRight, FiX } from "react-icons/fi";
import html2canvas from "html2canvas";

const getScrollParent = (node) => {
  if (!node) return document.scrollingElement || document.documentElement;
  const s = window.getComputedStyle(node);
  const isScrollable = /(auto|scroll)/.test(s.overflowY);
  if (isScrollable && node.scrollHeight > node.clientHeight) return node;
  return getScrollParent(node.parentElement);
};

export default function VoiceAnalysisInfo({ messages = [], type, tips = [], captureRef }) {
  const sectionRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  const handleSaveImage = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const el = (captureRef && captureRef.current) || sectionRef.current || document.body;
      const scroller = getScrollParent(el);
      const prev = scroller.scrollTop;
      scroller.scrollTop = 0;
      await new Promise((r) => requestAnimationFrame(r));
      const width = Math.ceil(el.scrollWidth);
      const height = Math.ceil(el.scrollHeight);
      const canvas = await html2canvas(el, {
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#0f0f10",
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
      scroller.scrollTop = prev;

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `voice-analysis_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
        {/* ===== 전체 대화 보기 (미리보기 2개, 각 1줄씩 줄임표) ===== */}
        <section className="chat-section">
          <button className="section-title-btn" onClick={() => setFullOpen(true)}>
            <span>전체 대화 보기</span>
            <FiChevronRight aria-hidden />
          </button>

          {messages.slice(0, 2).map((msg, i) => (
            <div key={i} className="chat-bubble preview">
              <FiAlertTriangle className="warn" aria-hidden />
              <div className="lines">
                {/* 1줄 요약(굵게) */}
                <p className="chat-text">{msg.text}</p>
                {/* 보조 줄(작게) — 없는 경우는 생략 */}
                {msg.sub && <p className="chat-sub">{msg.sub}</p>}
              </div>
            </div>
          ))}
        </section>

        {/* ===== 분석 유형 ===== */}
        <section className="analysis-section">
          <h3>분석 유형</h3>
          <div className="analysis-box">
            <p>사기 유형 : {type?.scamType ?? "-"}</p>
            <p>텍스트 특징 : {type?.features ?? "-"}</p>
          </div>
        </section>

        {/* ===== 대응 방법 ===== */}
        <section className="tips-section">
          <h3>대응 방법</h3>
          <div className="tips-box">
            {tips.map((t, i) => (
              <p key={i}>• {t}</p>
            ))}
          </div>
        </section>

        {/* ===== 하단 버튼 ===== */}
        <div className="button-row">
          <button className="report-btn" onClick={() => setConfirmOpen(true)}>
            <FiPhoneCall /> 신고하기
          </button>
          <button className="save-btn" onClick={handleSaveImage} disabled={saving}>
            <FiDownload /> {saving ? "저장 중..." : "결과 저장"}
          </button>
        </div>
      </div>

      {/* 신고 모달 */}
      {confirmOpen && (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-label="112 신고 확인">
          <div className="modal__backdrop" onClick={() => setConfirmOpen(false)} />
          <div className="modal__card" style={{ textAlign: "center" }}>
            <h4 className="modal__title" style={{ marginTop: 0 }}>112(경찰)에 전화하시겠어요?</h4>
            <p className="modal__desc">이 통화는 긴급 신고 번호로 연결됩니다.</p>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <a className="modal__action" style={{ background: "#e53935", fontWeight: 800, color: "#fff", textAlign: "center", padding: 12, borderRadius: 10 }} href="tel:112">
                112로 전화
              </a>
              <button className="modal__action" onClick={() => setConfirmOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 전체 대화 모달 */}
      {fullOpen && (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-label="전체 대화">
          <div className="modal__backdrop" onClick={() => setFullOpen(false)} />
          <div className="modal__card modal__card--xl">
            <div className="modal__toprow">
              <h4 className="modal__title">전체 대화</h4>
              <button className="icon-close" onClick={() => setFullOpen(false)} aria-label="닫기">
                <FiX />
              </button>
            </div>
            <div className="modal__scroll">
              {messages.map((m, i) => (
                <p className="modal__line" key={i}>• {m.text}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
