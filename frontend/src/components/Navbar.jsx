import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Check } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/user/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Fetch notifications failed:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(`/api/user/notifications/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Mark notification read failed:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="font-semibold text-lg text-slate-800 dark:text-white capitalize font-mono">
        {title || 'Dashboard'}
      </h1>

      <div className="flex items-center gap-6">
        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-slate-850 dark:hover:bg-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
        </button>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-slate-850 dark:hover:bg-slate-900 hover:bg-slate-100 transition-colors relative"
            aria-label="Open Notifications"
          >
            <Bell size={18} className="text-slate-500 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-effect rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-30">
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-xs">NOTIFICATIONS</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-brand-500 font-semibold">{unreadCount} Unread</span>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b border-slate-100 dark:border-slate-900/50 flex gap-3 transition-colors ${notification.read ? 'opacity-60' : 'bg-brand-500/5'}`}
                    >
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">
                          {notification.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <span className="text-[9px] text-slate-500 mt-2 block">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/35 transition-colors self-center"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200/50 dark:border-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
