
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';
import type { User } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    const mockUser: User = {
        id: 'user1',
        name: 'Jane Doe',
        email: email,
        avatar: 'https://picsum.photos/seed/user1/100/100'
    };
    login(mockUser);
    navigate('/');
  };

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-extrabold text-neutral text-center mb-6">Welcome Back!</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Log In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </Container>
  );
};

export default LoginPage;
