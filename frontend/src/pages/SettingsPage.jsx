import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, isAuthenticated, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Account details state
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState({ type: '', text: '' });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Cover image state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!fullname.trim() || !email.trim()) return;

    setIsUpdatingAccount(true);
    setAccountMsg({ type: '', text: '' });
    try {
      const res = await authApi.updateAccountDetails({
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setAccountMsg({ type: 'success', text: 'Account details updated successfully!' });
      }
    } catch (err) {
      setAccountMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update account details.',
      });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;

    setIsUpdatingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await authApi.updateAvatar(formData);
      if (res.success && res.data) {
        updateUser(res.data);
        setAvatarFile(null);
        setAvatarPreview('');
        setAccountMsg({ type: 'success', text: 'Avatar image updated!' });
      }
    } catch (err) {
      setAccountMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update avatar.',
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleUpdateCover = async () => {
    if (!coverFile) return;

    setIsUpdatingCover(true);
    const formData = new FormData();
    formData.append('coverImage', coverFile);

    try {
      const res = await authApi.updateCoverImage(formData);
      if (res.success && res.data) {
        updateUser(res.data);
        setCoverFile(null);
        setCoverPreview('');
        setAccountMsg({ type: 'success', text: 'Cover image updated!' });
      }
    } catch (err) {
      setAccountMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update cover image.',
      });
    } finally {
      setIsUpdatingCover(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setIsChangingPass(true);
    setPassMsg({ type: '', text: '' });
    try {
      const res = await authApi.changePassword({ oldPassword, newPassword });
      if (res.success) {
        setOldPassword('');
        setNewPassword('');
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      }
    } catch (err) {
      setPassMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#272727]">
        <div className="p-2.5 bg-[#272727] text-white rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Channel & Account Settings</h1>
          <p className="text-xs text-[#aaaaaa]">
            Manage your personal profile, branding images, and security credentials
          </p>
        </div>
      </div>

      {/* Profile & Branding Section */}
      <div className="bg-[#181818] border border-[#272727] rounded-3xl p-6 flex flex-col gap-6">
        <h2 className="text-base font-bold text-white">Channel Branding</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar update */}
          <div className="flex flex-col items-center sm:items-start gap-4 p-4 bg-[#121212] border border-[#272727] rounded-2xl">
            <span className="text-sm font-semibold text-white">Profile Picture</span>
            <div className="flex items-center gap-4">
              <Avatar
                src={avatarPreview || user?.avatar}
                alt={user?.fullname}
                size="xl"
              />
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="settings-avatar"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="settings-avatar"
                  className="px-4 py-1.5 bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-semibold rounded-full cursor-pointer transition-colors text-center"
                >
                  Choose New Photo
                </label>
                {avatarFile && (
                  <Button
                    variant="youtube"
                    size="sm"
                    onClick={handleUpdateAvatar}
                    isLoading={isUpdatingAvatar}
                  >
                    Save Avatar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Cover image update */}
          <div className="flex flex-col gap-4 p-4 bg-[#121212] border border-[#272727] rounded-2xl">
            <span className="text-sm font-semibold text-white">Banner / Cover Image</span>
            {coverPreview || user?.coverImage ? (
              <div className="w-full h-20 rounded-xl overflow-hidden bg-black/40">
                <img
                  src={coverPreview || user?.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="settings-cover"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCoverFile(file);
                    setCoverPreview(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="settings-cover"
                className="px-4 py-1.5 bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-semibold rounded-full cursor-pointer transition-colors text-center"
              >
                Upload New Banner
              </label>
              {coverFile && (
                <Button
                  variant="youtube"
                  size="sm"
                  onClick={handleUpdateCover}
                  isLoading={isUpdatingCover}
                >
                  Save Banner
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="bg-[#181818] border border-[#272727] rounded-3xl p-6 flex flex-col gap-6">
        <h2 className="text-base font-bold text-white">Account Details</h2>

        {accountMsg.text && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              accountMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {accountMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{accountMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAccount} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            icon={User}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="youtube"
              size="md"
              isLoading={isUpdatingAccount}
              className="font-bold"
            >
              Update Account Info
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-[#181818] border border-[#272727] rounded-3xl p-6 flex flex-col gap-6">
        <h2 className="text-base font-bold text-white">Security & Password</h2>

        {passMsg.text && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {passMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={Lock}
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isChangingPass}
              className="font-bold"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
