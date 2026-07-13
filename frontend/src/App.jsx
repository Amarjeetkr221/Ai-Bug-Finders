import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import BugDetection from './pages/BugDetection';
import History from './pages/History';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Dedicated Chat Page wrapper
import { MessageSquare, Code } from 'lucide-react';
import axios from 'axios';
import AIChat from './pages/AIChat';

const DedicatedChat = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/analysis/history');
      if (res.data.success) {
        setProjects(res.data.analyses);
        if (res.data.analyses.length > 0) {
          setSelectedProject(res.data.analyses[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load projects for chat context:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl min-h-[500px]">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-sm">AI Coding Chat Assistant</h3>
          <p className="text-xs text-slate-400">Ask questions, request test cases, or convert language syntax</p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-450 uppercase flex items-center gap-1"><Code size={12}/> Context</span>
            <select
              value={selectedProject?._id || ''}
              onChange={(e) => {
                const proj = projects.find(p => p._id === e.target.value);
                setSelectedProject(proj);
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none"
            >
              {projects.map(p => <option key={p._id} value={p._id}>{p.projectName} ({p.language})</option>)}
            </select>
          </div>
        )}
      </div>

      {selectedProject ? (
        <div className="flex-1 relative border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-inner h-[500px] bg-slate-900">
          <AIChat isOpen={true} onClose={() => {}} analysis={selectedProject} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <MessageSquare size={48} className="text-slate-500 mb-4 animate-bounce" />
          <h4 className="font-bold text-sm">No analysis context available</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            You must execute at least one code scan to load an active chat thread context.
          </p>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout pageTitle="Dashboard Overview" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<DashboardLayout pageTitle="Bug Scanner & Detector" />}>
              <Route path="/scan" element={<BugDetection />} />
            </Route>
            <Route element={<DashboardLayout pageTitle="Scan Reports History" />}>
              <Route path="/history" element={<History />} />
            </Route>
            <Route element={<DashboardLayout pageTitle="AI Chat Assistant" />}>
              <Route path="/chat" element={<DedicatedChat />} />
            </Route>
            <Route element={<DashboardLayout pageTitle="User Profile Settings" />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route element={<DashboardLayout pageTitle="Admin Dashboard Suite" />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Global fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
