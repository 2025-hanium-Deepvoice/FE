import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    if (isFormValid) {
      console.log({ name, id, password });
    }
  };

  const handleBack = () => {
    navigate('/login');
    //로그인 처리
  };

  const isFormValid = name.trim() !== '' && id.trim() !== '' && password.trim() !== '';

  return (
    <div className="Signup_wrap container">
      <button className="back-button" onClick={handleBack}>{'<'}</button>

      <div className="title">
        <h2>안녕하세요 <span>👋</span></h2>
        <p>기본적인 정보를 등록해주세요</p>
      </div>

      <div className="input-group">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          placeholder="ex) 홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="id">아이디</label>
        <input
          id="id"
          type="text"
          placeholder="아이디를 입력해주세요"
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
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className={`signup-btn ${isFormValid ? 'active' : 'inactive'}`}
        onClick={handleSignup}
        disabled={!isFormValid}
      >
        회원가입
      </button>
    </div>
  );
};

export default Signup;
