const mimeExtensionMap = {
  'application/pdf': '.pdf',
  'application/json': '.json',
  'application/xml': '.xml',
  'application/javascript': '.js',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'text/html': '.html',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

function normalizeMime(mime = '') {
  return mime.split(';')[0].trim().toLowerCase();
}

export function hasExtension(fileName = '') {
  return /\.[^./\\]+$/.test(fileName);
}

export function getExtension(fileName = '') {
  if (!hasExtension(fileName)) return '';
  return fileName.slice(fileName.lastIndexOf('.'));
}

export function extensionFromMime(mime = '') {
  return mimeExtensionMap[normalizeMime(mime)] || '';
}

export function ensureFileNameWithExtension(name = '', referenceName = '', mime = '') {
  const trimmed = (name || '').trim();
  if (!trimmed) return '';
  if (hasExtension(trimmed)) return trimmed;

  const refExt = getExtension(referenceName);
  if (refExt) return `${trimmed}${refExt}`;

  const mimeExt = extensionFromMime(mime);
  if (mimeExt) return `${trimmed}${mimeExt}`;

  return trimmed;
}

export function parseFilenameFromContentDisposition(disposition = '') {
  if (!disposition) return '';

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).trim();
    } catch {
      return utf8Match[1].trim();
    }
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1]?.trim() || '';
}

export function resolveDownloadFilename({ preferredName = '', disposition = '', mime = '', fallbackName = 'download' }) {
  const normalizedPreferred = (preferredName || '').trim();
  const fromDisposition = parseFilenameFromContentDisposition(disposition);

  if (hasExtension(normalizedPreferred)) return normalizedPreferred;
  if (normalizedPreferred && hasExtension(fromDisposition)) return ensureFileNameWithExtension(normalizedPreferred, fromDisposition, mime);
  if (hasExtension(fromDisposition)) return fromDisposition;
  if (normalizedPreferred) return ensureFileNameWithExtension(normalizedPreferred, fromDisposition, mime);
  if (fromDisposition) return ensureFileNameWithExtension(fromDisposition, normalizedPreferred, mime);

  return ensureFileNameWithExtension(fallbackName, normalizedPreferred || fromDisposition, mime);
}
