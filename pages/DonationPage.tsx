
import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';

const DonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, updateDonation } = useCampaigns();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [isDonated, setIsDonated] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
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

  // SUCCESS HANDLER (REAL)
  const handleApprove = async (data: any, actions: any) => {
    try {
        const order = await actions.order.capture();
        finalizeDonation(order.id);
    } catch (err) {
        console.error("Capture Error:", err);
        setSimulationMsg({ type: 'error', text: 'An error occurred during payment capture.' });
    }
  };

  // SIMULATION HANDLERS
  const simulatePayment = (method: 'PayPal' | 'Card', result: 'success' | 'failure' | 'timeout') => {
    setSimulationMsg(null);
    
    if (result === 'success') {
      const mockTxnId = `SIM-${method.substring(0, 1).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      finalizeDonation(mockTxnId);
    } else if (result === 'failure') {
      setSimulationMsg({ 
        type: 'error', 
        text: `Simulated ${method} Payment Failure: Transaction was declined by the provider.` 
      });
    } else if (result === 'timeout') {
      setSimulationMsg({ 
        type: 'error', 
        text: `Simulated ${method} Timeout: The payment session has expired. Please try again.` 
      });
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

  if (isDonated) {
    return (
        <Container className="py-20 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl border-t-4 border-green-500">
                <h1 className="text-3xl font-extrabold text-green-600 mb-4">Thank You!</h1>
                <p className="text-lg text-gray-700 mb-6">Your generous donation of ${amount} to "{campaign.title}" has been successfully processed.</p>
                <div className="space-y-3">
                  <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="primary" className="w-full">
                      Back to Campaign
                  </Button>
                  <Button onClick={() => navigate('/history')} variant="accent" className="w-full">
                      View My History
                  </Button>
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
                              onError={(err: any) => {
                                  // Standard filter for noisy, benign PayPal SDK errors
                                  const rawMsg = err?.message || String(err);
                                  const msg = rawMsg.toLowerCase();
                                  
                                  const silentErrors = [
                                      "paypal_js_sdk_v5_unhandled_exception",
                                      "script error",
                                      "window host",
                                      "popup_close",
                                      "[object object]"
                                  ];

                                  if (silentErrors.some(term => msg.includes(term))) {
                                      console.debug("Filtered PayPal SDK noise:", rawMsg);
                                      return;
                                  }

                                  console.error("PayPal Error Details:", err);
                                  setSimulationMsg({ 
                                    type: 'error', 
                                    text: 'PayPal encountered a temporary issue. Please refresh or try our simulation tools below.' 
                                  });
                              }}
                          />
                      </div>
                  </PayPalScriptProvider>

                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Simulation Sandbox Tools</h3>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">DEV ONLY</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PayPal Simulations */}
                      <div className="space-y-2 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50/50">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tighter">PayPal Simulation</p>
                        <button onClick={() => simulatePayment('PayPal', 'success')} className="w-full py-2 px-3 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors">Simulate Success</button>
                        <button onClick={() => simulatePayment('PayPal', 'failure')} className="w-full py-2 px-3 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors">Simulate Decline</button>
                        <button onClick={() => simulatePayment('PayPal', 'timeout')} className="w-full py-2 px-3 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 transition-colors">Simulate Timeout</button>
                      </div>

                      {/* Card Simulations */}
                      <div className="space-y-2 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50/50">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tighter">Debit/Credit Simulation</p>
                        <button onClick={() => simulatePayment('Card', 'success')} className="w-full py-2 px-3 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors">Simulate Success</button>
                        <button onClick={() => simulatePayment('Card', 'failure')} className="w-full py-2 px-3 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors">Simulate Decline</button>
                        <button onClick={() => simulatePayment('Card', 'timeout')} className="w-full py-2 px-3 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 transition-colors">Simulate Timeout</button>
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

          <p className="text-xs text-gray-500 mt-6 text-center">
            Payments are simulated for demonstration. Your data is stored locally.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default DonationPage;
