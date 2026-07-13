import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Code2, 
  Settings, 
  Mail, 
  Megaphone, 
  ShieldAlert, 
  Trash2, 
  Check, 
  ChevronRight,
  Database,
  Search,
  CheckCircle,
  Zap,
  Save,
  Server
} from 'lucide-react';
import axios from 'axios';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('users');

  // Tab: Users
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  
  // Tab: Analyses
  const [analysesList, setAnalysesList] = useState([]);
  
  // Tab: Support
  const [supportList, setSupportList] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);

  // Tab: Settings
  const [settingsForm, setSettingsForm] = useState({
    websiteName: '',
    seoDescription: '',
    geminiApiKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    maintenanceMode: false
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Tab: Broadcast
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', sendEmail: false });
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchTabContent();
  }, [activeTab, userSearch]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to retrieve system statistics:', err);
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await axios.get('/api/admin/users', { params: { search: userSearch } });
        if (res.data.success) setUsersList(res.data.users);
      } else if (activeTab === 'analyses') {
        const res = await axios.get('/api/admin/analyses');
        if (res.data.success) setAnalysesList(res.data.analyses);
      } else if (activeTab === 'support') {
        const res = await axios.get('/api/admin/contacts');
        if (res.data.success) setSupportList(res.data.contacts);
      } else if (activeTab === 'settings') {
        const res = await axios.get('/api/admin/settings');
        if (res.data.success) setSettingsForm(res.data.settings);
      }
    } catch (err) {
      console.error('Fetch admin tab data failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions: User Management
  const handleUpdateRole = async (userId, role, credits) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}`, { role, credits });
      if (res.data.success) {
        alert(res.data.message);
        fetchTabContent();
      }
    } catch (err) {
      alert('Failed to modify user roles.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      alert('Delete user failed.');
    }
  };

  // Actions: Analysis Control
  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Permanently delete this analysis log from the database?')) return;
    try {
      const res = await axios.delete(`/api/admin/analyses/${id}`);
      if (res.data.success) {
        setAnalysesList(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // Actions: Support Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTarget) return;
    try {
      const res = await axios.post(`/api/admin/contacts/${replyTarget._id}/reply`, { replyText });
      if (res.data.success) {
        alert(res.data.message);
        setReplyTarget(null);
        setReplyText('');
        fetchTabContent();
      }
    } catch (err) {
      alert('Failed to transmit email reply.');
    }
  };

  // Actions: Settings save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      const res = await axios.put('/api/admin/settings', settingsForm);
      if (res.data.success) {
        setSettingsSuccess(res.data.message);
        fetchStats(); // Update settings theme changes
      }
    } catch (err) {
      alert('Failed to update config.');
    }
  };

  // Actions: Broadcast notifications
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcastSuccess('');
    try {
      const res = await axios.post('/api/admin/broadcast', broadcastForm);
      if (res.data.success) {
        setBroadcastSuccess(res.data.message);
        setBroadcastForm({ title: '', message: '', sendEmail: false });
      }
    } catch (err) {
      alert('Broadcast dispatch failed.');
    }
  };

  const tabs = [
    { id: 'users', name: 'Users', icon: Users },
    { id: 'analyses', name: 'Code Analyses', icon: Code2 },
    { id: 'support', name: 'Support Tickets', icon: Mail },
    { id: 'settings', name: 'Config Settings', icon: Settings },
    { id: 'broadcast', name: 'Broadcast center', icon: Megaphone }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Users</span>
            <span className="text-xl font-bold font-mono block mt-1">{stats.totalUsers}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Premium Accounts</span>
            <span className="text-xl font-bold font-mono text-amber-500 block mt-1">{stats.premiumUsers}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Today's Signups</span>
            <span className="text-xl font-bold font-mono text-brand-500 block mt-1">{stats.todaySignups}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Today's Scans</span>
            <span className="text-xl font-bold font-mono text-indigo-500 block mt-1">{stats.todayAnalyses}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Rev</span>
            <span className="text-xl font-bold font-mono text-green-500 block mt-1">${stats.estimatedRevenue}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1"><Server size={10} /> server CPU</span>
            <span className="text-xs font-bold font-mono text-slate-300">{stats.serverStatus?.cpuUsage} RAM: {stats.serverStatus?.memoryUsage}</span>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 gap-4">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-4 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === t.id 
                  ? 'border-brand-500 text-brand-500 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm min-h-[400px]">
        {loading && activeTab !== 'broadcast' && activeTab !== 'settings' ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading administrative logs...</div>
        ) : (
          <>
            {/* View Tab: Users */}
            {activeTab === 'users' && (
              <div className="flex flex-col gap-6">
                <div className="relative w-80">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-xs focus:outline-none"
                  />
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                        <th className="pb-3 font-semibold">User Details</th>
                        <th className="pb-3 font-semibold">Role Designation</th>
                        <th className="pb-3 font-semibold">Remaining Credits</th>
                        <th className="pb-3 font-semibold">Joined At</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4">
                            <span className="font-bold text-slate-850 dark:text-slate-250 block">{usr.name}</span>
                            <span className="text-[10px] text-slate-450 font-mono block mt-0.5">{usr.email}</span>
                          </td>
                          <td className="py-4 font-semibold text-slate-400 capitalize">
                            <select
                              value={usr.role}
                              onChange={(e) => handleUpdateRole(usr._id, e.target.value, usr.credits)}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-[11px] font-bold focus:outline-none"
                            >
                              <option value="User">User</option>
                              <option value="Premium User">Premium User</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-4">
                            <input
                              type="number"
                              defaultValue={usr.credits}
                              onBlur={(e) => handleUpdateRole(usr._id, usr.role, parseInt(e.target.value, 10))}
                              className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] font-bold font-mono focus:outline-none text-center"
                            />
                          </td>
                          <td className="py-4 text-slate-400">{new Date(usr.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(usr._id)}
                              className="p-2 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/5 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View Tab: Analyses */}
            {activeTab === 'analyses' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                      <th className="pb-3 font-semibold">User Owner</th>
                      <th className="pb-3 font-semibold">Project / Snippet</th>
                      <th className="pb-3 font-semibold">Language</th>
                      <th className="pb-3 font-semibold">Bugs Flagged</th>
                      <th className="pb-3 font-semibold">Audited Date</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysesList.map((scan) => (
                      <tr key={scan._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-4">
                          <span className="font-bold text-slate-300 block">{scan.user?.name || 'Guest User'}</span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{scan.user?.email || 'N/A'}</span>
                        </td>
                        <td className="py-4 font-semibold">{scan.projectName}</td>
                        <td className="py-4 font-mono text-slate-450">{scan.language}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold font-mono text-[10px]">{scan.bugs?.length} Bugs</span>
                        </td>
                        <td className="py-4 text-slate-400">{new Date(scan.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteAnalysis(scan._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/5 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* View Tab: Support Contacts */}
            {activeTab === 'support' && (
              <div className="flex flex-col gap-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                        <th className="pb-3 font-semibold">User contact</th>
                        <th className="pb-3 font-semibold">Subject Matter</th>
                        <th className="pb-3 font-semibold">Message Context</th>
                        <th className="pb-3 font-semibold">Ticket Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportList.map((tkt) => (
                        <tr key={tkt._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4">
                            <span className="font-bold text-slate-350 block">{tkt.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{tkt.email}</span>
                          </td>
                          <td className="py-4 font-bold">{tkt.subject}</td>
                          <td className="py-4 text-slate-400 max-w-xs leading-relaxed truncate" title={tkt.message}>{tkt.message}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tkt.status === 'resolved' 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {tkt.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {tkt.status === 'unresolved' ? (
                              <button
                                onClick={() => setReplyTarget(tkt)}
                                className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[10px] font-bold hover:bg-brand-600 transition-colors"
                              >
                                Reply Message
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reply Drawer Overlay */}
                {replyTarget && (
                  <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-6 z-30 backdrop-blur-md">
                    <form onSubmit={handleSendReply} className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">Reply ticket to {replyTarget.name}</h4>
                        <button type="button" onClick={() => setReplyTarget(null)} className="text-slate-400 hover:text-white font-bold">X</button>
                      </div>
                      
                      <div className="p-4 bg-slate-950 rounded-xl text-slate-400 text-xs border border-slate-850 whitespace-pre-wrap">
                        {replyTarget.message}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-2">EMAIL MESSAGE REPLY</label>
                        <textarea
                          required
                          rows={5}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-4 text-xs rounded-xl focus:outline-none"
                          placeholder="Compose reply..."
                        ></textarea>
                      </div>

                      <button type="submit" className="w-full py-3 bg-brand-500 text-white text-xs font-bold rounded-xl hover:bg-brand-600 transition-colors shadow-md">
                        Transmit Email Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* View Tab: Settings config */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
                <div className="sm:col-span-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-2">Global System Config</h3>
                </div>

                {settingsSuccess && (
                  <div className="sm:col-span-2 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle size={16} />
                    {settingsSuccess}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Website Name</label>
                  <input
                    type="text"
                    value={settingsForm.websiteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Gemini AI API Key</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={settingsForm.geminiApiKey}
                    onChange={(e) => setSettingsForm({ ...settingsForm, geminiApiKey: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settingsForm.smtpHost}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settingsForm.smtpPort}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">SMTP User</label>
                  <input
                    type="text"
                    value={settingsForm.smtpUser}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">SMTP Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={settingsForm.smtpPass}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpPass: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                    <h4 className="font-bold text-xs">System Maintenance Mode</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle maintenance blockers for public visitors</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors relative ${settingsForm.maintenanceMode ? 'bg-green-500' : 'bg-slate-350 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${settingsForm.maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:col-span-2 mt-2"
                >
                  <Save size={14} />
                  Save System Configuration
                </button>
              </form>
            )}

            {/* View Tab: Broadcast center */}
            {activeTab === 'broadcast' && (
              <form onSubmit={handleBroadcast} className="flex flex-col gap-4 max-w-xl">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-2">Publish System Announcement</h3>
                
                {broadcastSuccess && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle size={16} />
                    {broadcastSuccess}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Announcement Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                    placeholder="e.g. Scheduled System Upgrade next Sunday"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Alert Message Description</label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-xs rounded-xl focus:outline-none"
                    placeholder="Provide details about schedule..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="send-email"
                    checked={broadcastForm.sendEmail}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, sendEmail: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-250 text-brand-500 bg-slate-950"
                  />
                  <label htmlFor="send-email" className="text-xs font-semibold text-slate-400 select-none">Email this announcement to all verified users</label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10 mt-2 self-start flex items-center gap-1.5"
                >
                  <Megaphone size={14} />
                  Broadcast Alert
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
