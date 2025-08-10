import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    if (id && password) {
      console.log({ id, password });
      // 로그인 처리
    }
  };

  const isFormValid = id.trim() !== '' && password.trim() !== '';

  return (
    <div className='Login_wrap container'>
      <div className="logo" />

      <div className="input-group">
        <label htmlFor="id">아이디</label>
        <input
          id="id"
          type="text"
          placeholder="아이디 입력"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">비밀번호</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-btn"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <button
        className={`login-btn ${isFormValid ? 'active' : 'inactive'}`}
        onClick={handleLogin}
        disabled={!isFormValid}
      >
        로그인
      </button>

      <div className="signup-link">
        계정이 없으신가요? <a href="/signup">회원가입하기</a>
      </div>
    </div>
  );
};

export default Login;
