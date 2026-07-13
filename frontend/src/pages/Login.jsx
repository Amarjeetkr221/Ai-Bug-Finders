import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const handleGoogleMock = async () => {
    setError('');
    setLoading(true);
    // Mock successful profile retrieval from Google SSO
    const mockProfile = {
      name: 'John Doe',
      email: email || 'johndoe@gmail.com',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    const res = await googleLogin(mockProfile);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative neon-grid">
      <div className="absolute w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] top-1/4 left-1/4 animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="text-4xl">🛡️</Link>
          <h2 className="text-2xl font-bold font-sans">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to check credit balances and run code scans</p>
        </div>

        <div className="glass-effect p-8 rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-brand-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Logging in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-3 text-slate-600 my-1">
            <hr className="flex-1 border-white/5"/>
            <span className="text-[10px] font-bold">OR LOGIN WITH</span>
            <hr className="flex-1 border-white/5"/>
          </div>

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleMock}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.32-2.833-6.32-6.32s2.832-6.32 6.32-6.32c1.724 0 3.23.69 4.316 1.8l3.1-3.1C18.91 2.222 15.83 1 12.24 1C5.786 1 .5 6.286.5 12.74S5.786 24.48 12.24 24.48c6.15 0 11.233-4.484 11.233-11.233 0-.756-.07-1.488-.2-2.182H12.24Z" />
            </svg>
            Google Authenticator
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:underline font-semibold">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
