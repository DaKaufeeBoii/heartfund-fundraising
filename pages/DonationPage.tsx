
import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const DonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, updateDonation } = useCampaigns();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [{ isPending }] = usePayPalScriptReducer();

  const [amount, setAmount] = useState('');
  const [isDonated, setIsDonated] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');
  const [simulationMsg, setSimulationMsg] = useState<{ type: 'error' | 'info' | 'warning', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const campaign = id ? getCampaignById(id) : undefined;
  const isExpired = campaign ? new Date(campaign.enddate) < new Date() : false;

  if (!id) return <Navigate to="/browse" />;
  
  if (isExpired) {
    return <Navigate to={`/campaign/${id}`} />;
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

  if (user && campaign.creatorid === user.id) {
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-red-100">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.3" /></svg>
            </div>
            <h2 className="text-2xl font-black text-neutral mb-2">Self-Donation Restricted</h2>
            <p className="text-gray-500 font-medium mb-6">To maintain platform integrity, you cannot donate to your own campaign.</p>
            <Link to={`/campaign/${id}`}>
                <Button variant="primary">Back to Campaign</Button>
            </Link>
        </div>
      </Container>
    );
  }

  const handleFinalizeDonation = async (transactionId: string) => {
    if (!user || !amount) return;
    setIsProcessing(true);
    try {
      const donationAmount = parseFloat(amount);
      await updateDonation(id, donationAmount);
      await storage.addDonationToHistory(user.id, {
        campaignid: id,
        campaigntitle: campaign.title,
        amount: donationAmount,
        transactionid: transactionId,
        date: new Date().toISOString()
      });
      setIsDonated(true);
      setLastTransactionId(transactionId);
    } catch (err) {
      console.error("Donation processing error:", err);
      setSimulationMsg({ type: 'error', text: 'Database update failed. Payment was received but your impact record needs manual sync.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isDonated) {
    return (
      <Container className="py-20">
        <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-4xl font-black text-neutral mb-4">Thank You, {user?.name}!</h2>
          <p className="text-xl text-gray-500 font-medium mb-8">Your contribution of <span className="text-primary font-black">${amount}</span> has been processed successfully.</p>
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
             <p className="font-mono text-sm text-gray-600">{lastTransactionId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <Link to="/history" className="flex-1">
                <Button variant="primary" className="w-full">View My History</Button>
             </Link>
             <Link to="/browse" className="flex-1">
                <Button variant="accent" className="w-full">Explore More</Button>
             </Link>
          </div>
        </div>
      </Container>
    );
  }

  const donationAmountValue = parseFloat(amount);
  const isValidAmount = !isNaN(donationAmountValue) && donationAmountValue >= 1;

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left: Campaign Summary */}
        <div className="flex-1 space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <Link to={`/campaign/${id}`} className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back to Campaign
              </Link>
              <img src={campaign.imageurls[0]} alt="" className="w-full aspect-video object-cover rounded-2xl mb-4" />
              <h1 className="text-2xl font-black text-neutral leading-tight mb-2">{campaign.title}</h1>
              <p className="text-gray-500 font-medium text-sm line-clamp-3">{campaign.description}</p>
           </div>
           
           <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-3 text-primary mb-2">
                <HeartIcon className="w-6 h-6 text-secondary" />
                <h3 className="font-bold">Transparent Giving</h3>
              </div>
              <p className="text-sm text-blue-700 font-medium">100% of your donation (minus payment processing fees) goes directly to the organizer.</p>
           </div>
        </div>

        {/* Right: Donation Form */}
        <div className="flex-1">
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="font-black text-primary animate-pulse">Confirming impact...</p>
              </div>
            )}

            <h2 className="text-3xl font-black text-neutral tracking-tight mb-8 text-center">Support this cause</h2>
            
            {simulationMsg && (
               <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${simulationMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                  {simulationMsg.text}
               </div>
            )}

            {!showPaypal ? (
              <div className="space-y-6">
                <InputField 
                  id="amount" 
                  label="Donation Amount ($)" 
                  type="number" 
                  min="1"
                  step="0.01"
                  placeholder="25.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSimulationMsg(null);
                  }}
                  className="h-16 text-2xl font-black text-primary text-center rounded-2xl border-gray-200"
                />
                
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(val => (
                    <button 
                      key={val} 
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`py-3 rounded-xl border-2 font-black text-sm transition-all ${amount === val.toString() ? 'border-primary bg-primary text-white shadow-lg' : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={() => setShowPaypal(true)}
                  variant="secondary" 
                  size="lg" 
                  disabled={!isValidAmount}
                  className="w-full py-5 text-xl shadow-xl shadow-red-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Continue to Payment
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Secure Encryption by PayPal
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Support</p>
                      <p className="text-2xl font-black text-primary">${donationAmountValue.toFixed(2)}</p>
                   </div>
                   <button 
                    onClick={() => setShowPaypal(false)} 
                    className="text-xs font-black text-gray-400 hover:text-neutral hover:underline uppercase tracking-widest"
                   >
                     Change
                   </button>
                </div>

                {isPending ? (
                  <div className="py-10 flex flex-col items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full mb-4"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading PayPal...</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                    <PayPalButtons 
                      style={{ layout: "vertical", shape: "pill", label: "donate" }}
                      createOrder={(data, actions) => {
                        // Fix for Error: Property 'intent' is missing but required
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              // Fix: Add currency_code to satisfy PayPal types
                              amount: {
                                currency_code: "USD",
                                value: donationAmountValue.toFixed(2),
                              },
                              description: `Donation to ${campaign.title}`
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          const details = await actions.order.capture();
                          handleFinalizeDonation(details.id);
                        }
                      }}
                      onCancel={() => {
                        setSimulationMsg({ type: 'warning', text: 'Payment cancelled. Your support still matters when you are ready!' });
                      }}
                      onError={(err) => {
                        console.error("PayPal Script Error", err);
                        setSimulationMsg({ type: 'error', text: 'PayPal encountered an error. Please refresh or try another method.' });
                      }}
                    />
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                   <p className="text-[10px] font-black text-gray-300 text-center uppercase tracking-widest mb-4">Developer Tools</p>
                   <button 
                    onClick={() => handleFinalizeDonation(`SIM-${Math.random().toString(36).substring(7).toUpperCase()}`)}
                    className="w-full py-3 text-xs font-black text-gray-400 hover:text-primary transition-colors border border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2"
                   >
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     Instant Simulation (Test DB)
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DonationPage;
