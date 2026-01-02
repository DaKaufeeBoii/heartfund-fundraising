
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ImageCarousel from '../components/ImageCarousel';
import { ShareIcon, TwitterIcon, FacebookIcon, CopyIcon, CloseIcon } from '../components/Icons';

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById } = useCampaigns();
  const { user } = useAuth();
  
  const campaign = id ? getCampaignById(id) : undefined;
  const isExpired = campaign ? new Date(campaign.enddate) < new Date() : false;
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && id && campaign) {
      storage.addRecentCampaign(user.id, id);
    }
  }, [id, user, campaign]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
    };
    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareModal]);

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

  const { title, creator, creatorid, creatoravatar, imageurls, longdescription, currentamount, goalamount, donors, category, enddate } = campaign;
  const isCreator = user?.id === creatorid;
  const daysLeft = Math.max(0, Math.ceil((new Date(enddate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const percentage = Math.min(Math.round((currentamount / goalamount) * 100), 100);

  const campaignUrl = window.location.href;

  const handleShare = (platform: 'twitter' | 'facebook' | 'email' | 'copy') => {
    const encodedUrl = encodeURIComponent(campaignUrl);
    const encodedTitle = encodeURIComponent(`Help support this cause: ${title}`);

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodedTitle}&body=I found this campaign on HeartFund and thought you might want to support it: ${campaignUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(campaignUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
  };

  return (
    <div className="bg-white py-12 sm:py-16">
      <Container>
        {isExpired && (
          <div className="mb-8 bg-red-50 border-2 border-red-500 p-6 rounded-2xl shadow-xl animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 text-white p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="text-red-800 text-lg font-black uppercase tracking-tighter">Campaign Status: DISCONTINUED</h3>
                <p className="text-red-700 font-bold">Donations are disabled until prior notice.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <ImageCarousel images={imageurls} title={title} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral tracking-tight">{title}</h1>
              <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-primary">
                  {category}
              </span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                <img src={creatoravatar} alt={creator} className="h-12 w-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Campaign Organized by</p>
                    <p className="font-bold text-gray-800 text-lg">{isCreator ? 'You' : creator}</p>
                </div>
            </div>

            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-neutral mb-4">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{longdescription}</p>
            </div>
          </div>

          {/* Right Column: Donation Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
              {isExpired && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-red-100">
                  <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-2">Campaign Inactive</p>
                  <p className="text-neutral font-bold leading-tight">Donations are disabled until prior notice.</p>
                </div>
              </div>}
              
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-4xl font-black text-primary">
                    ${currentamount.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-gray-400 uppercase">Goal: ${goalamount.toLocaleString()}</p>
                </div>
                <ProgressBar current={currentamount} goal={goalamount} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 py-4 rounded-2xl text-center">
                    <p className="text-xl font-bold text-neutral">{donors}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">donors</p>
                </div>
                <div className="bg-gray-50 py-4 rounded-2xl text-center">
                    <p className="text-xl font-bold text-neutral">{isExpired ? 0 : daysLeft}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">days left</p>
                </div>
                <div className="bg-gray-50 py-4 rounded-2xl text-center">
                    <p className="text-xl font-bold text-neutral">{percentage}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">of goal</p>
                </div>
              </div>

              <div className="space-y-4">
                {!isCreator ? (
                  <Link to={`/campaign/${id}/donate`} className={`block ${isExpired ? 'pointer-events-none' : ''}`}>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className={`w-full py-5 text-xl shadow-xl transition-all ${isExpired ? 'opacity-20 cursor-not-allowed bg-gray-400' : 'shadow-red-200 hover:shadow-red-300'}`}
                      disabled={isExpired}
                    >
                      Support this Cause
                    </Button>
                  </Link>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                    <p className="text-blue-700 font-bold mb-1">Your Campaign</p>
                    <p className="text-xs text-blue-600">You are the organizer of this cause.</p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowShareModal(true)}
                  variant="primary" 
                  size="lg" 
                  className="w-full py-5 text-xl bg-primary text-white border-2 border-primary hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3"
                >
                  <ShareIcon className="w-6 h-6" />
                  Share this Fundraiser
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <p className="text-xs font-semibold">Secure, encrypted platform</p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Share Modal Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8 duration-300"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-primary tracking-tighter">Spread the word</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-500 mb-8 font-medium">Sharing can increase donations by up to 5x. Every voice matters!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                >
                  <TwitterIcon className="w-8 h-8 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-700">Twitter / X</span>
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 hover:bg-blue-600 hover:text-white transition-all group"
                >
                  <FacebookIcon className="w-8 h-8 text-blue-600 group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold group-hover:text-white text-gray-700">Facebook</span>
                </button>
                <button 
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 hover:bg-red-50 hover:border-red-100 transition-all group"
                >
                  <svg className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-bold text-gray-700">Send Email</span>
                </button>
                <button 
                  onClick={() => handleShare('copy')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group ${copied ? 'bg-green-500 text-white border-green-500' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'}`}
                >
                  {copied ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <CopyIcon className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" />
                  )}
                  <span className={`text-sm font-bold ${copied ? 'text-white' : 'text-gray-700'}`}>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between border border-gray-200">
                <span className="text-xs font-mono text-gray-500 truncate max-w-[200px]">{campaignUrl}</span>
                <button 
                  onClick={() => handleShare('copy')}
                  className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                >
                  {copied ? 'Success' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailsPage;
