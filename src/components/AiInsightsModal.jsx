import { X, Sparkles, Shield, Tag, FileSearch } from 'lucide-react';

export default function AiInsightsModal({ insights, onClose }) {
  if (!insights) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-gray-100">AI Analysis</h2>
        </div>

        <div className="space-y-5">

          {/* Classification */}
          {insights.classification && (
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileSearch className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-gray-200">Content Classification</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-200">{insights.classification.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Confidence:</span>
                  <span className="ml-2 text-gray-200">{insights.classification.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{insights.classification.reason}</p>
            </div>
          )}

          {/* Tags */}
          {insights.tags && (
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-gray-200">Suggested Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.tags.tags?.map((tag, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Access Recommendations */}
          {insights.accessRecommendation && (
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <h3 className="font-semibold text-gray-200">Access Recommendations</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Level</span>
                  <span className={`font-medium ${
                    insights.accessRecommendation.securityLevel === 'high'
                      ? 'text-red-400'
                      : insights.accessRecommendation.securityLevel === 'medium'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {insights.accessRecommendation.securityLevel?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Password Required</span>
                  <span className="text-gray-200">{insights.accessRecommendation.requirePassword ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Suggested Expiry</span>
                  <span className="text-gray-200">{insights.accessRecommendation.suggestedExpiryDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Download Limit</span>
                  <span className="text-gray-200">{insights.accessRecommendation.suggestedDownloadLimit}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{insights.accessRecommendation.reason}</p>
            </div>
          )}

          {/* Summary */}
          {insights.summary && (
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h3 className="font-semibold text-gray-200 mb-1">AI Summary</h3>
              <p className="text-sm text-gray-400">{insights.summary.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
