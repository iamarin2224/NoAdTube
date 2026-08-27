import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { Lock, User, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    const isEmail = usernameOrEmail.includes('@');
    const credentials = isEmail
      ? { email: usernameOrEmail.trim().toLowerCase(), password }
      : { username: usernameOrEmail.trim().toLowerCase(), password };

    try {
      const res = await login(credentials);
      if (res.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      // Check if unverified user
      if (err.response?.status === 403 && err.response?.data?.data?.isVerified === false) {
        const unverifiedEmail = err.response.data.data.email || (isEmail ? usernameOrEmail.trim() : '');
        navigate('/verify-otp', { state: { email: unverifiedEmail } });
        return;
      }
      setError(
        err.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181818] border border-[#272727] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center w-12 h-10 bg-red-600 rounded-xl shadow-lg">
            <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Sign in to NoAdTube</h1>
          <p className="text-xs text-[#aaaaaa]">
            to continue to videos, tweets, subscriptions, and creator tools
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <GoogleSignInButton onError={(msg) => setError(msg)} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#272727]" />
          <span className="text-xs text-[#717171] uppercase tracking-wider font-semibold">Or with password</span>
          <div className="flex-1 h-px bg-[#272727]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email or Username"
            type="text"
            placeholder="e.g. arind or user@noadtube.com"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            icon={User}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="youtube"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold mt-2"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-[#aaaaaa]">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
