import React, { useRef, useState, useEffect } from "react";
import { Play, ChevronRight, Mic, X } from "lucide-react";
import "../assets/sass/setting/_home.scss";
import { apiGetMe, apiGetAnalyses } from "../store/endpoint";

const Home = ({
  heroLogoSrc = "",
  onUpload,
}) => {
  const fileRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef(null);

  // 상단 인사말
  const [meName, setMeName] = useState("000");
  const [meLoading, setMeLoading] = useState(false);

  // 기록 리스트
  const [records, setRecords] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // utils
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };
  const fmtDuration = (sec) => {
    if (!Number.isFinite(sec)) return "";
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

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

  // /analyses
  useEffect(() => {
    let mounted = true;
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      "";
    if (!token) return;

    (async () => {
      setListLoading(true);
      try {
        const data = await apiGetAnalyses({ skip: 0, take: 10 });
        const list = (data?.items || []).map((it) => ({
          id: it.id,
          name: it.file_name,
          date: fmtDate(it.detected_at),
          duration: fmtDuration(it.duration_seconds),
          avatar: "",
          phishingRisk: it.is_phishing ? it.confidence : undefined,
        }));
        if (mounted) setRecords(list);
      } catch (e) {
        console.error("GET /analyses failed:", e);
      } finally {
        mounted && setListLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePick = () => fileRef.current?.click();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (onUpload) {
        await onUpload(file, { signal: controller.signal });
        // 업로드 뒤 목록 새로고침 원하면 여기서 /analyses 다시 호출
        // const data = await apiGetAnalyses({ skip: 0, take: 10 });
        // setRecords( ...map );
      } else {
        await new Promise((r) => setTimeout(r, 1500));
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

  const cancelUpload = () => {
    abortRef.current?.abort();
    setIsUploading(false);
  };

  return (
    <div className="container2 home">
      {/* 인사 */}
      <header className="home__greeting">
        <div className="home__avatar"><span role="img" aria-label="avatar">🧑‍💻</span></div>
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
            <div className="card__icon"><Mic size={22} /></div>
            <div className="card__texts">
              <h4>보이스피싱 감지</h4>
              <p>보이스피싱이 의심되는 음성을 업로드해주세요</p>
            </div>
          </div>

          <button className="card__btn" onClick={handlePick}>업로드</button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            className="none"
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 리스트 헤더 */}
      <div className="home__list-head">
        <h3>음성기록</h3>
        <button className="see-all" disabled={listLoading}>
          전체 보기 <ChevronRight size={16} />
        </button>
      </div>

      {/* 기록 리스트 */}
      <ul className="home__list">
        {(records.length ? records : []).map((r) => {
          const risky = Number.isFinite(r.phishingRisk);
          return (
            <li key={r.id} className={`record ${risky ? "record--danger" : ""}`}>
              <div className="record__avatar">
                {r.avatar ? (
                  <img src={r.avatar} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <span className="record__emoji" role="img" aria-label="avatar">🙂</span>
                )}
              </div>

              <div className="record__texts">
                <div className="record__title">
                  {r.name}
                  {risky && <span className="badge">△ 보이스피싱 의심 {r.phishingRisk}%</span>}
                </div>
                <div className="record__date">{r.date}</div>
              </div>

              <div className="record__right">
                <span className="record__duration">{r.duration}</span>
                <button className="record__play" aria-label="재생"><Play size={18} /></button>
              </div>
            </li>
          );
        })}

        {listLoading && (
          <li className="record">
            <div className="record__texts">불러오는 중…</div>
          </li>
        )}
      </ul>

      {/* 업로드 중 모달 */}
      {isUploading && (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-label="업로드 진행 중">
          <div className="modal__backdrop" />
          <div className="modal__card">
            <button className="modal__close" onClick={cancelUpload} aria-label="닫기">
              <X size={18} />
            </button>

            <div className="modal__wave" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>

            <h4 className="modal__title">파일 업로드 중…</h4>
            <p className="modal__desc">업로드 중입니다. 잠시 기다려주세요…</p>

            <button className="modal__action" onClick={cancelUpload}>업로드 취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
