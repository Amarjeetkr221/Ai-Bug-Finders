import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  History, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  LogOut, 
  Zap,
  Coins
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scan Code', path: '/scan', icon: Code2 },
    { name: 'History', path: '/history', icon: History },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'Admin') {
    links.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 glass-effect border-r border-slate-200/50 dark:border-slate-800/50 h-screen fixed left-0 top-0 flex flex-col justify-between p-6 z-20 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl animate-glow">🛡️</span>
          <div>
            <h1 className="font-sans font-bold text-lg bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent leading-none">
              BUG DETECTOR
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">AI INSIGHTS v2.0</span>
          </div>
        </Link>

        {/* User Card */}
        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-sm truncate">{user?.name}</h2>
              <div className="flex items-center gap-1">
                {user?.role === 'Premium User' ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold flex items-center gap-0.5">
                    <Zap size={8} /> PREMIUM
                  </span>
                ) : user?.role === 'Admin' ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    FREE TIER
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Credit balance */}
          <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins size={12} /> Credits
            </span>
            <span className="font-bold text-indigo-500">
              {user?.role === 'Premium User' ? '∞' : user?.credits}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout triggers */}
      <button
        onClick={logout}
        className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/5 transition-all duration-200"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
