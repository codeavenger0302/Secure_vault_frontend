import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import {
  Activity, Upload, Download, Share2, Trash2, RotateCcw,
  FolderPlus, ArrowRight, Edit3, Loader2, Shield, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const actionIcons = {
  upload: Upload,
  download: Download,
  share: Share2,
  delete: Trash2,
  restore: RotateCcw,
  move: ArrowRight,
  rename: Edit3,
  create_folder: FolderPlus,
  permanent_delete: Trash2,
};

const actionColors = {
  upload: 'text-green-400',
  download: 'text-blue-400',
  share: 'text-purple-400',
  delete: 'text-red-400',
  restore: 'text-yellow-400',
  move: 'text-cyan-400',
  rename: 'text-orange-400',
  create_folder: 'text-emerald-400',
  permanent_delete: 'text-red-500',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ActivityLogPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [checkingAnomalies, setCheckingAnomalies] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await storageService.getActivityLog(user.id, 100);
        setActivities(data.activities || []);
      } catch {
        toast.error('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAnomalyCheck = async () => {
    setCheckingAnomalies(true);
    try {
      const result = await aiService.detectAnomalies(activities);
      setAnomalyResult(result);
      toast.success('Anomaly analysis complete');
    } catch {
      toast.error('Anomaly detection failed');
    } finally {
      setCheckingAnomalies(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Activity Log
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">
            Track all file operations
          </p>
        </div>
        <button
          onClick={handleAnomalyCheck}
          disabled={checkingAnomalies || activities.length === 0}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          {checkingAnomalies ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {checkingAnomalies ? 'Analyzing...' : 'AI Anomaly Check'}
        </button>
      </div>

      {/* Anomaly Results */}
      {anomalyResult && (
        <div className={`card mb-6 ${anomalyResult.hasAnomalies ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
          <div className="flex items-center gap-2 mb-3">
            {anomalyResult.hasAnomalies ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            ) : (
              <Shield className="w-5 h-5 text-green-400" />
            )}
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {anomalyResult.hasAnomalies ? 'Anomalies Detected' : 'No Anomalies Detected'}
            </h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{anomalyResult.summary}</p>
          {anomalyResult.anomalies?.map((a, i) => (
            <div key={i} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-2 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>{a.type}</span>
                <span className={`font-bold ${a.severity === 'high' ? 'text-red-400' : a.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {a.severity?.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)' }} className="mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No activity yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your file operations will be logged here</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action] || Activity;
            const color = actionColors[activity.action] || 'text-gray-400';

            return (
              <div key={activity.id} className="card py-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-gray-800/50 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    <span className="capitalize">{activity.action.replace('_', ' ')}</span>
                    {activity.file_name && (
                      <span style={{ color: 'var(--text-secondary)' }}> — {activity.file_name}</span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {activity.details}
                  </p>
                </div>
                <div className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(activity.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
