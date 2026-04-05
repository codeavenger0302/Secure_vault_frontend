import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { shareService } from '../services/shareService';
import api from '../services/api';
import { resolveDownloadFilename } from '../services/fileNameUtils';
import {
  Inbox,
  Send,
  Loader2,
  Download,
  Clock,
  Shield,
  FileText,
  Lock,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Mail,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SharedWithMePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [receivedShares, setReceivedShares] = useState([]);
  const [sentShares, setSentShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessPassword, setAccessPassword] = useState({});
  const [downloading, setDownloading] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchShares = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const email = user.email || '';
      const userId = user.id || '';
      const [received, sent] = await Promise.all([
        shareService.getSharedWithMe(email, userId).catch(() => ({ shares: [] })),
        shareService.getMyShares(userId).catch(() => ({ shares: [] })),
      ]);
      setReceivedShares(received.shares || []);
      setSentShares(sent.shares || []);
    } catch {
      toast.error('Failed to load shares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [user]);

  const handleDownload = async (share) => {
    setDownloading(share.id);
    try {
      const password = accessPassword[share.id] || share.password || '';
      // For user shares, use file_id directly from storage
      let res;
      if (share.share_type === 'user') {
        res = await api.get('/store/getfile', {
          params: { userid: share.user_id, file_id: share.file_id },
          responseType: 'blob',
        });
      } else {
        res = await shareService.getSharedFile(share.share_link, password);
      }

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const disposition = res.headers['content-disposition'];
      const filename = resolveDownloadFilename({
        preferredName: share.file_name,
        disposition,
        mime: res.data?.type || res.headers['content-type'],
        fallbackName: 'shared_file',
      });

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
      fetchShares(); // Refresh to update download limits
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        toast.error('Incorrect password');
      } else if (status === 404) {
        toast.error('Share link expired or not found');
      } else {
        toast.error('Download failed');
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Share code copied!');
  };

  const tabs = [
    { id: 'received', label: 'Shared With Me', icon: Inbox, count: receivedShares.length },
    { id: 'sent', label: 'My Shares', icon: Send, count: sentShares.length },
  ];

  const currentShares = activeTab === 'received' ? receivedShares : sentShares;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            Shared Files
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Files shared with you and files you&apos;ve shared
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchShares}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/share" className="btn-primary flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4" />
            Access via Code
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:bg-gray-800/50 border border-transparent'
            }`}
            style={activeTab === tab.id ? {} : { color: 'var(--text-secondary)' }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`badge text-[10px] ${activeTab === tab.id ? 'badge-indigo' : ''}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : currentShares.length === 0 ? (
        <div className="text-center py-16">
          {activeTab === 'received' ? (
            <>
              <Inbox className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No files shared with you</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                When someone shares a file with your email, it will appear here
              </p>
            </>
          ) : (
            <>
              <Send className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No shares created yet</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Share files from the dashboard to see them here
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {currentShares.map((share) => (
            <div key={share.id} className="card-glow">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {share.file_name || 'Shared File'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                    {activeTab === 'received' && share.sender_name && (
                      <>
                        <span>From: <strong style={{ color: 'var(--text-secondary)' }}>{share.sender_name}</strong></span>
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                      </>
                    )}
                    {activeTab === 'sent' && share.recipient_email && (
                      <>
                        <span>To: <strong style={{ color: 'var(--text-secondary)' }}>{share.recipient_email}</strong></span>
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(share.created_at)}
                    </span>
                  </div>

                  {/* Metadata badges */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {share.share_type === 'user' && (
                      <span className="badge badge-indigo text-[10px] flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        In-app share
                      </span>
                    )}
                    {share.share_type === 'email' && (
                      <span className="badge text-[10px] flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" />
                        Email attachment
                      </span>
                    )}
                    {share.share_type === 'link' && share.download_limit > 0 && (
                      <span className="badge badge-indigo text-[10px]">
                        {share.download_limit} downloads left
                      </span>
                    )}
                    {share.share_type === 'link' && share.expiry_days > 0 && (() => {
                      const expiryDate = new Date(new Date(share.created_at).getTime() + share.expiry_days * 24 * 60 * 60 * 1000);
                      const now = new Date();
                      const daysLeft = Math.ceil((expiryDate - now) / (24 * 60 * 60 * 1000));
                      const isExpired = daysLeft <= 0;
                      return (
                        <span className={`badge text-[10px] ${isExpired ? 'badge-red' : ''}`}>
                          {isExpired ? 'Expired' : `${daysLeft}d left`}
                        </span>
                      );
                    })()}
                    {share.password && (
                      <span className="badge badge-yellow text-[10px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Password protected
                      </span>
                    )}
                  </div>

                  {/* Share code */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      {share.share_link}
                    </span>
                    <button
                      onClick={() => handleCopyCode(share.share_link)}
                      className="p-1 rounded hover:bg-gray-700/50 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                      title="Copy share code"
                    >
                      {copiedCode === share.share_link ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                {activeTab === 'received' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {share.password && share.share_type !== 'user' && (
                      <input
                        type="password"
                        value={accessPassword[share.id] || ''}
                        onChange={(e) => setAccessPassword({ ...accessPassword, [share.id]: e.target.value })}
                        placeholder="Password"
                        className="input-field text-xs py-1.5 px-3 w-32"
                      />
                    )}
                    <button
                      onClick={() => handleDownload(share)}
                      disabled={downloading === share.id || (share.share_type === 'link' && share.download_limit <= 0)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      {downloading === share.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      {activeTab === 'received' && receivedShares.length > 0 && (
        <div className="mt-6 p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
          <Shield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All files are encrypted with AES-256. Downloaded files are decrypted on the server before delivery. Share links have expiry and download limits for security.
          </p>
        </div>
      )}
    </div>
  );
}
