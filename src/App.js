import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/login/login.jsx'
import Signup from './pages/login/signup.jsx'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                  <Route path='/' />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App