import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { 
  ShieldAlert, 
  Play, 
  Award, 
  Bookmark, 
  Code,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/analysis/history');
      if (res.data.success) {
        setHistory(res.data.analyses);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compile bug categorizations for Charts
  const getChartData = () => {
    const categories = {
      'Security Vulnerabilities': 0,
      'Syntax Errors': 0,
      'Runtime Errors': 0,
      'Logic Errors': 0,
      'Performance Problems': 0,
      'Memory Issues': 0,
      'Code Smells': 0,
      'Best Practices': 0
    };

    let criticalCount = 0;
    let favoritesCount = 0;

    history.forEach(item => {
      if (item.isFavorite) favoritesCount++;
      item.bugs.forEach(bug => {
        if (categories[bug.category] !== undefined) {
          categories[bug.category]++;
        }
        if (bug.severity === 'Critical') {
          criticalCount++;
        }
      });
    });

    return { categories, criticalCount, favoritesCount };
  };

  const { categories, criticalCount, favoritesCount } = getChartData();

  // Doughnut chart (Bug Categories)
  const doughnutData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: [
          '#f43f5e', // Security
          '#a855f7', // Syntax
          '#ec4899', // Runtime
          '#e11d48', // Logic
          '#f97316', // Performance
          '#f59e0b', // Memory
          '#3b82f6', // Code Smells
          '#10b981'  // Best Practices
        ],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
      }
    ]
  };

  // Bar chart (Languages Popularity)
  const languagesCount = {};
  history.forEach(item => {
    languagesCount[item.language] = (languagesCount[item.language] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(languagesCount).length > 0 ? Object.keys(languagesCount) : ['None'],
    datasets: [
      {
        label: 'Scanned Repositories',
        data: Object.keys(languagesCount).length > 0 ? Object.values(languagesCount) : [0],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Code size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Scanned</span>
            <span className="text-2xl font-bold font-mono">{history.length}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Critical Bugs</span>
            <span className="text-2xl font-bold font-mono text-rose-500">{criticalCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Bookmark size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Favorites</span>
            <span className="text-2xl font-bold font-mono text-amber-500">{favoritesCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Avg Quality</span>
            <span className="text-2xl font-bold font-mono text-green-500">
              {history.length > 0 
                ? Math.round(history.reduce((a, b) => a + b.metrics.overallQualityScore, 0) / history.length)
                : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts row */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-sm">Language Distribution</h3>
          <div className="h-64 relative">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-sm">Bug Categories Breakdown</h3>
          <div className="h-64 relative">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Layout split: Premium ads & Recent scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scans Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Recent Scan Audits</h3>
            <Link to="/history" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              View History <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                  <th className="pb-3 font-semibold">Project Name</th>
                  <th className="pb-3 font-semibold">Language</th>
                  <th className="pb-3 font-semibold">Quality Score</th>
                  <th className="pb-3 font-semibold">Anomalies</th>
                  <th className="pb-3 font-semibold">Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">Loading metrics...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No analyses run yet.{' '}
                      <Link to="/scan" className="text-brand-500 hover:underline">Perform first scan</Link>
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 5).map((scan) => (
                    <tr key={scan._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 font-bold">
                        <Link to={`/scan?id=${scan._id}`} className="hover:text-indigo-400 transition-colors">
                          {scan.projectName}
                        </Link>
                      </td>
                      <td className="py-3.5 font-mono text-slate-400">{scan.language}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          scan.metrics.overallQualityScore >= 80 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : scan.metrics.overallQualityScore >= 50
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {scan.metrics.overallQualityScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-rose-450">{scan.bugs.length} Issues</td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(scan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Upgrade call-out */}
        {user?.role === 'User' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-850 text-white shadow-xl shadow-indigo-500/15 flex flex-col justify-between relative overflow-hidden group">
            {/* Blur circle decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300"></div>

            <div className="flex flex-col gap-4 relative z-10">
              <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shadow-md">
                <Zap size={20} />
              </span>
              <div>
                <h4 className="font-bold text-lg">Professional Upgrade</h4>
                <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                  Upgrade to the Professional Suite to run unlimited code checks, activate the AI Chat follow-up, and unlock priority scans.
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="mt-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-50 transition-colors text-center text-xs font-bold shadow-md relative z-10"
            >
              Get Professional Plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
