import { useState, useEffect } from 'react';
import { X, Download, Loader2, File } from 'lucide-react';

const GENERIC_BINARY_MIME = 'application/octet-stream';

const extensionMimeMap = {
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  log: 'text/plain',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  ts: 'text/plain',
  jsx: 'text/plain',
  tsx: 'text/plain',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
};

function normalizeMime(mime) {
  return (mime || '').split(';')[0].trim().toLowerCase();
}

function isGenericMime(mime) {
  const normalized = normalizeMime(mime);
  return !normalized || normalized === GENERIC_BINARY_MIME;
}

function inferMimeFromFilename(filename) {
  if (!filename || !filename.includes('.')) return '';
  const ext = filename.split('.').pop().toLowerCase();
  return extensionMimeMap[ext] || '';
}

function inferMimeFromBytes(bytes) {
  if (!bytes || bytes.length < 4) return '';

  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'application/pdf';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg';
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'video/mp4';
  return '';
}

function resolvePreviewMime({ fileMime, blobMime, fileName, bytes }) {
  const normalizedBlobMime = normalizeMime(blobMime);
  if (!isGenericMime(normalizedBlobMime)) return normalizedBlobMime;

  const normalizedFileMime = normalizeMime(fileMime);
  if (!isGenericMime(normalizedFileMime)) return normalizedFileMime;

  const fromBytes = inferMimeFromBytes(bytes);
  if (fromBytes) return fromBytes;

  const fromName = inferMimeFromFilename(fileName);
  if (fromName) return fromName;

  return normalizedFileMime || normalizedBlobMime || GENERIC_BINARY_MIME;
}

function isImage(mime) {
  return mime?.startsWith('image/');
}

function isText(mime) {
  return mime?.startsWith('text/') || ['application/json', 'application/xml', 'application/javascript'].includes(mime);
}

function isPDF(mime) {
  return mime === 'application/pdf';
}

function isVideo(mime) {
  return mime?.startsWith('video/');
}

function isAudio(mime) {
  return mime?.startsWith('audio/');
}

export default function FilePreviewModal({ file, fileData, loading, onClose, onDownload }) {
  const [textContent, setTextContent] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [resolvedMime, setResolvedMime] = useState('');

  useEffect(() => {
    let cancelled = false;
    let nextObjectUrl = null;

    const cleanup = () => {
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
    };

    const preparePreview = async () => {
      if (!fileData) {
        setTextContent(null);
        setObjectUrl(null);
        setResolvedMime(normalizeMime(file?.mime_type) || GENERIC_BINARY_MIME);
        return;
      }

      const sourceBlob = fileData instanceof Blob ? fileData : new Blob([fileData], { type: file?.mime_type || '' });
      const sniffBytes = new Uint8Array(await sourceBlob.slice(0, 16).arrayBuffer());

      const effectiveMime = resolvePreviewMime({
        fileMime: file?.mime_type,
        blobMime: sourceBlob.type,
        fileName: file?.file_name,
        bytes: sniffBytes,
      });

      const previewBlob = normalizeMime(sourceBlob.type) === effectiveMime
        ? sourceBlob
        : new Blob([sourceBlob], { type: effectiveMime });

      if (isText(effectiveMime)) {
        const text = await previewBlob.text();
        if (!cancelled) {
          setObjectUrl(null);
          setTextContent(text);
          setResolvedMime(effectiveMime);
        }
        return;
      }

      nextObjectUrl = URL.createObjectURL(previewBlob);
      if (!cancelled) {
        setTextContent(null);
        setObjectUrl(nextObjectUrl);
        setResolvedMime(effectiveMime);
      }
    };

    preparePreview().catch(() => {
      if (!cancelled) {
        setTextContent(null);
        setObjectUrl(null);
        setResolvedMime(normalizeMime(file?.mime_type) || GENERIC_BINARY_MIME);
      }
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [fileData, file]);

  const displayMime = resolvedMime || normalizeMime(file?.mime_type) || GENERIC_BINARY_MIME;

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>{file.file_name}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{displayMime}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {onDownload && (
              <button onClick={() => onDownload(file)} className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-sm">
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto mt-4 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>Decrypting & loading preview...</span>
            </div>
          ) : isImage(displayMime) && objectUrl ? (
            <div className="flex items-center justify-center">
              <img src={objectUrl} alt={file.file_name} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            </div>
          ) : isPDF(displayMime) && objectUrl ? (
            <iframe src={objectUrl} className="w-full h-[60vh] rounded-lg border" style={{ borderColor: 'var(--border-color)' }} title={file.file_name} />
          ) : isVideo(displayMime) && objectUrl ? (
            <video src={objectUrl} controls className="max-w-full max-h-[60vh] mx-auto rounded-lg">
              Your browser does not support video playback.
            </video>
          ) : isAudio(displayMime) && objectUrl ? (
            <div className="flex items-center justify-center py-16">
              <audio src={objectUrl} controls className="w-full max-w-lg">
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : isText(displayMime) && textContent !== null ? (
            <pre className="text-sm p-4 rounded-lg overflow-auto max-h-[60vh] font-mono" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              {textContent}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <File className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preview not available</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                This file type ({displayMime}) cannot be previewed in the browser.
              </p>
              {onDownload && (
                <button onClick={() => onDownload(file)} className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Instead
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
