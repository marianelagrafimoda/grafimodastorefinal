import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TestCookies from './pages/TestCookies';
import NotFound from './pages/NotFound';
import { AppProviders } from './AppProviders';
import CookieConsent from './components/CookieConsent';
import RouteHandler from './components/RouteHandler';
import './App.css';

function App() {
  return (
    <AppProviders>
      <RouteHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/quienes-somos" element={<AboutUs />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/test-cookies" element={<TestCookies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsent />
    </AppProviders>
  );
}

export default App;
