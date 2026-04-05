import { X, Copy, Check, QrCode } from 'lucide-react';
import { useState } from 'react';

export default function ShareModal({ shareData, onClose, onShowQR }) {
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const shareLink = shareData.data?.share_link || shareData.share_link || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-100 mb-4">Share Link Created!</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Share Link Code</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="input-field flex-1 font-mono text-sm"
              />
              <button onClick={handleCopy} className="btn-secondary py-2.5 px-3">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {shareData.data && (
            <div className="text-sm text-gray-500 space-y-1">
              <p>Expires: <span className="text-gray-300">{new Date(Date.now() + shareData.data.expiry_days * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({shareData.data.expiry_days} days)</span></p>
              <p>Downloads remaining: <span className="text-gray-300">{shareData.data.download_limit}</span></p>
              {shareData.data.password && <p>Password protected: <span className="text-green-400">Yes</span></p>}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Share this code with others. They can use it on the "Access Shared" page to download the file.
          </p>

          {onShowQR && shareLink && (
            <button
              onClick={() => onShowQR(shareLink)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Show QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
