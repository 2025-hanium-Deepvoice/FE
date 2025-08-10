import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import VoiceUpload from './components/VoiceUpload';
import Home from './components/Home'


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/VoiceUpload' element={<VoiceUpload />} />
                <Route path="/Home" element={<Home heroLogoSrc="/MainlogoWhite.png" />} /> {/* 만약 로고 바꿀거면 여기서 */}
                <Route path='/Home' element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App