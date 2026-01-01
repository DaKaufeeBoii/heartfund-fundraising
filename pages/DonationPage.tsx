

import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
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
  const [amount, setAmount] = useState('');
  const [isDonated, setIsDonated] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');
  const [simulationMsg, setSimulationMsg] = useState<{ type: 'error' | 'info', text: string } | null>(null);

  const campaign = id ? getCampaignById(id) : undefined;

  if (!id) return <Navigate to="/browse" />;

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

  // SELF-DONATION GUARD
  // Verify that users are not donating to their own campaigns
  if (user && campaign.creatorId === user.id) {
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-red-100">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-neutral mb-2">Self-Donation Restricted</h1>
            <p className="text-gray-500 mb-8 font-medium">For security and integrity reasons, you cannot donate to a campaign you created. Try sharing it with your community instead!</p>
            <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="primary" className="w-full">
                Return to Campaign
            </Button>
        </div>
      </Container>
    );
  }

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);
    if (!isNaN(donationAmount) && donationAmount > 0) {
      setShowPaypal(true);
      setSimulationMsg(null);
    }
  };

  const finalizeDonation = (transactionId: string) => {
    const donationAmount = parseFloat(amount) || 0;
    updateDonation(campaign.id, donationAmount);
    setLastTransactionId(transactionId);
    
    if (user) {
      storage.addDonationToHistory(user.id, {
        id: `donate-${Date.now()}`,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        amount: donationAmount,
        date: new Date().toISOString(),
        transactionId: transactionId
      });
    }
    setIsDonated(true);
  };

  const handleApprove = async (data: any, actions: any) => {
    try {
        const order = await actions.order.capture();
        finalizeDonation(order.id);
    } catch (err) {
        console.error("Capture Error:", err);
        setSimulationMsg({ type: 'error', text: 'An error occurred during payment capture.' });
    }
  };

  const simulatePayment = (method: 'PayPal' | 'Card', result: 'success' | 'failure' | 'timeout') => {
    setSimulationMsg(null);
    if (result === 'success') {
      const mockTxnId = `SIM-${method.substring(0, 1).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      finalizeDonation(mockTxnId);
    } else if (result === 'failure') {
      setSimulationMsg({ type: 'error', text: `Simulated ${method} Payment Failure: Transaction was declined.` });
    } else if (result === 'timeout') {
      setSimulationMsg({ type: 'error', text: `Simulated ${method} Timeout: The session has expired.` });
    }
  };

  const handleCreateOrder = (data: any, actions: any) => {
      return actions.order.create({
          purchase_units: [{
              description: `Donation to ${campaign.title}`.substring(0, 127),
              amount: { value: amount }
          }]
      });
  };

  const downloadReceipt = () => {
    const dateStr = new Date().toLocaleString();
    const receiptContent = `
HEARTFUND OFFICIAL DONATION RECEIPT
===================================
Transaction ID: ${lastTransactionId}
Date: ${dateStr}
Campaign: ${campaign.title}
Donor: ${user?.name || 'Anonymous Donor'}
Amount: $${parseFloat(amount).toFixed(2)} USD

Status: COMPLETED
-----------------------------------
Thank you for your generous contribution. 
Your kindness makes a real difference.

HeartFund - Your Compassion in Action
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HeartFund_Receipt_${lastTransactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    window.print();
  };

  if (isDonated) {
    return (
        <Container className="py-20 print:py-0">
            <div className="max-w-xl mx-auto space-y-8">
              {/* Success Banner (Hidden on Print) */}
              <div className="text-center print:hidden">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-black text-neutral mb-2">Donation Successful!</h1>
                  <p className="text-lg text-gray-600">Your kindness just changed a life.</p>
              </div>

              {/* Official Receipt Card */}
              <div id="receipt-area" className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-gray-100 relative overflow-hidden print:shadow-none print:border-none print:p-0">
                {/* Visual Decorative Slant */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] print:hidden"></div>
                
                <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-dashed border-gray-200">
                  <HeartIcon className="h-10 w-10 text-secondary" />
                  <div>
                    <h2 className="text-2xl font-black text-primary tracking-tighter">HeartFund</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Receipt</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Donor Name</p>
                      <p className="text-lg font-bold text-neutral">{user?.name || 'Anonymous Donor'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                      <p className="text-sm font-semibold text-neutral">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Campaign Contribution</p>
                    <p className="text-xl font-bold text-primary mb-1">{campaign.title}</p>
                    <p className="text-sm text-gray-500">Beneficiary: {campaign.creator}</p>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Transaction ID</p>
                      <p className="text-xs font-mono text-gray-500 break-all max-w-[200px]">{lastTransactionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Amount Paid</p>
                      <p className="text-4xl font-black text-secondary">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center border-t border-gray-100 pt-8">
                  <p className="text-xs text-gray-400 italic font-medium">
                    "Helping one person might not change the world, but it could change the world for that one person."
                  </p>
                  <p className="mt-4 text-[9px] text-gray-300 uppercase tracking-widest font-bold">Generated by HeartFund Verification System</p>
                </div>
              </div>

              {/* Actions (Hidden on Print) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
                <Button onClick={downloadReceipt} variant="primary" className="flex items-center justify-center gap-2 py-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download .txt Receipt
                </Button>
                <Button onClick={printReceipt} variant="accent" className="flex items-center justify-center gap-2 py-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print to PDF
                </Button>
                <div className="sm:col-span-2 space-y-3 pt-4">
                  <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="secondary" className="w-full py-4 text-lg">
                      Return to Campaign
                  </Button>
                  <Link to="/history" className="block text-center text-sm font-bold text-primary hover:underline">
                      View Donation in My History
                  </Link>
                </div>
              </div>
            </div>
        </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-20">
      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-neutral tracking-tight">Support "{campaign.title}"</h1>
              <p className="mt-2 text-md text-gray-600">Secure Checkout</p>
          </div>

          {!showPaypal ? (
              <form onSubmit={handleProceed} className="space-y-6">
                  <InputField 
                      id="donationAmount" 
                      label="Donation Amount (USD)" 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      required 
                      min="1"
                      placeholder="Enter amount"
                  />
                  <Button type="submit" variant="secondary" size="lg" className="w-full">
                      Proceed to Payment
                  </Button>
              </form>
          ) : (
              <div className="space-y-6">
                  {simulationMsg && (
                    <div className={`p-4 rounded-md text-sm font-medium ${simulationMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {simulationMsg.text}
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="font-semibold text-lg">Total Amount: ${amount}</p>
                  </div>

                  <PayPalScriptProvider options={{ 
                      "clientId": "test", 
                      "currency": "USD",
                      "intent": "capture"
                  }}>
                      <div className="min-h-[150px] relative z-0">
                          <PayPalButtons 
                              style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" } as any}
                              createOrder={handleCreateOrder}
                              onApprove={handleApprove}
                          />
                      </div>
                  </PayPalScriptProvider>

                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Simulation Sandbox Tools</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50/50">
                        <button onClick={() => simulatePayment('PayPal', 'success')} className="w-full py-2 px-3 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors">PayPal: Success</button>
                        <button onClick={() => simulatePayment('PayPal', 'failure')} className="w-full py-2 px-3 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors">PayPal: Decline</button>
                      </div>
                      <div className="space-y-2 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50/50">
                        <button onClick={() => simulatePayment('Card', 'success')} className="w-full py-2 px-3 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors">Card: Success</button>
                        <button onClick={() => simulatePayment('Card', 'failure')} className="w-full py-2 px-3 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors">Card: Decline</button>
                      </div>
                    </div>
                  </div>

                  <button 
                      onClick={() => setShowPaypal(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 w-full text-center underline mt-4"
                  >
                      Cancel and change amount
                  </button>
              </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DonationPage;