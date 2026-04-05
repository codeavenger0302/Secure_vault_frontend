import {
  FileText,
  Image,
  Video,
  Music,
  Code,
  Archive,
  Table,
  Presentation,
  Database,
  File,
  Download,
  Share2,
  Sparkles,
  Tag,
  Clock,
  Eye,
  Trash2,
  Brain,
  Mail,
  MoreHorizontal,
  Pencil,
  FolderInput,
  History,
} from 'lucide-react';

const iconMap = {
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
  code: Code,
  archive: Archive,
  spreadsheet: Table,
  presentation: Presentation,
  database: Database,
};

const gradientMap = {
  document: 'from-blue-500 to-indigo-500',
  image: 'from-green-500 to-emerald-500',
  video: 'from-purple-500 to-pink-500',
  audio: 'from-yellow-500 to-orange-500',
  code: 'from-cyan-500 to-blue-500',
  archive: 'from-orange-500 to-red-500',
  spreadsheet: 'from-emerald-500 to-teal-500',
  presentation: 'from-pink-500 to-rose-500',
  database: 'from-red-500 to-orange-500',
};

const colorMap = {
  document: 'text-blue-400',
  image: 'text-green-400',
  video: 'text-purple-400',
  audio: 'text-yellow-400',
  code: 'text-cyan-400',
  archive: 'text-orange-400',
  spreadsheet: 'text-emerald-400',
  presentation: 'text-pink-400',
  database: 'text-red-400',
};

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FileCard({ file, onDownload, onShare, onAiAnalyze, onPreview, onTrash, onExplain, onEmailShare, onRename, onMove, onVersions, isMoreOpen = false, onToggleMore }) {
  const category = (file.category || 'other').toLowerCase();
  const Icon = iconMap[category] || File;
  const iconColor = colorMap[category] || 'text-gray-400';
  const gradient = gradientMap[category] || 'from-gray-500 to-slate-500';

  return (
    <div className="card-glow group relative overflow-hidden">
      {/* Gradient accent line at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start gap-4">
        {/* Icon with gradient border */}
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shrink-0`}>
          <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.file_name}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">{formatSize(file.file_size)}</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
            <span>{file.mime_type || 'unknown'}</span>
            {file.uploaded_at && (
              <>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(file.uploaded_at)}
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <Tag className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              {file.tags.map((tag, i) => (
                <span key={i} className="badge text-[10px] py-0.5 px-2">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Summary */}
          {file.summary && (
            <p className="text-xs mt-2 italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>{file.summary}</p>
          )}

          {/* Category + Relevance badges */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {file.category && (
              <span className={`badge badge-indigo text-[10px]`}>
                {file.category}
              </span>
            )}
            {file._relevance && (
              <span className="badge badge-green text-[10px]">
                {file._relevance}% match
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => onDownload(file)}
          className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          title="Download"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Download</span>
        </button>
        <button
          onClick={() => onShare(file)}
          className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-green-500/10 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          title="Share"
        >
          <Share2 className="w-3.5 h-3.5 text-green-400" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={() => onAiAnalyze(file)}
          className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          title="AI Analyze"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Analyze</span>
        </button>
        {onExplain && (
          <button
            onClick={() => onExplain(file)}
            className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            title="Explain Document"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Explain</span>
          </button>
        )}

        {/* More actions toggle */}
        <button
          onClick={() => onToggleMore?.(file.id)}
          className="flex items-center gap-1 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer ml-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded actions */}
      {isMoreOpen && (
        <div className="flex items-center gap-1 mt-2 flex-wrap animate-fade-in">
          {onPreview && (
            <button
              onClick={() => onPreview(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-sky-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              Preview
            </button>
          )}
          {onRename && (
            <button
              onClick={() => onRename(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-teal-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Pencil className="w-3.5 h-3.5 text-teal-400" />
              Rename
            </button>
          )}
          {onMove && (
            <button
              onClick={() => onMove(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FolderInput className="w-3.5 h-3.5 text-yellow-400" />
              Move
            </button>
          )}
          {onVersions && (
            <button
              onClick={() => onVersions(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-violet-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <History className="w-3.5 h-3.5 text-violet-400" />
              Versions
            </button>
          )}
          {onEmailShare && (
            <button
              onClick={() => onEmailShare(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Email
            </button>
          )}
          {onTrash && (
            <button
              onClick={() => onTrash(file)}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Trash
            </button>
          )}
        </div>
      )}
    </div>
  );
}
