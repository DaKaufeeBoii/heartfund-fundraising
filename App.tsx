
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BrowsePage from './pages/BrowsePage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationPage from './pages/DonationPage';
import HistoryPage from './pages/HistoryPage';

const App: React.FC = () => {
  // Fix: Use clientId instead of "client-id" to satisfy library types
  const initialPayPalOptions = {
    clientId: "test",
    currency: "USD",
    intent: "capture",
    components: "buttons"
  };

  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      <AuthProvider>
        <CampaignProvider>
          <Router>
            <div className="flex flex-col min-h-screen font-sans bg-gray-50">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/browse" element={
                    <ProtectedRoute>
                      <BrowsePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaign/:id" element={
                    <ProtectedRoute>
                      <CampaignDetailsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaign/:id/donate" element={
                    <ProtectedRoute>
                      <DonationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create" element={
                    <ProtectedRoute>
                      <CreateCampaignPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CampaignProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
};

export default App;
