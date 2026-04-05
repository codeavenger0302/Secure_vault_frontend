import { useState } from 'react';
import { useFileStore } from '../hooks/useFileStore';
import { aiService } from '../services/aiService';
import {
  Sparkles,
  FileSearch,
  Tag,
  Shield,
  Brain,
  Loader2,
  Upload,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AiFeaturesPage() {
  const { files, updateFile } = useFileStore();
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('classify');
  const [result, setResult] = useState(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const selectedFileObj = files.find((f) => f.id === selectedFile);

  const tabs = [
    { id: 'classify', label: 'Classify', icon: FileSearch, color: 'text-blue-400' },
    { id: 'tags', label: 'Auto-Tag', icon: Tag, color: 'text-green-400' },
    { id: 'duplicates', label: 'Duplicates', icon: Brain, color: 'text-yellow-400' },
    { id: 'access', label: 'Access Advice', icon: Shield, color: 'text-red-400' },
    { id: 'explain', label: 'Explain', icon: BookOpen, color: 'text-purple-400' },
    { id: 'chat', label: 'Ask AI', icon: MessageCircle, color: 'text-cyan-400' },
  ];

  const runAnalysis = async () => {
    if (!selectedFileObj) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data;
      switch (activeTab) {
        case 'classify':
          data = await aiService.classifyFile(
            selectedFileObj.file_name,
            selectedFileObj.mime_type,
            selectedFileObj.file_size
          );
          if (data.category) {
            updateFile(selectedFileObj.id, { category: data.category });
          }
          break;

        case 'tags':
          data = await aiService.generateTags(
            selectedFileObj.file_name,
            selectedFileObj.mime_type,
            selectedFileObj.file_size
          );
          if (data.tags) {
            updateFile(selectedFileObj.id, { tags: data.tags });
          }
          break;

        case 'duplicates':
          const otherFiles = files.filter((f) => f.id !== selectedFileObj.id);
          data = await aiService.detectDuplicates(
            { name: selectedFileObj.file_name, type: selectedFileObj.mime_type, size: selectedFileObj.file_size },
            otherFiles
          );
          break;

        case 'access':
          data = await aiService.recommendAccess(
            selectedFileObj.file_name,
            selectedFileObj.mime_type,
            selectedFileObj.file_size
          );
          break;

        case 'explain':
          data = await aiService.explainDocument(
            selectedFileObj.file_name,
            selectedFileObj.mime_type,
            selectedFileObj.file_size,
            selectedFileObj.category,
            selectedFileObj.tags
          );
          break;

        case 'chat':
          // Chat is handled separately
          return;
      }

      setResult(data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Analysis failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (activeTab) {
      case 'classify':
        return (
          <div className="card space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Classification Result</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Category</span>
                <p className="text-lg font-bold text-indigo-300">{result.category}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
                <p className="text-lg font-bold text-green-300">{result.confidence}%</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.reason}</p>
          </div>
        );

      case 'tags':
        return (
          <div className="card space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-400" />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Generated Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tags?.map((tag, i) => (
                <span key={i} className="badge badge-indigo font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tags have been applied to this file.</p>
          </div>
        );

      case 'duplicates':
        return (
          <div className="card space-y-3">
            {result.hasDuplicates ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-300">Potential Duplicates Found</span>
                </div>
                {result.duplicates.map((dup, i) => (
                  <div key={i} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">File #{dup.index}</span>
                      <span className="text-yellow-300 font-bold">{dup.similarity}% match</span>
                    </div>
                    <p className="text-gray-500 mt-1">{dup.reason}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-300">No duplicates detected</span>
              </div>
            )}
          </div>
        );

      case 'access':
        return (
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Access Recommendations</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Security Level</span>
                <p className={`font-bold text-lg ${
                  result.securityLevel === 'high' ? 'text-red-400' :
                  result.securityLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {result.securityLevel?.toUpperCase()}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Password</span>
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.requirePassword ? 'Required' : 'Optional'}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Expiry</span>
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.suggestedExpiryDays} days</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Download Limit</span>
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.suggestedDownloadLimit}</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.reason}</p>
          </div>
        );

      case 'explain':
        return (
          <div className="card space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Document Explanation</span>
            </div>
            {result.title && <h3 className="text-lg font-bold gradient-text">{result.title}</h3>}
            {result.overview && (
              <div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Overview</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.overview}</p>
              </div>
            )}
            {result.contents && (
              <div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Likely Contents</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.contents}</p>
              </div>
            )}
            {result.purpose && (
              <div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Purpose</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.purpose}</p>
              </div>
            )}
            {result.audience && (
              <div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Target Audience</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.audience}</p>
              </div>
            )}
            {result.suggestions?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Suggestions</h4>
                <ul className="space-y-1">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span className="text-indigo-400 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleChatSend = async () => {
    if (!chatQuestion.trim() || !selectedFileObj) return;
    const question = chatQuestion.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatQuestion('');
    setLoading(true);
    try {
      const data = await aiService.chatAboutDocument(
        selectedFileObj.file_name,
        selectedFileObj.mime_type,
        selectedFileObj.file_size,
        selectedFileObj.category,
        question
      );
      setChatMessages((prev) => [...prev, { role: 'ai', text: data.answer || 'No response', confidence: data.confidence }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I couldn\'t process that question.', confidence: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          AI Features
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-2">
          Powered by Google Gemini — Classify, tag, explain, chat, and more
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 card">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No files to analyze</h2>
          <p className="text-gray-600 mb-6">Upload some files first, then come back for AI analysis</p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Selector */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Select a file to analyze</label>
            <select
              value={selectedFile}
              onChange={(e) => { setSelectedFile(e.target.value); setResult(null); }}
              className="input-field"
            >
              <option value="">-- Choose a file --</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.file_name} ({f.mime_type})
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 bg-gray-800/50 border border-gray-700'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chat interface for Ask AI tab */}
          {activeTab === 'chat' ? (
            <div className="card space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                    Ask AI anything about the selected file
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/20 border border-indigo-500/30'
                        : 'border'
                    }`} style={msg.role !== 'user' ? { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' } : {}}>
                      <p style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                      {msg.confidence !== undefined && (
                        <span className={`text-xs mt-1 inline-block badge ${
                          msg.confidence >= 80 ? 'badge-green' : msg.confidence >= 50 ? 'badge-yellow' : 'badge-red'
                        }`}>{msg.confidence}% confident</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask about this file..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  disabled={!selectedFile}
                />
                <button
                  onClick={handleChatSend}
                  disabled={loading || !chatQuestion.trim() || !selectedFile}
                  className="btn-primary flex items-center gap-2 shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Run button */}
              <button
                onClick={runAnalysis}
                disabled={loading || !selectedFile}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyzing...' : `Run ${tabs.find((t) => t.id === activeTab)?.label} Analysis`}
              </button>

              {/* Result */}
              {renderResult()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
