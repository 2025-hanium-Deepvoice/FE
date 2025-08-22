import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import VoiceUpload from './components/VoiceUpload';
import Home from './components/Home'
import Login from './pages/login/login.jsx'
import Signup from './pages/login/signup.jsx'
import VoiceRecord from './pages/detail/VoiceRecord.jsx'
import VoiceInfo from './pages/detail/VoiceRecordInfo.jsx'
import VoiceAlert from "./pages/detail/VoiceAlert.jsx"
import Select from "./pages/select/select.jsx";

// 공용 페이지
import Home from "./components/Home";
import VoiceUpload from "./components/VoiceUpload";

// 인증/회원
import Login from "./pages/login/login";
import Signup from "./pages/login/signup";

// 음성기록 (목록/상세)
import VoiceRecordList from "./pages/detail/VoiceRecord";       // 목록
import VoiceRecordDetail from "./pages/detail/TranscriptDetail"; // 상세
import VoiceInfo from './pages/detail/VoiceRecordInfo.jsx'; 
import VoiceAlert from './pages/detail/VoiceAlert.jsx'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 */}
        <Route path="/" element={<Home heroLogoSrc="/MainlogoWhite.png" />} />
        <Route path="/home" element={<Home heroLogoSrc="/MainlogoWhite.png" />} />

        {/* 인증 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 기능 */}
        <Route path="/voice-upload" element={<VoiceUpload />} />
        <Route path="/voice-info" element={<VoiceInfo />} />
        <Route path="/voice-alert" element={<VoiceAlert />} />
        {/* 음성 기록 */}
        
        <Route path="/voice-record" element={<VoiceRecordList />} />
        <Route path="/voice-record/:id" element={<VoiceRecordDetail />} />

        {/* 없는 경로 → 홈 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/VoiceUpload' element={<VoiceUpload />} />
                <Route path="/Home" element={<Home heroLogoSrc="/MainlogoWhite.png" />} /> {/* 만약 로고 바꿀거면 여기서 */}
                <Route path='/Home' element={<Home />} />
                <Route path='/' />
                <Route path='/select' element={<Select />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/voice-record' element={<VoiceRecord />} />
                <Route path='/voice-info' element={<VoiceInfo />} />
                <Route path='/voice-alert' element={<VoiceAlert />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
