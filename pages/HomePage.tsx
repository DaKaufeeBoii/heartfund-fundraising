
import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/CampaignCard';
import Container from '../components/Container';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  const { campaigns } = useCampaigns();
  const featuredCampaigns = campaigns.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary text-white text-center py-20 md:py-32">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <Container className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Your Compassion in Action</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-blue-200">
            Join a community of changemakers. Support causes you care about, or start your own fundraiser today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/browse">
              <Button variant="accent" size="lg">Explore Campaigns</Button>
            </Link>
            <Link to="/create">
              <Button variant="secondary" size="lg">Start a Fundraiser</Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Featured Campaigns Section */}
      <Container className="py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral sm:text-4xl">Featured Campaigns</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Get inspired by these popular and impactful fundraisers.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
        <div className="mt-12 text-center">
            <Link to="/browse">
                <Button variant="primary">View All Campaigns</Button>
            </Link>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
