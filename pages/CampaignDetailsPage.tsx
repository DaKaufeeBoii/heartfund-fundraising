
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';

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

  const { title, creator, creatorAvatar, imageUrl, longDescription, currentAmount, goalAmount, donors, category, endDate } = campaign;
  const daysLeft = Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const percentage = Math.min(Math.round((currentAmount / goalAmount) * 100), 100);

  return (
    <div className="bg-white py-12 sm:py-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column: Image and Details */}
          <div className="lg:col-span-3">
            <div className="rounded-lg overflow-hidden mb-6 shadow-lg">
              <img src={imageUrl} alt={title} className="w-full h-auto object-cover aspect-[16/9]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral tracking-tight">{title}</h1>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                  <img src={creatorAvatar} alt={creator} className="h-10 w-10 rounded-full" />
                  <div>
                      <p className="text-sm text-gray-500">Created by</p>
                      <p className="font-semibold text-gray-800">{creator}</p>
                  </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-primary">
                  {category}
              </span>
            </div>
            <div className="mt-8 text-gray-700 text-lg leading-relaxed space-y-4">
                <p>{longDescription}</p>
            </div>
          </div>

          {/* Right Column: Donation Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
              <ProgressBar current={currentAmount} goal={goalAmount} />
              <div className="mt-4">
                <p className="text-3xl font-bold text-primary">
                  ₹{currentAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  raised of ₹{goalAmount.toLocaleString()} goal
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold text-neutral">{donors}</p>
                    <p className="text-sm text-gray-500">donors</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral">{daysLeft}</p>
                    <p className="text-sm text-gray-500">days left</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral">{percentage}%</p>
                    <p className="text-sm text-gray-500">of goal</p>
                </div>
              </div>

              <div className="mt-8">
                <Link to={`/campaign/${id}/donate`} className="w-full">
                  <Button variant="secondary" size="lg" className="w-full">Donate Now</Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-6 text-center">
                Your donation makes a real difference. Thank you for your support!
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CampaignDetailsPage;
