import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import VoiceUpload from './components/VoiceUpload';
import Home from './components/Home';
import Login from './pages/login/login.jsx';
import Signup from './pages/login/signup.jsx';
import VoiceRecord from './pages/detail/VoiceRecord.jsx';
import VoiceInfo from './pages/detail/VoiceRecordInfo.jsx';
import VoiceAlert from './pages/detail/VoiceAlert.jsx';

const App = () => {
  return (
    <BrowserRouter /* basename='/' */>
      <Routes>
        {/* 루트: 홈 또는 로그인 중 하나 선택 */}
        <Route path="/" element={<Home heroLogoSrc="/MainlogoWhite.png" />} />

        {/* 명시적 홈 경로 (소문자 사용 권장) */}
        <Route path="/home" element={<Home heroLogoSrc="/MainlogoWhite.png" />} />

        {/* 페이지들 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 기능 페이지 (소문자-케밥케이스 권장) */}
        <Route path="/voice-upload" element={<VoiceUpload />} />
        <Route path="/voice-record" element={<VoiceRecord />} />
        <Route path="/voice-info" element={<VoiceInfo />} />
        <Route path="/voice-alert" element={<VoiceAlert />} />

        {/* 존재하지 않는 경로 → 로그인(또는 홈)으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
