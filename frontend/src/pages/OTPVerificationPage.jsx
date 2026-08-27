import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const OTPVerificationPage = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only accept numeric
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take latest char
    setOtp(newOtp);
    setError('');

    // Advance to next box
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    if (!email) {
      setError('Email address is missing. Please return to login or registration.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await verifyOTP({ email, otp: fullOtp });
      if (res.success) {
        setSuccessMsg('Account verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(
        err.response?.data?.message || 'Invalid or expired verification code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOTP({ email });
      if (res.success) {
        setSuccessMsg('A new 6-digit code has been sent to your email.');
        setCooldown(60);
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(
        err.response?.data?.message || 'Failed to resend code. Please try again later.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181818] border border-[#272727] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Verify Your Email</h1>
          <p className="text-xs text-[#aaaaaa] max-w-xs">
            We sent a 6-digit verification code to
            {email ? (
              <span className="font-semibold text-white block mt-1">{email}</span>
            ) : (
              ' your registered email address'
            )}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!emailFromState && (
          <div>
            <label className="text-xs font-semibold text-[#aaaaaa]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#121212] border border-[#303030] rounded-xl px-4 py-2 text-sm text-white mt-1 focus:outline-none focus:border-red-500"
              required
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-bold bg-[#121212] border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                  digit ? 'border-red-500 bg-red-500/5' : 'border-[#303030]'
                }`}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="youtube"
            size="lg"
            isLoading={isLoading}
            disabled={otp.join('').length !== 6 || isLoading}
            className="w-full font-bold"
          >
            Verify & Activate Account
          </Button>
        </form>

        {/* Resend Cooldown section */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#272727] text-xs">
          <p className="text-[#717171]">Didn't receive the code?</p>
          <button
            type="button"
            disabled={cooldown > 0 || isResending}
            onClick={handleResend}
            className="flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300 disabled:text-[#666666] disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? (
              <span>Resend code in {cooldown}s</span>
            ) : (
              <span>Resend Verification Code</span>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-[#aaaaaa]">
          <Link to="/login" className="inline-flex items-center gap-1 text-blue-400 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
