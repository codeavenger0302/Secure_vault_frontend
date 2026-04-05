import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFileStore } from '../hooks/useFileStore';
import { storageService } from '../services/storageService';
import { shareService } from '../services/shareService';
import { aiService } from '../services/aiService';
import { ensureFileNameWithExtension, resolveDownloadFilename } from '../services/fileNameUtils';
import FileCard from '../components/FileCard';
import ShareModal from '../components/ShareModal';
import AiInsightsModal from '../components/AiInsightsModal';
import FilePreviewModal from '../components/FilePreviewModal';
import QRCodeModal from '../components/QRCodeModal';
import DocumentExplainerModal from '../components/DocumentExplainerModal';
import EmailShareModal from '../components/EmailShareModal';
import { FolderOpen, Upload, Search, Loader2, Sparkles, Pencil, FolderInput, History, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, loading: filesLoading, updateFile, removeFile, refetch } = useFileStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [shareModalData, setShareModalData] = useState(null);
  const [aiModalData, setAiModalData] = useState(null);
  const [shareForm, setShareForm] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [sharingFile, setSharingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [qrShareLink, setQrShareLink] = useState(null);
  const [smartSearching, setSmartSearching] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [explainFile, setExplainFile] = useState(null);
  const [emailShareFile, setEmailShareFile] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [moveData, setMoveData] = useState(null);
  const [moving, setMoving] = useState(false);
  const [folders, setFolders] = useState([]);
  const [versionsData, setVersionsData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [openMoreFileId, setOpenMoreFileId] = useState(null);

  const handleToggleMore = (fileId) => {
    setOpenMoreFileId((prev) => (prev === fileId ? null : fileId));
  };

  const filteredFiles = smartResults
    ? smartResults
    : files.filter((f) => {
        const term = searchTerm.toLowerCase();
        return (
          f.file_name?.toLowerCase().includes(term) ||
          f.category?.toLowerCase().includes(term) ||
          f.tags?.some((t) => t.toLowerCase().includes(term))
        );
      });

  const handleDownload = async (file) => {
    try {
      const res = await storageService.getFile(user?.id || file.userid, file.id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const disposition = res.headers['content-disposition'];
      const filename = resolveDownloadFilename({
        preferredName: file.file_name,
        disposition,
        mime: res.data?.type || res.headers['content-type'],
        fallbackName: 'download',
      });

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handlePreview = async (file) => {
    setPreviewFile(file);
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const res = await storageService.getFile(user?.id || file.userid, file.id);
      setPreviewData(res.data);
    } catch {
      toast.error('Failed to load file preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTrash = async (file) => {
    try {
      await storageService.trashFile(user.id, file.id);
      removeFile(file.id);
      toast.success(`${file.file_name} moved to trash`);
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const handleShareClick = (file) => {
    setShareForm({
      file,
      password: '',
      expiryDays: 7,
      downloadLimit: 5,
    });
  };

  const handleCreateShare = async () => {
    if (!shareForm) return;

    setSharingFile(true);
    try {
      const result = await shareService.createShare(
        shareForm.file.id,
        user?.id || shareForm.file.userid,
        shareForm.password,
        shareForm.expiryDays,
        shareForm.downloadLimit
      );

      if (result.msg === 'success') {
        setShareModalData(result);
        setShareForm(null);
        toast.success('Share link created!');
      } else {
        toast.error(result.msg || 'Failed to create share link');
      }
    } catch (err) {
      toast.error('Failed to create share link');
    } finally {
      setSharingFile(false);
    }
  };

  const handleAiAnalyze = async (file) => {
    setLoadingAi(true);
    try {
      const classification = await aiService.classifyFile(file.file_name, file.mime_type, file.file_size).catch(() => null);
      const tags = await aiService.generateTags(file.file_name, file.mime_type, file.file_size).catch(() => null);
      const accessRecommendation = await aiService.recommendAccess(file.file_name, file.mime_type, file.file_size).catch(() => null);
      const summary = await aiService.getFileSummary(file.file_name, file.mime_type, file.file_size).catch(() => null);

      const insights = { classification, tags, accessRecommendation, summary };

      setAiModalData(insights);

      if (insights.classification || insights.tags || insights.summary) {
        updateFile(file.id, {
          category: insights.classification?.category || file.category,
          tags: insights.tags?.tags || file.tags,
          summary: insights.summary?.summary || file.summary,
        });
      }
    } catch {
      toast.error('AI analysis failed. Check your API key.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchTerm.trim() || files.length === 0) return;
    setSmartSearching(true);
    try {
      const result = await aiService.smartSearch(searchTerm, files);
      if (result.results && result.results.length > 0) {
        const matchedFiles = result.results
          .filter((r) => r.index >= 0 && r.index < files.length)
          .map((r) => ({ ...files[r.index], _relevance: r.relevance, _reason: r.reason }));
        setSmartResults(matchedFiles);
        toast.success(`Found ${matchedFiles.length} matching files`);
      } else {
        setSmartResults([]);
        toast.success('No matches found');
      }
    } catch {
      toast.error('Smart search failed');
    } finally {
      setSmartSearching(false);
    }
  };

  const clearSmartSearch = () => {
    setSmartResults(null);
    setSearchTerm('');
  };

  const handleExplain = (file) => {
    setExplainFile(file);
  };

  const handleEmailShare = (file) => {
    setEmailShareFile(file);
  };

  // ---- RENAME FILE ----
  const handleRename = (file) => {
    const nameWithoutExt = file.file_name.replace(/\.[^/.]+$/, '');
    setRenameData({ file, newName: nameWithoutExt });
  };

  const submitRename = async () => {
    if (!renameData || !renameData.newName.trim()) return;
    setRenaming(true);
    try {
      const finalName = ensureFileNameWithExtension(
        renameData.newName.trim(),
        renameData.file.file_name,
        renameData.file.mime_type
      );
      await storageService.renameFile(user.id, renameData.file.id, finalName);
      updateFile(renameData.file.id, { file_name: finalName });
      toast.success('File renamed');
      setRenameData(null);
      refetch();
    } catch {
      toast.error('Failed to rename file');
    } finally {
      setRenaming(false);
    }
  };

  // ---- MOVE FILE ----
  const handleMove = async (file) => {
    setMoveData({ file, selectedFolder: null });
    try {
      const data = await storageService.listFolders(user.id);
      setFolders(data.folders || []);
    } catch {
      toast.error('Failed to load folders');
    }
  };

  const submitMove = async () => {
    if (!moveData) return;
    setMoving(true);
    try {
      await storageService.moveFile(user.id, moveData.file.id, moveData.selectedFolder);
      toast.success('File moved');
      setMoveData(null);
      refetch();
    } catch {
      toast.error('Failed to move file');
    } finally {
      setMoving(false);
    }
  };

  // ---- FILE VERSIONS ----
  const handleVersions = async (file) => {
    setVersionsData(file);
    setVersions([]);
    setVersionsLoading(true);
    try {
      const data = await storageService.getFileVersions(user.id, file.file_name);
      setVersions(data.versions || []);
    } catch {
      toast.error('Failed to load versions');
    } finally {
      setVersionsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            My Files
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">{files.length} file{files.length !== 1 ? 's' : ''} encrypted & stored</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 w-fit">
          <Upload className="w-4 h-4" />
          Upload File
        </Link>
      </div>

      {/* Search */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSmartResults(null); }}
              placeholder="Search files by name, category, or tag..."
              className="input-field pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
          </div>
          <button
            onClick={handleSmartSearch}
            disabled={smartSearching || !searchTerm.trim()}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            {smartSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Search
          </button>
          {smartResults && (
            <button onClick={clearSmartSearch} className="btn-secondary shrink-0">Clear</button>
          )}
        </div>
      )}

      {/* Loading AI indicator */}
      {loadingAi && (
        <div className="fixed top-20 right-4 z-40 card flex items-center gap-3 text-sm py-3 px-4">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span style={{ color: 'var(--text-secondary)' }}>AI analyzing...</span>
        </div>
      )}

      {/* File grid */}
      {filesLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isMoreOpen={openMoreFileId === file.id}
              onToggleMore={handleToggleMore}
              onDownload={handleDownload}
              onShare={handleShareClick}
              onAiAnalyze={handleAiAnalyze}
              onPreview={handlePreview}
              onTrash={handleTrash}
              onExplain={handleExplain}
              onEmailShare={handleEmailShare}
              onRename={handleRename}
              onMove={handleMove}
              onVersions={handleVersions}
            />
          ))}
        </div>
      ) : files.length > 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No files match &ldquo;{searchTerm}&rdquo;</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No files yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Upload your first file to get started</p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </Link>
        </div>
      )}

      {/* Share Form Modal */}
      {shareForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Share: {shareForm.file.file_name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password (optional)</label>
                <input
                  type="password"
                  value={shareForm.password}
                  onChange={(e) => setShareForm({ ...shareForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Leave empty for no password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expiry (days)</label>
                  <input
                    type="number"
                    value={shareForm.expiryDays}
                    onChange={(e) => setShareForm({ ...shareForm, expiryDays: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Download Limit</label>
                  <input
                    type="number"
                    value={shareForm.downloadLimit}
                    onChange={(e) => setShareForm({ ...shareForm, downloadLimit: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShareForm(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateShare} disabled={sharingFile} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {sharingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {sharingFile ? 'Creating...' : 'Create Share Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Result Modal */}
      <ShareModal
        shareData={shareModalData}
        onClose={() => setShareModalData(null)}
        onShowQR={(link) => {
          setShareModalData(null);
          setQrShareLink(link);
        }}
      />

      {/* AI Insights Modal */}
      <AiInsightsModal insights={aiModalData} onClose={() => setAiModalData(null)} />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          fileData={previewData}
          loading={previewLoading}
          onClose={() => { setPreviewFile(null); setPreviewData(null); }}
          onDownload={handleDownload}
        />
      )}

      {/* QR Code Modal */}
      <QRCodeModal shareLink={qrShareLink} onClose={() => setQrShareLink(null)} />

      {/* Document Explainer Modal */}
      {explainFile && (
        <DocumentExplainerModal
          file={explainFile}
          textContent={null}
          onClose={() => setExplainFile(null)}
        />
      )}

      {/* Email Share Modal */}
      {emailShareFile && (
        <EmailShareModal
          file={emailShareFile}
          onClose={() => setEmailShareFile(null)}
        />
      )}

      {/* Rename File Modal */}
      {renameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Pencil className="w-5 h-5 text-teal-400" />
              Rename File
            </h2>
            <input
              type="text"
              value={renameData.newName}
              onChange={(e) => setRenameData({ ...renameData, newName: e.target.value })}
              className="input-field mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRename()}
              placeholder="New file name"
            />
            <div className="flex gap-3">
              <button onClick={() => setRenameData(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={submitRename}
                disabled={renaming || !renameData.newName.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {renaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                {renaming ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {moveData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FolderInput className="w-5 h-5 text-yellow-400" />
              Move: {moveData.file.file_name}
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              <button
                onClick={() => setMoveData({ ...moveData, selectedFolder: null })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  moveData.selectedFolder === null
                    ? 'bg-indigo-500/20 border border-indigo-500/40'
                    : 'hover:bg-gray-500/10'
                }`}
                style={{ color: 'var(--text-primary)' }}
              >
                📁 Root (no folder)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setMoveData({ ...moveData, selectedFolder: folder.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    moveData.selectedFolder === folder.id
                      ? 'bg-indigo-500/20 border border-indigo-500/40'
                      : 'hover:bg-gray-500/10'
                  }`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  📁 {folder.name}
                </button>
              ))}
              {folders.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No folders found. Create one first.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMoveData(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={submitMove}
                disabled={moving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {moving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderInput className="w-4 h-4" />}
                {moving ? 'Moving...' : 'Move Here'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Versions Modal */}
      {versionsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <History className="w-5 h-5 text-violet-400" />
                Version History
              </h2>
              <button onClick={() => setVersionsData(null)} className="hover:bg-gray-500/10 p-1 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{versionsData.file_name}</p>
            {versionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : versions.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Version {v.version}
                      </span>
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(v.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(v)}
                      className="text-xs px-2 py-1 rounded hover:bg-indigo-500/10 text-indigo-400 transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                No previous versions found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
