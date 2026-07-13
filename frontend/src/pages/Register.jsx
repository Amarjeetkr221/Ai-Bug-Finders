import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative neon-grid">
      <div className="absolute w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] top-1/4 left-1/4 animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="text-4xl">🛡️</Link>
          <h2 className="text-2xl font-bold font-sans">Create Account</h2>
          <p className="text-xs text-slate-400">Unlock your free scan credits and secure your codebase</p>
        </div>

        <div className="glass-effect p-8 rounded-2xl border border-white/5 bg-slate-900/60 shadow-2xl">
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-lg">Registration Successful</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                A verification link has been dispatched to <strong className="text-white">{email}</strong>. 
                Please inspect your inbox (and spam folder) to activate your account.
              </p>
              <Link
                to="/login"
                className="mt-4 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs transition-colors text-white"
              >
                Proceed to Login
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
                  <label className="text-xs font-bold text-slate-400 block mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

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
                  <label className="text-xs font-bold text-slate-400 block mb-2">Password</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 transition-all font-bold text-sm text-white py-3.5 rounded-xl shadow-lg shadow-brand-500/20 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating...' : 'Register'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:underline font-semibold">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
