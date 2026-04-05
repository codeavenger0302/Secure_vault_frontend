import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFileStore } from '../hooks/useFileStore';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { ensureFileNameWithExtension } from '../services/fileNameUtils';
import FileDropzone from '../components/FileDropzone';
import { Upload, Loader2, Sparkles, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const { user } = useAuth();
  const { files, addFile } = useFileStore();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [hashDuplicate, setHashDuplicate] = useState(null);

  // Compute SHA-256 hash of a file (matches backend's SHA-256 check)
  const computeFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileDrop = async (file) => {
    setSelectedFile(file);
    setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    setAiInsights(null);
    setDuplicateWarning(null);
    setHashDuplicate(null);

    // Check server-side duplicate by file hash
    try {
      const hash = await computeFileHash(file);
      const dupResult = await storageService.checkDuplicate(user?.id, hash);
      if (dupResult.is_duplicate) {
        setHashDuplicate(dupResult);
      }
    } catch {
      // Duplicate check is non-blocking
    }

    // Run AI analysis in background
    try {
      setAnalyzing(true);

      // Run sequentially to avoid Gemini rate limits
      const classification = await aiService.classifyFile(file.name, file.type, file.size).catch(() => null);
      const tags = await aiService.generateTags(file.name, file.type, file.size).catch(() => null);
      const duplicates = await aiService.detectDuplicates(file, files).catch(() => null);
      const summary = await aiService.getFileSummary(file.name, file.type, file.size).catch(() => null);

      setAiInsights({
        classification,
        tags,
        summary,
      });

      if (duplicates?.hasDuplicates) {
        setDuplicateWarning(duplicates);
      }
    } catch {
      // AI analysis is optional, don't block upload
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const userId = user?.id;

    if (!userId) {
      toast.error('User ID not found. Please re-login.');
      return;
    }

    setUploading(true);
    try {
      const uploadName = ensureFileNameWithExtension(customName || selectedFile.name, selectedFile.name, selectedFile.type);
      const result = await storageService.uploadFile(selectedFile, userId, uploadName);

      if (result.data) {
        // Save to local store with AI metadata
        addFile({
          ...result.data,
          category: aiInsights?.classification?.category || null,
          tags: aiInsights?.tags?.tags || [],
          summary: aiInsights?.summary?.summary || null,
        });

        toast.success('File uploaded and encrypted successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.msg || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          Upload File
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-2">
          Files are encrypted with AES-256 before storage
        </p>
      </div>

      <div className="space-y-6">
        <FileDropzone onFileDrop={handleFileDrop} disabled={uploading} />

        {selectedFile && (
          <>
            {/* Custom name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>File Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="input-field"
                placeholder="Custom file name"
              />
            </div>

            {/* AI Analysis */}
            {analyzing && (
              <div className="card flex items-center gap-3 text-sm animate-fade-in">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span style={{ color: 'var(--text-secondary)' }}>AI is analyzing your file...</span>
              </div>
            )}

            {/* Server-side Hash Duplicate Warning */}
            {hashDuplicate && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-300">Exact Duplicate Found</p>
                  <p className="text-sm text-red-200/70 mt-1">
                    This file is identical to <strong>"{hashDuplicate.existing_file}"</strong> already in your vault.
                    Uploading will create a new version.
                  </p>
                </div>
              </div>
            )}

            {/* AI Duplicate Warning */}
            {duplicateWarning && duplicateWarning.hasDuplicates && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-yellow-300">Possible Duplicate Detected</p>
                  {duplicateWarning.duplicates.map((dup, i) => (
                    <p key={i} className="text-sm text-yellow-200/70 mt-1">
                      {dup.similarity}% similar — {dup.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights Preview */}
            {aiInsights && (
              <div className="card space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>AI Insights</span>
                </div>

                {aiInsights.classification && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                    <span className="badge badge-indigo">{aiInsights.classification.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({aiInsights.classification.confidence}%)</span>
                  </div>
                )}

                {aiInsights.tags?.tags && (
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Tags:</span>
                    {aiInsights.tags.tags.map((tag, i) => (
                      <span key={i} className="badge text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {aiInsights.summary && (
                  <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{aiInsights.summary.summary}</p>
                )}
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Encrypting & Uploading...' : 'Upload & Encrypt'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
