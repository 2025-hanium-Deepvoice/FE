import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import VoiceUpload from './components/VoiceUpload';
import Home from './components/Home'
import Login from './pages/login/login.jsx'
import Signup from './pages/login/signup.jsx'
import VoiceRecord from './pages/detail/VoiceRecord.jsx'
import VoiceInfo from './pages/detail/VoiceRecordInfo.jsx'
import VoiceAlert from "./pages/detail/VoiceAlert.jsx"

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/VoiceUpload' element={<VoiceUpload />} />
                <Route path="/Home" element={<Home heroLogoSrc="/MainlogoWhite.png" />} /> {/* 만약 로고 바꿀거면 여기서 */}
                <Route path='/Home' element={<Home />} />
                <Route path='/' />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/voice-record' element={<VoiceRecord />} />
                <Route path='/voice-info' element={<VoiceInfo />} />
                <Route path='/voice-alert' element={<VoiceAlert />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App