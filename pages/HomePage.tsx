
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { storage } from '../services/storage';
import CampaignCard from '../components/CampaignCard';
import Container from '../components/Container';
import Button from '../components/Button';
import { HeartIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const { campaigns } = useCampaigns();
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const featuredCampaigns = campaigns.slice(0, 3);

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await storage.getGlobalRecentDonations(5);
      setRecentDonations(activity);
    };
    fetchActivity();
    // Poll for updates every 30 seconds for a "live" feel
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

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
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto py-5 px-10 text-xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] bg-secondary hover:bg-red-700 hover:scale-105 transform transition-all duration-300 border-none"
                >
                  Start Fundraising
                </Button>
              </Link>
            </div>
          </div>
        </Container>
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
                Browse All
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

      {/* Community Heartbeat Feed Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <HeartIcon className="w-8 h-8 text-secondary animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-neutral tracking-tight">Community Heartbeat</h2>
                <p className="text-gray-500 font-medium">Real-time impact from donors just like you.</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentDonations.length > 0 ? (
                recentDonations.map((donation, idx) => (
                  <div 
                    key={donation.id || idx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary font-black text-xl">
                        {(donation.profiles?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-neutral font-black">
                          {donation.profiles?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          donated to <Link to={`/campaign/${donation.campaignId}`} className="text-primary hover:underline">{donation.campaignTitle}</Link>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-black text-secondary">${donation.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(donation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
                      <Link to={`/campaign/${donation.campaignId}`}>
                        <Button variant="primary" size="sm" className="bg-primary/5 text-primary hover:bg-primary hover:text-white border-none shadow-none">
                          View Cause
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium italic">Waiting for new heartbeats...</p>
                </div>
              )}
            </div>
            
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-400 font-medium">
                Every contribution matters. Join the feed by supporting a cause.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="py-24">
        <Container>
          <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
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
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
