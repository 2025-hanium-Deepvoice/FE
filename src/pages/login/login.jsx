// src/pages/login/login.jsx
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta?.env?.VITE_API_BASE || 'https://deepvoice-be.shop';
const API_PATH = '/auth/login';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState('');          // → user_id 로 전송
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePasswordVisibility = () => setShowPassword(v => !v);

  // 명세 최소 길이 검증
  const isFormValid = id.trim().length >= 4 && password.trim().length >= 6;

  const handleLogin = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}${API_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: id.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        // 서버가 {message} 를 줄 수도, text 를 줄 수도 있음
        let msg = `로그인 실패 (HTTP ${res.status})`;
        try {
          const errJson = await res.clone().json();
          if (errJson?.message) msg = errJson.message;
        } catch {
          const text = await res.text().catch(() => '');
          if (text) msg = text;
        }
        if (res.status === 401 || /invalid/i.test(msg)) {
          msg = '아이디 또는 비밀번호가 올바르지 않습니다.';
        }
        throw new Error(msg);
      }

      const data = await res.json(); // { user, access_token }
      if (!data?.access_token || !data?.user) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      // 데모: localStorage 저장 (운영은 httpOnly 쿠키 권장)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 로그인 성공 → 홈으로 이동
      navigate('/home', { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && isFormValid && !loading) handleLogin();
  };

  return (
    <div className='Login_wrap container' onKeyDown={onKeyDown}>
      <div className="logo" />

      <div className="input-group">
        <label htmlFor="id">아이디</label>
        <input
          id="id"
          type="text"
          placeholder="아이디 입력 (4자 이상)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          minLength={4}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">비밀번호</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호 입력 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            className="toggle-btn"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {errorMsg && <div className="error-box">{errorMsg}</div>}

      <button
        className={`login-btn ${isFormValid ? 'active' : 'inactive'}`}
        onClick={handleLogin}
        disabled={!isFormValid || loading}
        aria-disabled={!isFormValid || loading}
      >
        {loading ? '로그인 중…' : '로그인'}
      </button>

      <div className="signup-link">
        계정이 없으신가요? <a href="/signup">회원가입하기</a>
      </div>
    </div>
  );
};

export default Login;
