import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CodeCompare from '../components/CodeCompare';
import AIChat from './AIChat';
import { 
  Play, 
  Upload, 
  Trash2, 
  ChevronRight, 
  Download, 
  MessageSquare, 
  AlertTriangle,
  Star,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const BugDetection = () => {
  const { theme } = useTheme();
  const { user, updateCredits } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [code, setCode] = useState('// Paste your code here or upload a file...');
  const [language, setLanguage] = useState('Auto-Detect');
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Rating and Feedback States
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // UI state
  const [severityFilter, setSeverityFilter] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const languagesList = [
    'Auto-Detect', 'Java', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript',
    'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS'
  ];

  useEffect(() => {
    const analysisId = searchParams.get('id');
    if (analysisId) {
      fetchAnalysisDetails(analysisId);
    }
  }, [searchParams]);

  const fetchAnalysisDetails = async (id) => {
    setIsScanning(true);
    setError('');
    try {
      const res = await axios.get(`/api/analysis/${id}`);
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setCode(res.data.analysis.code);
        setLanguage(res.data.analysis.language);
        setProjectName(res.data.analysis.projectName);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve analysis logs.');
    } finally {
      setIsScanning(false);
    }
  };

  // Drag and Drop files
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Detect language from extension
    const ext = file.name.split('.').pop().toLowerCase();
    const extensionMap = {
      py: 'Python', js: 'JavaScript', jsx: 'JavaScript', ts: 'TypeScript', tsx: 'TypeScript',
      java: 'Java', cpp: 'C++', cc: 'C++', c: 'C', php: 'PHP', go: 'Go', rs: 'Rust',
      swift: 'Swift', kt: 'Kotlin', sql: 'SQL', html: 'HTML', css: 'CSS'
    };

    if (extensionMap[ext]) {
      setLanguage(extensionMap[ext]);
    }

    setProjectName(file.name.replace(`.${ext}`, ''));

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCode(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleScan = async () => {
    if (!code || code.trim() === '' || code.includes('Paste your code here')) {
      return setError('Please insert code context for scanning.');
    }

    setIsScanning(true);
    setError('');
    setAnalysis(null);
    setFeedbackSuccess('');
    setFeedbackText('');

    try {
      const res = await axios.post('/api/analysis/scan', {
        code,
        language,
        projectName: projectName || 'Untitled Project'
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis);
        updateCredits(res.data.credits);
        setSearchParams({ id: res.data.analysis._id });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI Analysis failed. Try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/analysis/${analysis._id}/rate`, {
        rating,
        feedback: feedbackText
      });
      if (res.data.success) {
        setFeedbackSuccess('Thank you for rating this AI review!');
      }
    } catch (err) {
      setError('Failed to submit rating.');
    }
  };

  const handleDownloadReport = (format) => {
    window.open(`/api/analysis/${analysis._id}/export?format=${format}`, '_blank');
  };

  const filteredBugs = analysis?.bugs?.filter(bug => {
    if (severityFilter === 'All') return true;
    return bug.severity === severityFilter;
  }) || [];

  return (
    <div className="flex gap-8 relative">
      {/* Primary Workspace */}
      <div className={`flex-1 flex flex-col gap-8 transition-all ${isChatOpen ? 'pr-96' : ''}`}>
        
        {/* Editor Screen & Inputs */}
        {!analysis && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 block mb-2">Project/File Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. auth-verification-hook"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Language Selector</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {languagesList.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-slate-400 font-semibold">Write or paste source code</span>
                <label className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload size={14} /> Upload File
                  <input type="file" onChange={handleFileUpload} className="hidden" accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.c,.rs,.go,.swift,.kt,.sql,.html,.css" />
                </label>
              </div>

              <div className="h-[350px] border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-inner bg-slate-950">
                <Editor
                  height="100%"
                  language={language === 'Auto-Detect' ? 'javascript' : language.toLowerCase()}
                  value={code}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'Outfit, monospace',
                    lineNumbers: 'on',
                    scrollbar: { verticalScrollbarSize: 8 }
                  }}
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={isScanning}
                className="py-4 rounded-xl bg-brand-500 hover:bg-brand-600 transition-all font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI is scanning code...
                  </>
                ) : (
                  <>
                    <Play size={16} /> Run Bug Detector Scan (Costs 1 credit)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {analysis && (
          <div className="flex flex-col gap-8">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h3 className="text-xl font-bold font-mono">{analysis.projectName}</h3>
                <p className="text-xs text-slate-400 mt-1">Audit complete on {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/15 border border-indigo-500/25 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={14} /> AI Assistant
                </button>
                <div className="relative group">
                  <button className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50 transition-colors">
                    <Download size={14} /> Export Report
                  </button>
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10 flex flex-col">
                    <button onClick={() => handleDownloadReport('json')} className="p-3 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download JSON</button>
                    <button onClick={() => handleDownloadReport('markdown')} className="p-3 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download Markdown</button>
                    <button onClick={() => handleDownloadReport('html')} className="p-3 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Download HTML</button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setSearchParams({});
                  }}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors"
                >
                  New Scan
                </button>
              </div>
            </div>

            {/* Overall quality scores grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center relative group">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-4">Overall Quality</span>
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
                  {/* Neon border circle color */}
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-indigo-500 border-b-cyan-500 border-l-transparent animate-spin-slow"></div>
                  <span className="text-3xl font-bold font-mono">{analysis.metrics.overallQualityScore}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-4 font-semibold uppercase tracking-wider flex items-center gap-1"><Sparkles size={10} className="text-brand-500" /> CONFIDENCE {analysis.confidenceScore}%</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Code Diagnostics</h4>
                  <div className="flex flex-col gap-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Readability Rating</span>
                      <span className="font-bold font-mono">{analysis.metrics.readabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${analysis.metrics.readabilityScore}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-slate-400">Maintainability Score</span>
                      <span className="font-bold font-mono">{analysis.metrics.maintainabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${analysis.metrics.maintainabilityScore}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-3.5 text-[11px] text-slate-400 font-semibold font-mono">
                  <span className="flex items-center gap-1"><Clock size={12} /> execution: {analysis.metrics.estimatedExecutionTime}</span>
                  <span className="flex items-center gap-1"><Layers size={12} /> RAM: {analysis.metrics.estimatedMemoryUsage}</span>
                </div>
              </div>

              {/* Executive Summary info */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Executive Summary</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                  {analysis.summary}
                </p>
              </div>
            </div>

            {/* Layout Split: Bugs List & Side Comparison code */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bugs lists filterable */}
              <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4 h-[550px]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3">
                  <h3 className="font-bold text-sm">Detected Issues</h3>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2.5 py-1.5 rounded-lg text-[10px] font-bold focus:outline-none"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Informational">Info</option>
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                  {filteredBugs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400">
                      No issues detected for this level.
                    </div>
                  ) : (
                    filteredBugs.map((bug, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                          bug.severity === 'Critical' ? 'bg-red-500/5 border-red-500/20' :
                          bug.severity === 'High' ? 'bg-orange-500/5 border-orange-500/20' :
                          bug.severity === 'Medium' ? 'bg-amber-500/5 border-amber-500/20' :
                          bug.severity === 'Low' ? 'bg-blue-500/5 border-blue-500/20' :
                          'bg-green-500/5 border-green-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            bug.severity === 'Critical' ? 'bg-red-500 text-white' :
                            bug.severity === 'High' ? 'bg-orange-500 text-white' :
                            bug.severity === 'Medium' ? 'bg-amber-500 text-slate-950' :
                            bug.severity === 'Low' ? 'bg-blue-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {bug.severity}
                          </span>
                          {bug.line && <span className="text-[10px] font-mono text-slate-400">Line {bug.line}</span>}
                        </div>
                        <h4 className="font-bold text-xs">{bug.category}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{bug.message}</p>
                        <p className="text-[10px] text-indigo-400/90 leading-relaxed border-t border-slate-100 dark:border-slate-800/40 pt-2">{bug.explanation}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Side comparisons editor */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <CodeCompare originalCode={analysis.code} fixedCode={analysis.fixedCode} language={analysis.language} />
              </div>
            </div>

            {/* Line Explanations Detailed view */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
              <h3 className="font-bold text-sm">Line-by-Line Fix Explanations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="p-4 font-bold text-slate-450">Line</th>
                      <th className="p-4 font-bold text-slate-450">Original Snippet</th>
                      <th className="p-4 font-bold text-slate-450">Refactored Snippet</th>
                      <th className="p-4 font-bold text-slate-450">AI Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.lineExplanations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400">No specific line replacements suggested. Entire file was refactored.</td>
                      </tr>
                    ) : (
                      analysis.lineExplanations.map((exp, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                          <td className="p-4 font-bold font-mono">{exp.line}</td>
                          <td className="p-4 font-mono text-rose-500 bg-rose-500/5 line-through whitespace-pre">{exp.originalLine}</td>
                          <td className="p-4 font-mono text-green-500 bg-green-500/5 whitespace-pre">{exp.fixedLine}</td>
                          <td className="p-4 text-slate-400 max-w-xs">{exp.explanation}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feedback system rating stars */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4 max-w-lg">
              <h3 className="font-bold text-sm">Rate AI Response</h3>
              {feedbackSuccess ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  {feedbackSuccess}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-2 font-mono">{rating}/5 Stars</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Provide optional details about this suggestion (e.g. was the code syntax-correct?)..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs text-white transition-colors self-start shadow-md"
                  >
                    Submit Rating
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Chat Drawer */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        analysis={analysis} 
      />
    </div>
  );
};

export default BugDetection;
