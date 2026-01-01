
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ImageCarousel from '../components/ImageCarousel';

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById } = useCampaigns();
  const { user } = useAuth();
  
  const campaign = id ? getCampaignById(id) : undefined;

  useEffect(() => {
    if (user && id && campaign) {
      storage.addRecentCampaign(user.id, id);
    }
  }, [id, user, campaign]);

  if (!id) {
    return <Navigate to="/browse" />;
  }

  if (!campaign) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-3xl font-bold">Campaign not found</h1>
        <p className="mt-4">The campaign you are looking for does not exist.</p>
        <Link to="/browse" className="mt-6 inline-block">
            <Button variant="primary">Back to Campaigns</Button>
        </Link>
      </Container>
    );
  }

  const { title, creator, creatorAvatar, imageUrls, longDescription, currentAmount, goalAmount, donors, category, endDate } = campaign;
  const daysLeft = Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const percentage = Math.min(Math.round((currentAmount / goalAmount) * 100), 100);

  return (
    <div className="bg-white py-12 sm:py-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column: Carousel and Details */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <ImageCarousel images={imageUrls} title={title} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral tracking-tight">{title}</h1>
              <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-primary">
                  {category}
              </span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                <img src={creatorAvatar} alt={creator} className="h-12 w-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Campaign Organized by</p>
                    <p className="font-bold text-gray-800 text-lg">{creator}</p>
                </div>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3 className="text-xl font-bold text-neutral mb-4">Our Story</h3>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{longDescription}</p>
            </div>

            {/* Evidence Section Label */}
            <div className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-100">
               <div className="flex items-center gap-3 mb-4">
                 <div className="bg-green-500 p-2 rounded-full text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <h4 className="text-lg font-bold text-green-800 tracking-tight">HeartFund Verified Campaign</h4>
               </div>
               <p className="text-green-700 text-sm">
                 This campaign has provided visual evidence and documentation to verify its authenticity. All photos displayed above were taken on-site by the organizer.
               </p>
            </div>
          </div>

          {/* Right Column: Donation Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-4xl font-black text-primary">
                    ${currentAmount.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-gray-400 uppercase">Goal: ${goalAmount.toLocaleString()}</p>
                </div>
                <ProgressBar current={currentAmount} goal={goalAmount} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 py-4 rounded-2xl">
                    <p className="text-xl font-bold text-neutral">{donors}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">donors</p>
                </div>
                <div className="bg-gray-50 py-4 rounded-2xl">
                    <p className="text-xl font-bold text-neutral">{daysLeft}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">days left</p>
                </div>
                <div className="bg-gray-50 py-4 rounded-2xl">
                    <p className="text-xl font-bold text-neutral">{percentage}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">of goal</p>
                </div>
              </div>

              <Link to={`/campaign/${id}/donate`} className="block">
                <Button variant="secondary" size="lg" className="w-full py-5 text-xl shadow-xl shadow-red-200 hover:shadow-red-300 transition-all">
                  Support this Cause
                </Button>
              </Link>

              <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <p className="text-xs font-semibold">Secure, encrypted payment</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CampaignDetailsPage;
