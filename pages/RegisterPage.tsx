import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await register(name, email, password);
    if (success) {
      navigate('/browse');
    } else {
      setError('User with this email already exists.');
    }
  };

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-extrabold text-neutral text-center mb-6">Create Your Account</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-6">
          <InputField id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name"/>
          <InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
          <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"/>
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-700">
            Log in
          </Link>
        </p>
      </div>
    </Container>
  );
};

export default RegisterPage;
