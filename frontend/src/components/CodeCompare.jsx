import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { Copy, Download, Check } from 'lucide-react';

const CodeCompare = ({ originalCode, fixedCode, language }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Normalize language for Monaco editor
  const getEditorLanguage = (lang) => {
    if (!lang) return 'javascript';
    const l = lang.toLowerCase();
    if (l === 'c++') return 'cpp';
    if (l === 'c#') return 'csharp';
    return l;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadFixedCode = () => {
    const element = document.createElement('a');
    const file = new Blob([fixedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    // Generate safe extension
    let ext = 'txt';
    const lang = getEditorLanguage(language);
    if (lang === 'python') ext = 'py';
    else if (lang === 'javascript') ext = 'js';
    else if (lang === 'typescript') ext = 'ts';
    else if (lang === 'cpp') ext = 'cpp';
    else if (lang === 'java') ext = 'java';
    else if (lang === 'html') ext = 'html';
    else if (lang === 'css') ext = 'css';
    else if (lang === 'php') ext = 'php';
    else if (lang === 'go') ext = 'go';
    else if (lang === 'rust') ext = 'rs';
    else if (lang === 'swift') ext = 'swift';
    else if (lang === 'kotlin') ext = 'kt';
    else if (lang === 'sql') ext = 'sql';

    element.download = `fixed-code.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h3 className="font-bold text-sm">Code Refactoring Comparison</h3>
          <p className="text-xs text-slate-400">Comparing original vs optimized code layout</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Fixed Code
              </>
            )}
          </button>
          <button
            onClick={downloadFixedCode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/10"
          >
            <Download size={14} />
            Download Source
          </button>
        </div>
      </div>

      <div className="h-[450px] border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-inner">
        <DiffEditor
          height="100%"
          language={getEditorLanguage(language)}
          original={originalCode}
          modified={fixedCode}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            renderSideBySide: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            lineNumbers: 'on',
            fontSize: 13,
            fontFamily: 'Outfit, monospace'
          }}
        />
      </div>
    </div>
  );
};

export default CodeCompare;
