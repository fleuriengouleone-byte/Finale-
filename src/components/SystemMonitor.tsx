import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Layers, 
  Clock, 
  Activity, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { ServerStats, SshCredentials } from '../types/ssh';

interface SystemMonitorProps {
  server: SshCredentials | null;
  isSandbox?: boolean;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ server, isSandbox }) => {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (isSandbox) {
      setLoading(true);
      setTimeout(() => {
        setStats({
          osName: 'Ubuntu 24.04 LTS (Noble Numbat) · 6.8.0-generic x86_64',
          uptime: '14 jours, 3 heures, 18 min',
          cpuLoad: '0.14, 0.08, 0.05',
          memory: {
            totalMb: 3912,
            usedMb: 845,
            freeMb: 3067,
            percentage: 22,
          },
          disk: {
            total: '38.2 GB',
            used: '9.4 GB',
            available: '28.8 GB',
            percentage: 25,
            mount: '/',
          },
          dockerRunning: true,
        });
        setLoading(false);
      }, 350);
      return;
    }

    if (!server) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ssh/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
      });

      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Impossible de lire les statistiques');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [server, isSandbox]);

  if (!server && !isSandbox) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <Server className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
        <p className="text-sm">Connectez un serveur VPS ou ouvrez le Bac à sable pour afficher le monitoring en direct.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {isSandbox ? 'Bac à sable virtuel' : server?.name || server?.host}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                En ligne
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.osName || 'Détection du système en cours...'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser les métriques</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Memory RAM */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Mémoire RAM</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {stats ? `${stats.memory.percentage}%` : '--'}
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.memory.percentage || 0) > 85 ? 'bg-rose-500' : 'bg-sky-500'
              }`}
              style={{ width: `${stats?.memory.percentage || 0}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
            <span>Utilisé: {stats?.memory.usedMb || 0} MB</span>
            <span>Total: {stats?.memory.totalMb || 0} MB</span>
          </div>
        </div>

        {/* Disk Storage */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Espace Disque (/)</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {stats ? `${stats.disk.percentage}%` : '--'}
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.disk.percentage || 0) > 90 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${stats?.disk.percentage || 0}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
            <span>Utilisé: {stats?.disk.used || '0'}</span>
            <span>Dispo: {stats?.disk.available || '0'}</span>
          </div>
        </div>

        {/* CPU Load & Uptime */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Temps d'activité</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xs font-mono font-semibold text-slate-200 line-clamp-2">
            {stats?.uptime || 'N/A'}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Moyenne de charge : <span className="font-mono text-slate-200">{stats?.cpuLoad || '0.10, 0.05'}</span>
          </div>
        </div>

        {/* Docker Engine */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Moteur Docker</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-sm font-semibold text-white">
            {stats?.dockerRunning ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Opérationnel
              </span>
            ) : (
              <span className="text-slate-400">Non détecté</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Conteneurs prêts à exécuter vos microservices et bases de données.
          </p>
        </div>
      </div>
    </div>
  );
};
