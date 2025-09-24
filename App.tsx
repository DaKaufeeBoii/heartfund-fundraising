import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationPage from './pages/DonationPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CampaignProvider>
        <Router>
          <div className="flex flex-col min-h-screen font-sans bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/campaign/:id" element={<CampaignDetailsPage />} />
                <Route path="/campaign/:id/donate" element={<DonationPage />} />
                <Route path="/create" element={<CreateCampaignPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CampaignProvider>
    </AuthProvider>
  );
};

export default App;