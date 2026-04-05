import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Trash2, RotateCcw, X, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

function formatSize(bytes) {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TrashPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTrash = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await storageService.listTrash(user.id);
      setFiles(data.files || []);
    } catch {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, [user]);

  const handleRestore = async (file) => {
    setActionLoading(file.id);
    try {
      await storageService.restoreFile(user.id, file.id);
      toast.success(`${file.file_name} restored`);
      fetchTrash();
    } catch {
      toast.error('Failed to restore file');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (file) => {
    if (!confirm(`Permanently delete "${file.file_name}"? This cannot be undone.`)) return;
    setActionLoading(file.id);
    try {
      await storageService.permanentDelete(user.id, file.id);
      toast.success('File permanently deleted');
      fetchTrash();
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            Trash
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} in trash
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Trash is empty</h2>
          <p style={{ color: 'var(--text-muted)' }}>Deleted files will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {files.map((file) => (
            <div key={file.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.file_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{formatSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{file.mime_type}</span>
                  {file.deleted_at && (
                    <>
                      <span>•</span>
                      <span>Deleted {formatDate(file.deleted_at)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(file)}
                  disabled={actionLoading === file.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === file.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(file)}
                  disabled={actionLoading === file.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-300">Files in trash can be restored or permanently deleted. Permanent deletion cannot be undone.</p>
          </div>
        </div>
      )}
    </div>
  );
}
