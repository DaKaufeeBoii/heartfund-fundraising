
import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/CampaignCard';
import Container from '../components/Container';
import Button from '../components/Button';
import { HeartIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const { campaigns } = useCampaigns();
  const featuredCampaigns = campaigns.slice(0, 3);

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section: Modern Split Layout */}
      <section className="relative bg-primary pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&auto=format&fit=crop&q=80" 
            alt="Giving hands" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent"></div>
        </div>
        
        <Container className="relative z-10">
          <div className="lg:w-3/5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-200 text-xs font-black uppercase tracking-widest mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Over $2.4M raised this month
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6">
              Empower Change with <span className="text-accent">Every Click.</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/90 mb-10 max-w-2xl font-medium leading-relaxed">
              HeartFund is the trusted global platform for turning empathy into action. Start a movement or support a hero today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse">
                <Button variant="accent" size="lg" className="w-full sm:w-auto py-5 px-10 text-xl shadow-2xl shadow-amber-500/20">
                  Find a Cause
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="primary" size="lg" className="w-full sm:w-auto py-5 px-10 text-xl bg-white text-primary hover:bg-blue-50 border-none shadow-xl shadow-blue-900/20">
                  Start Fundraising
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-primary object-cover" 
                    src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                    alt="User" 
                  />
                ))}
              </div>
              <p className="text-sm text-blue-200 font-medium">
                <span className="text-white font-bold">12k+</span> donors active today
              </p>
            </div>
          </div>
        </Container>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      </section>

      {/* Trust Stats Section */}
      <div className="bg-gray-50 border-y border-gray-100">
        <Container className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary">$45M+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Funded</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary">8.5k</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary">190</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary">100%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Causes</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Featured Campaigns */}
      <section className="py-24">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-neutral tracking-tighter mb-4">Urgent Needs.</h2>
              <p className="text-lg text-gray-500 font-medium">
                These campaigns are nearing their goals and need a final push to make a real difference.
              </p>
            </div>
            <Link to="/browse">
              <Button variant="primary" className="bg-gray-100 text-primary border-none hover:bg-gray-200">
                Browse All 2,400+
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </Container>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-neutral text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <Container className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black tracking-tighter mb-4">How HeartFund Works</h2>
            <p className="text-gray-400 font-medium text-lg">
              Simple, transparent, and direct. We connect those in need with those who care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-black">1</div>
              <h3 className="text-xl font-bold mb-3">Tell Your Story</h3>
              <p className="text-gray-400 leading-relaxed font-medium">Create a campaign in minutes. Share photos, videos, and your mission with our global community.</p>
            </div>
            <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6 text-xl font-black">2</div>
              <h3 className="text-xl font-bold mb-3">Spread the Word</h3>
              <p className="text-gray-400 leading-relaxed font-medium">Use our built-in sharing tools to reach millions across social platforms and via direct contact.</p>
            </div>
            <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-accent text-neutral rounded-2xl flex items-center justify-center mb-6 text-xl font-black">3</div>
              <h3 className="text-xl font-bold mb-3">Receive Funds</h3>
              <p className="text-gray-400 leading-relaxed font-medium">Withdraw donations directly to your account. We handle the security, you focus on the impact.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="py-24">
        <Container>
          <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <HeartIcon className="w-16 h-16 text-secondary mx-auto mb-8 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
                Ready to change a life?
              </h2>
              <p className="text-xl text-blue-100 font-medium mb-12 opacity-90">
                Join a community of thousands who believe that collective action can solve any problem.
              </p>
              <Link to="/register">
                <Button variant="accent" size="lg" className="py-5 px-12 text-xl shadow-xl shadow-amber-500/30">
                  Join the Movement
                </Button>
              </Link>
              <p className="mt-8 text-xs text-blue-200/60 font-bold uppercase tracking-widest">
                No monthly fees • Transparent Reporting • 24/7 Support
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
