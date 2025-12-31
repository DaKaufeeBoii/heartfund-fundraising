
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/browse');
      } else {
        setError(result.error || 'Check your credentials and try again.');
      }
    } catch (err) {
      setError('A connection error occurred. Please check your Supabase config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#f8fafc] px-4">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary clip-path-slant z-0 opacity-[0.03]"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="px-8 pt-10 pb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/5 p-4 rounded-2xl transform rotate-3">
                <HeartIcon className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-neutral tracking-tight">Welcome Back</h1>
              <p className="mt-2 text-gray-500 font-medium">Continue your journey of making an impact.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <InputField 
                id="email" 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email" 
                placeholder="you@email.com"
              />
              <div>
                <div className="flex justify-between mb-1">
                   <label className="block text-sm font-semibold text-gray-700">Password</label>
                   <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
                </div>
                <InputField 
                  id="password" 
                  label="" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="current-password" 
                  placeholder="••••••••"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </span>
                ) : "Sign In to HeartFund"}
              </Button>
            </form>
          </div>

          <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 font-medium">
              New to our community?{' '}
              <Link to="/register" className="text-primary font-extrabold hover:text-blue-800 transition-colors">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
