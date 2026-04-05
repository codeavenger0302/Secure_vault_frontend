import { useState } from 'react';
import { X, Brain, Sparkles, Loader2, MessageSquare, Send, ChevronRight, Users, FileType, Lightbulb, Info } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function DocumentExplainerModal({ file, textContent, onClose }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explain');

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await aiService.explainDocument(
        file.file_name,
        file.mime_type,
        file.file_size,
        file.category,
        file.tags,
        textContent
      );
      setExplanation(result);
    } catch {
      setExplanation({ title: 'Error', overview: 'Failed to generate explanation. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const result = await aiService.chatAboutDocument(
        file.file_name,
        file.mime_type,
        file.file_size,
        file.category,
        question,
        textContent
      );
      setChatMessages((prev) => [...prev, { role: 'ai', text: result.answer, confidence: result.confidence }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card max-w-2xl w-full max-h-[85vh] flex flex-col relative animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                AI Document Assistant
              </h2>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{file.file_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 mb-4 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }}>
          <button
            onClick={() => setActiveTab('explain')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : ''
            }`}
            style={activeTab !== 'explain' ? { color: 'var(--text-secondary)' } : {}}
          >
            <Sparkles className="w-4 h-4" />
            Explain
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : ''
            }`}
            style={activeTab !== 'chat' ? { color: 'var(--text-secondary)' } : {}}
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {activeTab === 'explain' && (
            <>
              {!explanation && !loading && (
                <div className="text-center py-12">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 inline-block mb-4">
                    <Brain className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Understand Your Document
                  </h3>
                  <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                    AI will analyze this file and explain what it contains, its purpose, and how you can use it.
                  </p>
                  <button onClick={handleExplain} className="btn-primary flex items-center gap-2 mx-auto">
                    <Sparkles className="w-4 h-4" />
                    Generate Explanation
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                  </div>
                  <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>AI is analyzing your document...</p>
                </div>
              )}

              {explanation && !loading && (
                <div className="space-y-4 animate-fade-in">
                  {/* Overview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{explanation.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{explanation.overview}</p>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Contents</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{explanation.contents}</p>
                    </div>

                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronRight className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Purpose</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{explanation.purpose}</p>
                    </div>

                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Audience</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{explanation.audience}</p>
                    </div>

                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <FileType className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Format Info</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{explanation.format_info}</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {explanation.suggestions?.length > 0 && (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Suggestions</span>
                      </div>
                      <ul className="space-y-2">
                        {explanation.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button onClick={handleExplain} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full min-h-[300px]">
              {/* Messages */}
              <div className="flex-1 overflow-auto space-y-3 mb-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Ask anything about <strong>{file.file_name}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['What does this file contain?', 'Is this file safe to share?', 'What software opens this?'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setChatInput(q); }}
                          className="text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer hover:border-indigo-500/50"
                          style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'rounded-bl-md'
                      }`}
                      style={msg.role !== 'user' ? { backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' } : {}}
                    >
                      {msg.text}
                      {msg.confidence && (
                        <span className={`block mt-1 text-xs opacity-60`}>
                          Confidence: {msg.confidence}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ backgroundColor: 'var(--bg-input)' }}>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !chatLoading && handleChat()}
                  placeholder="Ask about this document..."
                  className="input-field flex-1"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn-primary px-4 flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
