
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isEmailServiceError = error.includes('Error sending confirmation email');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await register(name, email, password);
      if (result.success) {
        // If Supabase returned a session, it means email confirmation is disabled/auto-confirmed
        if (result.data?.session) {
          navigate('/browse');
        } else {
          // Otherwise, they need to check their email
          setNeedsConfirmation(true);
        }
      } else {
        setError(result.error || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-gray-100">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-neutral mb-4">Confirm Your Email</h2>
          <p className="text-gray-500 font-medium mb-8">
            We've sent a magic link to <span className="text-primary font-bold">{email}</span>. 
            Please check your inbox (and spam folder) to activate your account.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Return to Login</Button>
          </Link>
          <p className="mt-6 text-xs text-gray-400">
            Didn't receive it? Check your Supabase project settings to see if email confirmation is required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row-reverse bg-white">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1459183885447-df801f712bc0?w=1200&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Community background" 
          />
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <HeartIcon className="h-12 w-12 text-accent" />
            <span className="text-4xl font-black tracking-tighter">HeartFund</span>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">Start your journey of giving today.</h2>
          <p className="text-gray-300 text-lg font-medium opacity-90">
            Join thousands of others who are making a difference. From small acts to massive movements, it all starts with one account.
          </p>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <HeartIcon className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-black text-primary">HeartFund</span>
            </div>
            <h1 className="text-3xl font-black text-neutral">Create Account</h1>
          </div>

          <div className="hidden lg:block mb-10">
            <h1 className="text-4xl font-black text-neutral mb-2">Create Account</h1>
            <p className="text-gray-500 font-medium">Join our global community today</p>
          </div>

          {error && (
            <div className={`mb-6 p-5 rounded-2xl border-l-4 flex flex-col gap-2 ${isEmailServiceError ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${isEmailServiceError ? 'text-amber-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-black uppercase tracking-tight ${isEmailServiceError ? 'text-amber-800' : 'text-red-800'}`}>
                  {isEmailServiceError ? 'Email Service Limit Reached' : 'Registration Error'}
                </p>
              </div>
              <p className={`text-sm font-medium ${isEmailServiceError ? 'text-amber-700' : 'text-red-700'}`}>
                {error}
              </p>
              
              {isEmailServiceError && (
                <div className="mt-2 p-3 bg-white/50 rounded-xl border border-amber-200">
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Developer Tip:</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Go to your <strong>Supabase Dashboard</strong> = <strong>Authentication</strong> = <strong>Providers</strong> = <strong>Email</strong> and turn off <strong>"Confirm email"</strong> to allow instant signups without sending emails.
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <InputField 
              id="name" 
              label="Full Name" 
              type="text" 
              placeholder="John Doe"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              autoComplete="name" 
              className="h-12 rounded-xl border-gray-200"
            />
            <InputField 
              id="email" 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              autoComplete="email" 
              className="h-12 rounded-xl border-gray-200"
            />
            <InputField 
              id="password" 
              label="Password" 
              type="password" 
              placeholder="Minimum 8 characters"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password" 
              className="h-12 rounded-xl border-gray-200"
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                variant="accent" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full py-4 text-lg rounded-xl shadow-xl shadow-amber-100 font-black flex justify-center items-center"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-neutral" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Join Now'}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
            By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-primary hover:text-blue-700 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
