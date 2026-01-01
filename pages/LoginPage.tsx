
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/browse');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Charity background" 
          />
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <HeartIcon className="h-12 w-12 text-secondary" />
            <span className="text-4xl font-black tracking-tighter">HeartFund</span>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">Welcome back to the family of changemakers.</h2>
          <p className="text-blue-100 text-lg font-medium opacity-90">
            Log in to manage your campaigns, track your impact, and continue spreading hope across the globe.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <HeartIcon className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-black text-primary">HeartFund</span>
            </div>
            <h1 className="text-3xl font-black text-neutral">Sign In</h1>
          </div>

          <div className="hidden lg:block mb-10">
            <h1 className="text-4xl font-black text-neutral mb-2">Sign In</h1>
            <p className="text-gray-500 font-medium">Enter your details to access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <InputField 
              id="email" 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              autoComplete="email" 
              className="h-12 text-base rounded-xl border-gray-200"
            />
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
              </div>
              <InputField 
                id="password" 
                label="" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password" 
                className="h-12 text-base rounded-xl border-gray-200"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              disabled={isSubmitting}
              className="w-full py-4 text-lg rounded-xl shadow-xl shadow-blue-100 flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Or continue with</span></div>
          </div>

          <div className="mt-6 flex gap-4">
            <button type="button" className="flex-1 flex items-center justify-center py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
              <span className="text-sm font-bold text-gray-600">Google</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-gray-500">
            New to HeartFund?{' '}
            <Link to="/register" className="font-black text-primary hover:text-blue-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
