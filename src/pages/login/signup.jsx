import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false); 

  const handleSignup = () => {
    if (name && id && password) {
      console.log({ name, id, password });
      setShowPopup(true); 
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleGoToLogin = () => {
    navigate('/login');
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

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="confetti">🎉</div>
            <p>너의 목소리가 보여</p>
            <p>서비스 가입을 축하드립니다</p>
            <p>아래 버튼을 눌러 서비스를 이용해주세요</p>
            <button className="popup-btn" onClick={handleGoToLogin}>
              로그인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
