import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QRCodeModal({ shareLink, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!shareLink) return null;

  // Build the full share URL for QR code
  const shareUrl = `${window.location.origin}/share?code=${shareLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card max-w-sm w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Share via QR Code
        </h2>

        <div className="bg-white p-4 rounded-xl inline-block mb-4">
          <QRCodeSVG
            value={shareUrl}
            size={200}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#1e1b4b"
          />
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Scan this QR code to access the shared file
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="input-field flex-1 text-xs font-mono"
          />
          <button onClick={handleCopy} className="btn-secondary py-2.5 px-3">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
