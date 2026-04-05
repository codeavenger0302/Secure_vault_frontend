import { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle, User, AtSign } from 'lucide-react';
import { shareService } from '../services/shareService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function EmailShareModal({ file, onClose }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('user'); // 'user' or 'email'
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  if (!file) return null;

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error(mode === 'user' ? 'Enter username or email' : 'Enter recipient email');
      return;
    }

    if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const senderName = user?.username || user?.email || 'SecureVault User';

      if (mode === 'user') {
        const data = await shareService.userShare(
          file.id,
          user?.id || file.userid,
          recipient.trim(),
          senderName,
          file.file_name
        );
        setResult({ type: 'user', recipient: data.recipient });
        toast.success(`File shared with ${data.recipient?.username || recipient}!`);
      } else {
        await shareService.emailShare(
          file.id,
          user?.id || file.userid,
          recipient.trim(),
          senderName,
          file.file_name
        );
        setResult({ type: 'email', email: recipient.trim() });
        toast.success(`File sent to ${recipient}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to share file');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full relative animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Share File</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{file.file_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success */}
        {result ? (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">
                {result.type === 'user' ? 'File Shared!' : 'File Sent!'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{file.file_name}</strong>
              {result.type === 'user' ? (
                <> has been shared with <strong style={{ color: 'var(--text-primary)' }}>{result.recipient?.username}</strong>. They can access it from their Inbox.</>
              ) : (
                <> has been sent to <strong style={{ color: 'var(--text-primary)' }}>{result.email}</strong> as an email attachment.</>
              )}
            </p>
            <button onClick={onClose} className="btn-primary mt-4 w-full text-sm">Done</button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('user'); setRecipient(''); }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === 'user'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
                style={mode === 'user' ? {} : { color: 'var(--text-secondary)' }}
                disabled={sending}
              >
                <User className="w-4 h-4" />
                SecureVault User
              </button>
              <button
                onClick={() => { setMode('email'); setRecipient(''); }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === 'email'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
                style={mode === 'email' ? {} : { color: 'var(--text-secondary)' }}
                disabled={sending}
              >
                <Mail className="w-4 h-4" />
                Email Attachment
              </button>
            </div>

            {/* Recipient Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {mode === 'user' ? 'Username or Email' : 'Recipient Email'} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                {mode === 'user' ? (
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                )}
                <input
                  type={mode === 'email' ? 'email' : 'text'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={mode === 'user' ? 'Enter username or email' : 'recipient@example.com'}
                  className="input-field pl-10"
                  autoFocus
                  disabled={sending}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && recipient.trim() && handleSend()}
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              {mode === 'user'
                ? 'The file will be shared within SecureVault. The recipient can download it from their Inbox page.'
                : 'The file will be sent directly as an email attachment via SMTP.'}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !recipient.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sharing...' : mode === 'user' ? 'Share with User' : 'Send via Email'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
