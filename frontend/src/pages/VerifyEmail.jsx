import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await axios.get(`/api/auth/verify-email/${token}`);
      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 neon-grid">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl text-center flex flex-col items-center gap-6">
        <span className="text-4xl">🛡️</span>
        
        {status === 'loading' && (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="font-bold text-lg">Verifying your email...</h3>
            <p className="text-xs text-slate-400">Verifying secure activation token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-lg">Email Verified Successfully</h3>
            <p className="text-xs text-slate-400 max-w-xs">{message}</p>
            <Link
              to="/login"
              className="mt-4 px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-sm transition-colors text-white"
            >
              Sign In to Account
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <XCircle size={32} />
            </div>
            <h3 className="font-bold text-lg">Verification Failed</h3>
            <p className="text-xs text-rose-400 max-w-xs">{message}</p>
            <Link
              to="/register"
              className="mt-4 px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-sm transition-colors"
            >
              Register Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
