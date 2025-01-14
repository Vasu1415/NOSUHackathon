import './App.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OpeningPage from './components/OpeningPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import MainPage from './components/MainPage';

import TestGenerator from './components/TestGenerator';
import TestGrader from './components/TestGraderPage';
import Progress from './components/ProgressPage';
import Documents from './components/DocumentsPage';
import UpdateProfile from './components/UpdateProfilePage';

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path='/' element={<OpeningPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/dashboard' element={<MainPage />} />
        <Route path="/test-generator" element={<TestGenerator />} />
        <Route path="/test-grader" element={<TestGrader />} />
        <Route path="/progress" element={<Progress />} />
        <Route path='/documents' element={<Documents/>} />
        <Route path='/update-profile' element={<UpdateProfile/>} />
      </Routes>

    </Router>

  );
}


export default App;
