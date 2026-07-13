import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Globe, 
  Lock, 
  ShieldAlert, 
  Check, 
  Zap,
  Trash2,
  LockKeyhole
} from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    country: user?.country || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    avatar: user?.avatar || ''
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [is2faEnabled, setIs2faEnabled] = useState(user?.twoFactorEnabled || false);

  // Status logs
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const skillsArray = profileForm.skills
        ? profileForm.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const res = await axios.put('/api/user/profile', {
        ...profileForm,
        skills: skillsArray
      });

      if (res.data.success) {
        setProfileMsg({ type: 'success', text: res.data.message });
        await refreshUser();
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
    }

    setLoading(true);
    try {
      const res = await axios.put('/api/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: res.data.message });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Password update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!window.confirm(`Do you wish to purchase the ${plan === 'premium' ? 'Professional Plan' : '10 Credits bundle'}?`)) return;
    try {
      const res = await axios.post('/api/user/upgrade', { plan });
      if (res.data.success) {
        alert(res.data.message);
        await refreshUser();
      }
    } catch (err) {
      alert('Upgrade failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggle2fa = async () => {
    const nextState = !is2faEnabled;
    try {
      const res = await axios.post('/api/user/2fa', { enable: nextState });
      if (res.data.success) {
        setIs2faEnabled(res.data.twoFactorEnabled);
        alert(res.data.message);
      }
    } catch (err) {
      alert('2FA toggle failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete your account? This action is permanent and deletes all scan histories.')) return;
    try {
      const res = await axios.delete('/api/user/account');
      if (res.data.success) {
        alert(res.data.message);
        logout();
      }
    } catch (err) {
      alert('Account deletion failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Edit profile */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Profile Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-bold text-sm">Profile Details</h3>
            <p className="text-xs text-slate-400">Update your developer profile details</p>
          </div>

          {profileMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              profileMsg.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Display Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="JavaScript, Python, Rust"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-2">Bio / Description</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Country</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.country}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none"
                />
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Avatar Image URL</label>
              <input
                type="text"
                placeholder="https://image-link.com/avatar.png"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">GitHub Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.github}
                  onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none"
                />
                <Github size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">LinkedIn Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.linkedin}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none"
                />
                <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-2">Portfolio website URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.portfolio}
                  onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none"
                />
                <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-xs shadow-md mt-2 self-start"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change password Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-bold text-sm">Change Password</h3>
            <p className="text-xs text-slate-400">Secure your account credentials</p>
          </div>

          {passwordMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              passwordMsg.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-colors self-start mt-2"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Premium Plans & Security */}
      <div className="flex flex-col gap-8">
        
        {/* Subscription billing details */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-6 shadow-sm relative overflow-hidden">
          {user?.role === 'Premium User' && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-slate-950 font-bold text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap size={8} /> PROFESSIONAL
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm">Pricing Plans</h3>
            <p className="text-xs text-slate-400">Upgrade your credits or billing options</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 flex flex-col gap-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Current Usage Tier</span>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm capitalize">{user?.role}</span>
              <span className="font-bold text-xs text-indigo-500 font-mono">
                {user?.role === 'Premium User' ? 'Unlimited Credits' : `${user?.credits} Credits Remaining`}
              </span>
            </div>
          </div>

          {user?.role === 'User' ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleUpgrade('premium')}
                className="w-full bg-brand-500 hover:bg-brand-600 transition-colors py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Upgrade to Professional ($29/mo)
              </button>
              <button
                onClick={() => handleUpgrade('credits-10')}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-xs font-bold transition-all"
              >
                Buy 10 Scan Credits ($5)
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border-l-4 border-green-500 bg-green-500/5 text-[11px] text-slate-400 leading-relaxed">
              Professional Suite active. Your account is exempted from credit limits and priority queues. Thank you for your support!
            </div>
          )}
        </div>

        {/* Security Settings: 2FA & Delete Account */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-bold text-sm">Security & Privacy</h3>
            <p className="text-xs text-slate-400">Manage account access controls</p>
          </div>

          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <LockKeyhole size={18} className="text-slate-400" />
              <div>
                <h4 className="font-bold text-xs">Two-Factor Auth</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Protect sign-ins with an OTP code</p>
              </div>
            </div>
            
            <button
              onClick={handleToggle2fa}
              className={`w-10 h-6 rounded-full p-0.5 transition-colors relative ${is2faEnabled ? 'bg-green-500' : 'bg-slate-350 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${is2faEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-6">
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors text-xs font-bold flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Delete Account permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
