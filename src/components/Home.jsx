// src/components/Home.jsx
import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, Mic, X } from "lucide-react";
import "../assets/sass/setting/_home.scss";
import VoiceRecordCard from "./detail/VoiceRecordCard";
import { apiGetMe, apiGetAnalyses } from "../store/endpoint";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ✅ 공용 더미/매핑 (경로 주의: components → store 는 ../)
import {
  USE_DUMMY_ANALYSES,
  makeDummyAnalysesResponse,
  mapAnalysesToView,
} from "../store/analyses.mock";

const Home = ({ heroLogoSrc = "", onUpload }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef(null);

  // 상단 인사말
  const [meName, setMeName] = useState("000");
  const [meLoading, setMeLoading] = useState(false);

  // 기록 리스트(홈 미리보기용)
  const [records, setRecords] = useState([]); // mapAnalysesToView() 결과
  const [listLoading, setListLoading] = useState(false);

  // /users/me
  useEffect(() => {
    let mounted = true;
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      "";
    if (!token) return;

    (async () => {
      setMeLoading(true);
      try {
        const me = await apiGetMe();
        if (mounted && me?.name) setMeName(me.name);
      } catch (e) {
        console.error("GET /users/me failed:", e);
      } finally {
        mounted && setMeLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // /analyses → 더미 or 실제 API, 공용 매핑 사용
  useEffect(() => {
    let mounted = true;

    (async () => {
      setListLoading(true);
      try {
        let data;
        if (USE_DUMMY_ANALYSES) {
          data = makeDummyAnalysesResponse(0, 10);
        } else {
          const token =
            localStorage.getItem("access_token") ||
            localStorage.getItem("token") ||
            "";
          if (!token) throw new Error("NO_TOKEN");
          data = await apiGetAnalyses({ skip: 0, take: 10 });
        }

        const mapped = mapAnalysesToView(data); // [{ id, record, meta, ... }]
        if (mounted) setRecords(mapped);
      } catch (e) {
        console.error("GET /analyses failed:", e);
        // 더미 폴백
        if (mounted) {
          const data = makeDummyAnalysesResponse(0, 10);
          setRecords(mapAnalysesToView(data));
        }
      } finally {
        mounted && setListLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ 업로드 공통 처리
  const startUpload = async (file, extra = {}) => {
    setIsUploading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (onUpload) {
        await onUpload(file, { signal: controller.signal, ...extra });
      } else {
        await new Promise((r) => setTimeout(r, 1500)); // 데모용
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        alert("업로드에 실패했습니다.");
      }
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  };

  // ✅ select.jsx가 넘겨준 file/profileId 수신 → 자동 업로드
  useEffect(() => {
    const st = location.state;
    if (st?.file) {
      const { file, profileId } = st;
      navigate(location.pathname, { replace: true }); // state 제거
      startUpload(file, { profileId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // 업로드 버튼 → 프로필 선택
  const handlePick = () => {
    navigate("/select", { state: { returnTo: "/home" } });
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
    setIsUploading(false);
  };

  const handleSeeAll = () => navigate("/voice-record");

  // 홈 하단 미리보기 3개
  const preview = records.slice(0, 3);

  return (
    <div className="container2 home">
      {/* 인사 */}
      <header className="home__greeting">
        <div className="home__avatar">
          <span role="img" aria-label="avatar">
            🧑‍💻
          </span>
        </div>
        <p className="home__hello">
          <strong>{meLoading ? "로딩중" : meName}</strong>님 안녕하세요!
        </p>
      </header>

      {/* 히어로(로고 자리) */}
      <section className="home__hero">
        {heroLogoSrc ? (
          <img className="home__hero-logo" src={heroLogoSrc} alt="logo" />
        ) : (
          <div className="home__hero-blank" aria-hidden="true" />
        )}

        {/* 업로드 카드 */}
        <div className="home__upload-card">
          <div className="card__left">
            <div className="card__icon">
              <Mic size={22} />
            </div>
            <div className="card__texts">
              <h4>보이스피싱 감지</h4>
              <p>보이스피싱이 의심되는 음성을 업로드해주세요</p>
            </div>
          </div>
          <button className="card__btn" onClick={handlePick}>
            업로드
          </button>
        </div>
      </section>

      {/* 리스트 헤더 */}
      <div className="home__list-head">
        <h3>음성기록</h3>
        <button className="see-all" onClick={handleSeeAll} disabled={listLoading}>
          전체 보기 <ChevronRight size={16} />
        </button>
      </div>

      {/* ✅ 기록 미리보기(VoiceRecordCard로 3개) */}
      {listLoading ? (
        <div style={{ color: "#aaa" }}>불러오는 중…</div>
      ) : preview.length === 0 ? (
        <div style={{ color: "#aaa" }}>아직 분석된 음성 기록이 없어요.</div>
      ) : (
        <div className="record-list" style={{ display: "grid", gap: 8 }}>
          {preview.map((item) => (
            <Link
              key={item.id}
              to={`/voice-record/${item.id}`}
              state={{
                voice_id: item.id,
                id: item.id,
                name: item.record.name,
                durationLabel: item.meta.durationLabel,
                detectedAt: item.meta.detectedAt,
                score: item.meta.score,
              }}
              style={{ textDecoration: "none" }}
            >
              <VoiceRecordCard record={item.record} />
            </Link>
          ))}
        </div>
      )}

      {/* 업로드 중 모달 */}
      {isUploading && (
        <div
          className="modal is-open"
          role="dialog"
          aria-modal="true"
          aria-label="업로드 진행 중"
        >
          <div className="modal__backdrop" />
          <div className="modal__card">
            <button className="modal__close" onClick={cancelUpload} aria-label="닫기">
              <X size={18} />
            </button>

            <div className="modal__wave" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <h4 className="modal__title">파일 업로드 중…</h4>
            <p className="modal__desc">업로드 중입니다. 잠시 기다려주세요…</p>

            <button className="modal__action" onClick={cancelUpload}>
              업로드 취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
