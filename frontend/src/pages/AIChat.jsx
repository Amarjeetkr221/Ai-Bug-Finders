import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import axios from 'axios';

const AIChat = ({ isOpen, onClose, analysis }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Clear chat if analysis changes
    setMessages([
      {
        role: 'model',
        content: `Hi there! I am your AI Code Assistant. I have loaded the code context for '${analysis?.projectName || 'your project'}'. How can I help you optimize or refactor it today?`
      }
    ]);
  }, [analysis]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading || !analysis) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Send chat history and current message to backend
      const res = await axios.post(`/api/analysis/${analysis._id}/chat`, {
        message: textToSend,
        history: messages.slice(1) // exclude first intro message
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'Apologies, I encountered an error answering that query: ' + (err.response?.data?.message || err.message) }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Why is this bug occurring?',
    'Optimize this function.',
    'Generate test cases.',
    'Write documentation comments.',
    'Explain the algorithm.'
  ];

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-slate-800/50 h-[calc(100vh-80px)] fixed right-0 bottom-0 z-10 flex flex-col shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sparkles size={14} />
          </span>
          <h3 className="font-bold text-xs">AI Chat Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
              m.role === 'user'
                ? 'bg-brand-500 text-white rounded-br-none'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-300 rounded-bl-none border border-slate-200/20 dark:border-slate-800/50'
            }`}>
              <p className="whitespace-pre-wrap font-sans">{m.content}</p>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 uppercase font-mono tracking-wider px-1">
              {m.role === 'user' ? 'you' : 'assistant'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-400 font-mono py-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span>AI is typing explanations...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick prompts */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={(e) => handleSend(e, p)}
              className="px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-brand-500/55 transition-colors font-semibold"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about this code..."
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors shadow-lg shadow-brand-500/10"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default AIChat;
