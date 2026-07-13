import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must contain at least 6 characters.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 neon-grid">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🛡️</span>
          <h2 className="text-xl font-bold font-sans">Reset Password</h2>
          <p className="text-xs text-slate-400">Specify your new account password</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-lg">Password Reset Complete</h3>
            <p className="text-xs text-slate-400">You can now sign in using your new credentials.</p>
            <Link
              to="/login"
              className="mt-4 px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-sm transition-colors text-white"
            >
              Log In
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 transition-all font-bold text-sm text-white py-3.5 rounded-xl shadow-lg shadow-brand-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? 'Resubmitting...' : 'Save Password'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
