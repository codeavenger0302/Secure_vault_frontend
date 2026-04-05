import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import {
  Folder, FolderPlus, ChevronRight, Home, Loader2,
  Trash2, Edit3, ArrowLeft, File,
} from 'lucide-react';
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FoldersPage() {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const fetchContents = async (folderId = null) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [folderData, fileData] = await Promise.all([
        storageService.listFolders(user.id, folderId),
        storageService.listFiles(user.id, folderId),
      ]);
      setFolders(folderData.folders || []);
      setFiles(fileData.files || []);
    } catch {
      toast.error('Failed to load folder contents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    if (!user?.id) return;
    try {
      const data = await storageService.listFolders(user.id);
      setAllFolders(data.folders || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchContents();
    fetchAllFolders();
  }, [user]);

  const navigateToFolder = (folder) => {
    setBreadcrumb((prev) => [...prev, folder]);
    setCurrentFolder(folder.id);
    fetchContents(folder.id);
  };

  const navigateUp = () => {
    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);
    const parentId = newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1].id : null;
    setCurrentFolder(parentId);
    fetchContents(parentId);
  };

  const navigateToRoot = () => {
    setBreadcrumb([]);
    setCurrentFolder(null);
    fetchContents();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    try {
      await storageService.createFolder(user.id, newFolderName.trim(), currentFolder);
      toast.success('Folder created');
      setShowCreateModal(false);
      setNewFolderName('');
      fetchContents(currentFolder);
      fetchAllFolders();
    } catch {
      toast.error('Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!confirm(`Delete folder "${folder.name}"?`)) return;
    try {
      await storageService.deleteFolder(user.id, folder.id);
      toast.success('Folder deleted');
      fetchContents(currentFolder);
      fetchAllFolders();
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  const handleRenameFolder = (folder) => {
    setRenamingFolder(folder);
    setRenameValue(folder.name);
  };

  const submitRenameFolder = async () => {
    if (!renamingFolder || !renameValue.trim()) return;
    setRenameSaving(true);
    try {
      await storageService.renameFolder(user.id, renamingFolder.id, renameValue.trim());
      toast.success('Folder renamed');
      setRenamingFolder(null);
      fetchContents(currentFolder);
      fetchAllFolders();
    } catch {
      toast.error('Failed to rename folder');
    } finally {
      setRenameSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            Folders
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={navigateToRoot} className="flex items-center gap-1 hover:text-indigo-400 transition-colors cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <Home className="w-4 h-4" />
          Root
        </button>
        {breadcrumb.map((folder, i) => (
          <span key={folder.id} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <button
              onClick={() => {
                const newBreadcrumb = breadcrumb.slice(0, i + 1);
                setBreadcrumb(newBreadcrumb);
                setCurrentFolder(folder.id);
                fetchContents(folder.id);
              }}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
              style={{ color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      {currentFolder && (
        <button onClick={navigateUp} className="flex items-center gap-2 mb-4 text-sm hover:text-indigo-400 transition-colors cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>FOLDERS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map((folder) => (
                  <div key={folder.id} className="card py-4 px-4 group cursor-pointer hover:border-yellow-500/30 transition-all" onClick={() => navigateToFolder(folder)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="w-8 h-8 text-yellow-400 shrink-0" />
                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRenameFolder(folder); }}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer p-1"
                          title="Rename"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>FILES</h2>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="card py-3 px-4 flex items-center gap-4">
                    <File className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.file_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatSize(file.file_size)} • {file.mime_type} • {formatDate(file.uploaded_at)}
                        {file.version > 1 && <span className="text-indigo-400"> • v{file.version}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>This folder is empty</h2>
              <p style={{ color: 'var(--text-muted)' }}>Create a subfolder or upload files here</p>
            </div>
          )}
        </>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="input-field mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreateFolder} disabled={creating || !newFolderName.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {renamingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Rename Folder
            </h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="New folder name"
              className="input-field mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRenameFolder()}
            />
            <div className="flex gap-3">
              <button onClick={() => setRenamingFolder(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={submitRenameFolder}
                disabled={renameSaving || !renameValue.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {renameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                {renameSaving ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
