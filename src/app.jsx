import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import PublicSurveyPage from './pages/PublicSurveyPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/survey/:id" element={<SurveyDetailPage />} />
        <Route path="/s/:id" element={<PublicSurveyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};
  