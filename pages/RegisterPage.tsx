
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/browse');
      } else {
        setError(result.error || 'Registration failed. Try a different email.');
      }
    } catch (err) {
      setError('Could not reach server. Check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white lg:bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Brand & Social Proof */}
        <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-2 text-white mb-12">
              <HeartIcon className="h-8 w-8 text-accent" />
              <span className="text-2xl font-black tracking-tighter">HeartFund</span>
            </Link>
            
            <h2 className="text-4xl font-extrabold leading-tight mb-6">Start a ripple of change today.</h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="mt-1 bg-white/20 p-1 rounded-full"><svg className="h-3 w-3 fill-white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></div>
                <p className="text-blue-100">Launch a campaign in under 5 minutes.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="mt-1 bg-white/20 p-1 rounded-full"><svg className="h-3 w-3 fill-white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></div>
                <p className="text-blue-100">Zero fees for community fundraisers.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="mt-1 bg-white/20 p-1 rounded-full"><svg className="h-3 w-3 fill-white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></div>
                <p className="text-blue-100">Secure, encrypted transactions via PayPal.</p>
              </li>
            </ul>
          </div>
          
          <div className="relative z-10 pt-12 border-t border-white/10">
            <p className="text-sm font-medium italic opacity-80">"HeartFund helped us raise $10k for our local park in just two weeks. Truly amazing platform!"</p>
            <p className="mt-2 text-xs font-bold">— Sarah J., Community Leader</p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 sm:p-12">
          <div className="lg:hidden flex justify-center mb-8">
            <HeartIcon className="h-10 w-10 text-secondary" />
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-neutral tracking-tight">Create Account</h2>
            <p className="mt-2 text-gray-500 font-medium">Join 5,000+ people making a difference.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <InputField 
              id="name" 
              label="Full Name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              autoComplete="name"
              placeholder="Jane Doe"
            />
            <InputField 
              id="email" 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              autoComplete="email"
              placeholder="jane@example.com"
            />
            <InputField 
              id="password" 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                variant="accent" 
                size="lg" 
                className="w-full shadow-xl shadow-accent/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating Account...
                  </span>
                ) : "Join HeartFund"}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary font-extrabold hover:text-red-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
