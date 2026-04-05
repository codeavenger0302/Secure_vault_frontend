import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { HardDrive, FileText, Loader2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

function formatSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StorageDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [statsData, healthData] = await Promise.all([
          storageService.getStorageStats(user.id),
          storageService.healthCheck().catch(() => null),
        ]);
        setStats(statsData);
        setHealth(healthData);
      } catch {
        toast.error('Failed to load storage stats');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const usedPercent = stats?.used_percent || 0;
  const progressColor = usedPercent > 80 ? 'bg-red-500' : usedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8" style={{ color: 'var(--text-primary)' }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        Storage Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8 stagger-children">
        {/* Total Files */}
        <div className="card-glow text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 p-[1px] mx-auto mb-3">
            <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold gradient-text">{stats?.total_files || 0}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total Files</p>
        </div>

        {/* Storage Used */}
        <div className="card-glow text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-[1px] mx-auto mb-3">
            <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <HardDrive className="w-7 h-7 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold gradient-text">{formatSize(stats?.total_size || 0)}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Storage Used</p>
        </div>

        {/* Quota */}
        <div className="card-glow text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-[1px] mx-auto mb-3">
            <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <TrendingUp className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold gradient-text">{formatSize(stats?.quota || 0)}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total Quota</p>
        </div>
      </div>

      {/* Storage Progress Bar */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Storage Usage</h3>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {usedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${usedPercent > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' : usedPercent > 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{formatSize(stats?.total_size || 0)} used</span>
          <span>{formatSize((stats?.quota || 0) - (stats?.total_size || 0))} remaining</span>
        </div>
      </div>

      {/* Service Health */}
      {health && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Service Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${health.status?.includes('healthy') ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Gateway</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{health.gateway}</p>
            </div>
            {health.services && Object.entries(health.services).map(([name, status]) => (
              <div key={name} className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
