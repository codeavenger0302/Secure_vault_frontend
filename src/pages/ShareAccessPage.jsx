import { useState } from 'react';
import { shareService } from '../services/shareService';
import { resolveDownloadFilename } from '../services/fileNameUtils';
import { Share2, Download, Lock, Loader2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareAccessPage() {
  const [shareLink, setShareLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!shareLink.trim()) {
      toast.error('Please enter a share link code');
      return;
    }

    setLoading(true);
    try {
      const res = await shareService.getSharedFile(shareLink.trim(), password);

      // Create download from blob
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const disposition = res.headers['content-disposition'];
      const filename = resolveDownloadFilename({
        disposition,
        mime: res.data?.type || res.headers['content-type'],
        fallbackName: 'shared_file',
      });

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully!');
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        toast.error('Share link not found or expired');
      } else if (status === 410) {
        toast.error('This share link has expired');
      } else if (status === 401) {
        toast.error('Invalid password');
      } else {
        toast.error(err.response?.data?.msg || 'Failed to access shared file');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-[1px] mx-auto mb-4">
          <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Share2 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text">Access Shared File</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-2">Enter the share link code to download a shared file</p>
      </div>

      <form onSubmit={handleAccess} className="card space-y-5 animate-fade-in">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Share Link Code</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={shareLink}
              onChange={(e) => setShareLink(e.target.value)}
              placeholder="Paste share link code here"
              className="input-field pl-10 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password (if required)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password if link is protected"
              className="input-field pl-10"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? 'Downloading...' : 'Download File'}
        </button>
      </form>
    </div>
  );
}
