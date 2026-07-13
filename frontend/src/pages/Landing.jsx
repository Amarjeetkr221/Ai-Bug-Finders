import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  Cpu, 
  History, 
  MessageSquare, 
  Play, 
  Check, 
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Github,
  Linkedin
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  // Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Seed content on startup, then fetch content
    seedAndFetch();
  }, []);

  const seedAndFetch = async () => {
    try {
      // Trigger seeder
      await axios.post('/api/public/seed');
      
      const faqRes = await axios.get('/api/public/faqs');
      if (faqRes.data.success) setFaqs(faqRes.data.faqs);

      const testRes = await axios.get('/api/public/testimonials');
      if (testRes.data.success) setTestimonials(testRes.data.testimonials);
    } catch (err) {
      console.error('Failed to load landing content:', err);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess('');
    setFormError('');
    try {
      const res = await axios.post('/api/public/contact', contactForm);
      if (res.data.success) {
        setFormSuccess(res.data.message);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setFormLoading(false);
    }
  };

  const features = [
    { title: 'Security Scan', desc: 'Checks code against OWASP Top 10 vulnerabilities, hardcoded secrets, and buffer limits.', icon: ShieldCheck },
    { title: 'Complexity Meter', desc: 'Estimates cyclomatic complexity, readability, and structural maintainability scores.', icon: Cpu },
    { title: 'Code History logs', desc: 'Automatically saves every scan, offering quick filters, favoriting, and downloads.', icon: History },
    { title: 'Interactive Chat', desc: 'Chat directly with Gemini about your scanned files. Ask for tests or conversions.', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans relative neon-grid">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-80 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>

      {/* Navigation bar */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              AI BUG DETECTOR
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider">SECURE DEVELOPER SUITE</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold hover:text-indigo-400 transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20 transition-all text-white"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold w-fit mx-auto lg:mx-0">
            <Sparkles size={12} /> Powered by Gemini Generative AI
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-sans tracking-tight">
            Detect, Explain, and <br/>
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Fix Code Bugs
            </span> Instantly.
          </h2>
          
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
            Secure, optimize, and document your source code using automated AI assessments. Built with split screen diff comparisons and analytical charts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 group"
            >
              Start Free Scan
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Floating Animation mockup */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-brand-500/20 rounded-2xl blur-2xl"></div>
          
          <div className="relative glass-effect bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-10 bg-slate-950/80 px-4 border-b border-white/5 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-xs font-mono text-slate-500 ml-4">buggy_snippet.py</span>
            </div>
            
            <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
              <p className="text-slate-500"># Analysis scans trigger instant results</p>
              <p><span className="text-rose-400">def</span> <span className="text-indigo-400">calculate_ratio</span>(values):</p>
              <p className="pl-4">sum_val = sum(values)</p>
              <p className="pl-4 bg-rose-500/10 border-l-2 border-rose-500"><span className="text-slate-400"># Bug: Division by zero risk</span></p>
              <p className="pl-4 bg-rose-500/10 border-l-2 border-rose-500">return values[0] / sum_val</p>
              <p className="text-slate-500 mt-4"># AI Fixed Code Recommendations</p>
              <p className="text-green-400 pl-4">if sum_val == 0: return 0</p>
              <p className="text-green-400 pl-4">return values[0] / sum_val</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">CAPABILITIES</span>
          <h3 className="text-3xl sm:text-4xl font-bold mt-2">Engineered for Modern Engineering Reviews</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-lg mb-2">{feat.title}</h4>
                <p className="text-slate-400 text-sm">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-28 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">WORKFLOW</span>
          <h3 className="text-3xl sm:text-4xl font-bold mt-2">Simple 3-Step Refactoring</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center text-lg font-bold mb-6 relative z-10 shadow-lg shadow-brand-500/25">
              1
            </div>
            <h4 className="font-bold text-lg mb-2">Input Source Code</h4>
            <p className="text-slate-400 text-sm max-w-xs">Paste your code snippet directly or upload files of any of the 14 supported languages.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center text-lg font-bold mb-6 relative z-10 shadow-lg shadow-brand-500/25">
              2
            </div>
            <h4 className="font-bold text-lg mb-2">Analyze Findings</h4>
            <p className="text-slate-400 text-sm max-w-xs">AI checks syntax errors, logical flows, execution speeds, and assigns numeric quality grades.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center text-lg font-bold mb-6 relative z-10 shadow-lg shadow-brand-500/25">
              3
            </div>
            <h4 className="font-bold text-lg mb-2">One-Click Fixes</h4>
            <p className="text-slate-400 text-sm max-w-xs">Examine side-by-side Monaco diff changes, export custom PDF logs, or chat about optimizations.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-28 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">PRICING PLANS</span>
          <h3 className="text-3xl sm:text-4xl font-bold mt-2">Transparent Premium Refactor Plans</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-slate-400">Developer Starter</h4>
              <p className="text-sm text-slate-500 mt-2">Perfect for simple portfolio inspection and quick fixes.</p>
              
              <div className="my-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500">/ forever</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-slate-350">
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> 5 Scan Credits upon setup</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Standard vulnerability scans</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Monaco comparison editor</li>
                <li className="flex items-center gap-3 text-slate-600"><Check size={16} className="text-slate-700" /> AI Side Chat assistant (unlocked on Premium)</li>
              </ul>
            </div>

            <Link
              to="/register"
              className="mt-8 py-3 rounded-xl border border-white/10 text-center font-bold text-sm hover:bg-white/5 transition-colors block"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="p-8 rounded-2xl bg-brand-500/5 border-2 border-brand-500 flex flex-col justify-between relative">
            <span className="absolute top-0 right-8 -translate-y-1/2 bg-brand-500 text-white font-bold text-[10px] tracking-widest px-3 py-1 rounded-full">
              POPULAR
            </span>

            <div>
              <h4 className="font-bold text-lg text-brand-400">Professional Suite</h4>
              <p className="text-sm text-slate-400 mt-2">Unlimited reviews for active software developers.</p>
              
              <div className="my-8">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-slate-400">/ month</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-slate-300">
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Unlimited code scans</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Priority analysis queue</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Advanced security scans</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-400" /> Dynamic AI Chat dialogue assistant</li>
              </ul>
            </div>

            <Link
              to="/register"
              className="mt-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-center font-bold text-sm transition-colors block shadow-lg shadow-brand-500/20 text-white"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </section>

      {/* Accordion FAQs */}
      <section className="max-w-4xl mx-auto px-6 py-28 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">HELP CENTER</span>
          <h3 className="text-3xl font-bold mt-2">Frequently Asked Questions</h3>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={faq._id} className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-6 font-bold text-sm sm:text-base flex justify-between items-center"
              >
                {faq.question}
                <span>{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-6 pt-0 text-slate-400 text-sm border-t border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-lg mx-auto px-6 py-28 border-t border-white/5 relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">GET IN TOUCH</span>
          <h3 className="text-3xl font-bold mt-2">Contact Support</h3>
        </div>

        <form onSubmit={handleContactSubmit} className="flex flex-col gap-5 p-8 rounded-2xl bg-white/[0.01] border border-white/5">
          {formSuccess && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{formSuccess}</div>}
          {formError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">{formError}</div>}

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Name</label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Email Address</label>
            <input
              type="email"
              required
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Subject</label>
            <input
              type="text"
              required
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Message</label>
            <textarea
              required
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-sm transition-colors text-white mt-2 flex items-center justify-center gap-2"
          >
            {formLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold text-sm">AI BUG DETECTOR</p>
              <p className="text-[10px] text-slate-500">© 2026. All rights reserved.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Github size={16} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
