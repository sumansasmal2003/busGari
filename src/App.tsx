// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/Mainpage';
import Header from './components/Header';
import BusRegistrationPage from './pages/BusRegistrationPage';
import BusLogin from './pages/BusLogin';
import BusDashboard from './pages/BusDashboard';
import AppDownload from './pages/AppDownload';
import Footer from './components/Footer';
import Feedback from './pages/Feedback';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Distance from './pages/Distance';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/bus-register" element={<BusRegistrationPage />} />
        <Route path="/bus-login" element={<BusLogin />} />
        <Route path="/bus-dashboard/:busId" element={<BusDashboard />} />
        <Route path="/app-download" element={<AppDownload />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/distance" element={<Distance />} />
        {/* Add more routes here as needed */}
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;