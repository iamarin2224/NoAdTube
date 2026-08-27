import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { 
  User, 
  Mail, 
  Lock, 
  AtSign, 
  Image as ImageIcon, 
  AlertCircle, 
  UploadCloud 
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('fullname', fullname.trim());
    formData.append('username', username.trim().toLowerCase());
    formData.append('email', email.trim().toLowerCase());
    formData.append('password', password);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    try {
      const res = await register(formData);
      if (res.success) {
        // Navigate directly to OTP verification page
        navigate('/verify-otp', {
          state: { email: email.trim().toLowerCase() },
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Failed to register. Please check your info.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-[#181818] border border-[#272727] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center w-12 h-10 bg-red-600 rounded-xl shadow-lg">
            <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Create your NoAdTube Account</h1>
          <p className="text-xs text-[#aaaaaa]">
            Start uploading videos, interacting with community tweets, and growing your channel
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <GoogleSignInButton onError={(msg) => setError(msg)} text="Sign up with Google" />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#272727]" />
          <span className="text-xs text-[#717171] uppercase tracking-wider font-semibold">Or fill details</span>
          <div className="flex-1 h-px bg-[#272727]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Avatar & Cover Pickers */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#121212] border border-[#272727] rounded-2xl">
            {/* Avatar */}
            <div
              onClick={() => avatarRef.current?.click()}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="relative">
                <Avatar
                  src={avatarPreview}
                  size="xl"
                  fallbackText={username || fullname || 'U'}
                  className="group-hover:opacity-80 transition-opacity ring-2 ring-red-500/50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <UploadCloud className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-red-400">
                {avatarFile ? 'Change Avatar' : 'Avatar (Optional)'}
              </span>
            </div>

            {/* Cover image */}
            <div
              onClick={() => coverRef.current?.click()}
              className="flex-1 w-full border border-dashed border-[#3f3f3f] hover:border-white rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-colors"
            >
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverPreview ? (
                <div className="w-full h-16 rounded-lg overflow-hidden">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 text-[#aaaaaa]" />
                  <span className="text-xs text-[#f1f1f1] font-medium">
                    Channel Cover Image
                  </span>
                  <span className="text-[10px] text-[#717171]">(Optional)</span>
                </>
              )}
            </div>
          </div>

          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            icon={User}
            required
          />

          <Input
            label="Username"
            placeholder="e.g. johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={AtSign}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
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
            Create Account & Verify OTP
          </Button>
        </form>

        <div className="text-center text-xs text-[#aaaaaa]">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
