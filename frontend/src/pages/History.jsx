import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Trash2, 
  Star, 
  Download, 
  Eye, 
  ExternalLink,
  Filter,
  Calendar,
  Code
} from 'lucide-react';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [isFavorite, setIsFavorite] = useState('false');
  const [sort, setSort] = useState('newest');

  const languagesList = [
    'All', 'Java', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript',
    'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS'
  ];

  useEffect(() => {
    fetchHistory();
  }, [search, language, severity, isFavorite, sort]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/analysis/history', {
        params: {
          search,
          language,
          severity,
          isFavorite,
          sort
        }
      });
      if (res.data.success) {
        setAnalyses(res.data.analyses);
      }
    } catch (err) {
      console.error('Failed to load history list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`/api/analysis/${id}/favorite`);
      if (res.data.success) {
        setAnalyses(prev => prev.map(a => a._id === id ? { ...a, isFavorite: res.data.isFavorite } : a));
      }
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  const handleSoftDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Move this scan record to trash?')) return;
    try {
      const res = await axios.put(`/api/analysis/${id}/trash`);
      if (res.data.success) {
        setAnalyses(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Soft delete failed:', err);
    }
  };

  const handleDownload = (id, format, e) => {
    e.stopPropagation();
    window.open(`/api/analysis/${id}/export?format=${format}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search & Filters Widget */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs focus:outline-none"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap gap-3.5 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Filter size={10} /> Filters
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none"
          >
            {languagesList.map(l => <option key={l} value={l}>{l === 'All' ? 'Languages' : l}</option>)}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none"
          >
            <option value="All">Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => setIsFavorite(prev => prev === 'true' ? 'false' : 'true')}
            className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 ${
              isFavorite === 'true'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Star size={10} fill={isFavorite === 'true' ? '#f59e0b' : 'none'} /> Favorites
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none"
          >
            <option value="newest">Newest Scans</option>
            <option value="oldest">Oldest Scans</option>
            <option value="quality-desc">Highest Quality</option>
            <option value="quality-asc">Lowest Quality</option>
          </select>
        </div>
      </div>

      {/* History table view */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450">Loading scan histories...</div>
        ) : analyses.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-4">
            <span className="text-3xl">🗄️</span>
            <div>
              <h4 className="font-bold text-sm">No analysis reports found</h4>
              <p className="text-[11px] text-slate-400 mt-1">Refine your search parameters or start a new scan.</p>
            </div>
            <Link to="/scan" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs text-white transition-colors mt-2">
              Scan Source Code
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                  <th className="pb-4 font-semibold w-10"></th>
                  <th className="pb-4 font-semibold">Project Name</th>
                  <th className="pb-4 font-semibold">Language</th>
                  <th className="pb-4 font-semibold">Quality Grade</th>
                  <th className="pb-4 font-semibold">Issues</th>
                  <th className="pb-4 font-semibold">Scanned Date</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((scan) => (
                  <tr
                    key={scan._id}
                    onClick={() => navigate(`/scan?id=${scan._id}`)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer group"
                  >
                    {/* Star favorite toggle */}
                    <td className="py-4 pl-1" onClick={(e) => handleToggleFavorite(scan._id, e)}>
                      <button className="text-slate-350 hover:text-amber-500 transition-colors">
                        <Star size={14} fill={scan.isFavorite ? '#f59e0b' : 'none'} className={scan.isFavorite ? 'text-amber-500' : 'text-slate-400'} />
                      </button>
                    </td>

                    {/* Project */}
                    <td className="py-4 font-bold text-slate-850 dark:text-slate-200">
                      <span className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                        {scan.projectName}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </td>

                    {/* Language */}
                    <td className="py-4">
                      <span className="flex items-center gap-1.5 font-mono text-slate-400">
                        <Code size={12} className="text-slate-500" />
                        {scan.language}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4">
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

                    {/* Anomalies count */}
                    <td className="py-4">
                      <span className="font-semibold text-rose-450">{scan.bugs.length} Issues</span>
                    </td>

                    {/* Date */}
                    <td className="py-4 text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        {new Date(scan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Exports dropdown */}
                        <div className="relative group/exp">
                          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Export report">
                            <Download size={14} />
                          </button>
                          <div className="absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl opacity-0 group-hover/exp:opacity-100 pointer-events-none group-hover/exp:pointer-events-auto transition-opacity z-10 flex flex-col text-left">
                            <button onClick={(e) => handleDownload(scan._id, 'json', e)} className="p-2.5 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download JSON</button>
                            <button onClick={(e) => handleDownload(scan._id, 'markdown', e)} className="p-2.5 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download MD</button>
                            <button onClick={(e) => handleDownload(scan._id, 'html', e)} className="p-2.5 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download HTML</button>
                          </div>
                        </div>

                        {/* Soft Delete */}
                        <button
                          onClick={(e) => handleSoftDelete(scan._id, e)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Move to trash"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
