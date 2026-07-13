import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(res.data.message || 'Password reset link has been dispatched to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit reset query.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 neon-grid">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Link to="/login" className="self-start text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h2 className="text-xl font-bold font-sans">Forgot Password</h2>
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Enter your email address and we will dispatch a password recovery link.
          </p>
        </div>

        {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold leading-relaxed">{success}</div>}
        {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">{error}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 transition-all font-bold text-sm text-white py-3.5 rounded-xl shadow-lg shadow-brand-500/20 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Dispatched...' : 'Send Recovery Link'}
              <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
