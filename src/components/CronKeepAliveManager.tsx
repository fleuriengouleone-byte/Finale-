import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Globe, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Timer, 
  Check, 
  ExternalLink,
  ChevronRight,
  X,
  Server
} from 'lucide-react';

export interface CronTarget {
  id: string;
  name: string;
  url: string;
  intervalMinutes: number;
  enabled: boolean;
  method: 'GET' | 'HEAD' | 'WS_PROBE';
  lastPingAt?: string;
  lastStatus?: number;
  lastLatencyMs?: number;
  lastResult?: 'success' | 'failed';
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  totalPings: number;
}

export interface CronLog {
  id: string;
  targetId: string;
  targetName: string;
  url: string;
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  success: boolean;
  details: string;
}

export function CronKeepAliveManager() {
  const [engineActive, setEngineActive] = useState(true);
  const [targets, setTargets] = useState<CronTarget[]>([]);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [stats, setStats] = useState<{
    uptimeScore: number;
    totalTargets: number;
    activeTargets: number;
    totalPingsExecuted: number;
  }>({
    uptimeScore: 100,
    totalTargets: 0,
    activeTargets: 0,
    totalPingsExecuted: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New target form
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newTargetInterval, setNewTargetInterval] = useState(5);
  const [newTargetMethod, setNewTargetMethod] = useState<'WS_PROBE' | 'GET'>('WS_PROBE');

  useEffect(() => {
    fetchCronStatus();
    const interval = setInterval(fetchCronStatus, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchCronStatus = async () => {
    try {
      const res = await fetch('/api/cron/status');
      const data = await res.json();
      if (data.success) {
        setEngineActive(data.engineActive);
        setTargets(data.targets);
        setLogs(data.logs);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEngine = async () => {
    try {
      const res = await fetch('/api/cron/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !engineActive }),
      });
      const data = await res.json();
      if (data.success) {
        setEngineActive(data.engineActive);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePingNow = async (targetId: string) => {
    try {
      setPingingId(targetId);
      const res = await fetch('/api/cron/ping-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCronStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setPingingId(null), 800);
    }
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetUrl.trim()) return;

    try {
      const res = await fetch('/api/cron/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTargetName || 'Nouveau Service',
          url: newTargetUrl,
          intervalMinutes: newTargetInterval,
          method: newTargetMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewTargetName('');
        setNewTargetUrl('');
        await fetchCronStatus();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleTarget = async (target: CronTarget) => {
    try {
      const res = await fetch(`/api/cron/targets/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !target.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setTargets(targets.map((t) => (t.id === target.id ? data.target : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeInterval = async (targetId: string, intervalMinutes: number) => {
    try {
      const res = await fetch(`/api/cron/targets/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes }),
      });
      const data = await res.json();
      if (data.success) {
        setTargets(targets.map((t) => (t.id === targetId ? data.target : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTarget = async (id: string, name: string) => {
    if (!confirm(`Supprimer la cible de cron job "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/cron/targets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTargets(targets.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Explainer & Master Switch */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/50 border border-emerald-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                engineActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-700/30 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${engineActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                {engineActive ? 'Bot Cron Keep-Alive Actif (24h/24)' : 'Moteur Cron en Pause'}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Anti-Mise en Veille Cloud Run
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Garder le Serveur Éveillé & Prêt Sans Interruption
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Google Cloud Run met automatiquement les conteneurs inactifs en veille (<em className="text-slate-200">Scale to zero</em> après 15 min). Ce bot envoie des requêtes HTTP et des sondes WebSocket régulières vers <strong className="text-white font-mono">montre-635195440423.us-central1.run.app</strong> pour maintenir le conteneur chaud, actif et disponible en permanence pour tous vos utilisateurs VPN/VLESS.
            </p>
          </div>

          {/* Master Control & Metrics */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleToggleEngine}
              className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                engineActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {engineActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Moteur Actif (Cliquer pour Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Activer le Moteur 24h/24</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Score Uptime</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{stats.uptimeScore}%</div>
              </div>
              <div className="flex-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Pings Envoyés</div>
                <div className="text-lg font-bold text-blue-400 font-mono">{stats.totalPingsExecuted}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Targets Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Cibles Périodiques de Maintien en Éveil</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configurez les URLs et l'intervalle de relance automatique (ex: toutes les 5 ou 10 minutes).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCronStatus}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => {
              setNewTargetUrl('https://');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une URL à garder éveillée</span>
          </button>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {targets.map((target) => {
          const isPinging = pingingId === target.id;
          const isWs = target.method === 'WS_PROBE' || target.url.includes('/Telegram');

          return (
            <div
              key={target.id}
              className={`rounded-2xl bg-slate-900/90 border p-5 space-y-4 transition-all ${
                target.enabled
                  ? 'border-slate-800 hover:border-emerald-500/40 shadow-lg shadow-slate-950/40'
                  : 'border-slate-800/60 opacity-60'
              }`}
            >
              {/* Header: Title, Method, Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base tracking-tight">{target.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      isWs 
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}>
                      {target.method}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono break-all">{target.url}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleTarget(target)}
                    title={target.enabled ? 'Désactiver' : 'Activer'}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      target.enabled
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {target.enabled ? <CheckCircle2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDeleteTarget(target.id, target.name)}
                    title="Supprimer la cible"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status & Last Ping info */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Dernier Statut</div>
                  <div className="font-mono font-bold mt-0.5 flex items-center gap-1.5">
                    {target.lastStatus ? (
                      <>
                        <span className={`w-2 h-2 rounded-full ${target.lastStatus === 101 || target.lastStatus === 200 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className="text-white">{target.lastStatus === 101 ? '101 (WS)' : target.lastStatus}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">En attente</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500">Latence Réseau</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    {target.lastLatencyMs !== undefined ? `${target.lastLatencyMs} ms` : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500">Succès consécutifs</div>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">
                    {target.consecutiveSuccesses || 0} fois
                  </div>
                </div>
              </div>

              {/* Interval selector & Ping Now Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Intervalle :</span>
                  <div className="flex items-center gap-1">
                    {[1, 5, 10, 14].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleChangeInterval(target.id, mins)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                          target.intervalMinutes === mins
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePingNow(target.id)}
                  disabled={isPinging}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isPinging
                      ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : 'text-emerald-400'}`} />
                  <span>{isPinging ? 'Ping en cours...' : 'Tester le ping maintenant'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Audit Log Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">Journal d'Activité Keep-Alive (Derniers Pings)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {logs.length} entrées enregistrées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Heure</th>
                <th className="py-2.5 px-3 font-semibold">Cible</th>
                <th className="py-2.5 px-3 font-semibold">Code Statut</th>
                <th className="py-2.5 px-3 font-semibold">Latence</th>
                <th className="py-2.5 px-3 font-semibold">Résultat & Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                  </td>
                  <td className="py-2.5 px-3 text-white font-semibold">
                    {log.targetName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.statusCode === 101
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : log.statusCode === 200
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : log.statusCode > 0
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {log.statusCode === 101 ? '101 WS SWITCH' : `HTTP ${log.statusCode || 'ERR'}`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold whitespace-nowrap">
                    {log.latencyMs} ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                    En attente du premier ping périodique...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD TARGET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Ajouter une URL à Garder Éveillée</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nom du Service
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mon Site Cloud Run, API Backend..."
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  URL Complète (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://mon-service-run.app/chemin"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Intervalle de Ping
                  </label>
                  <select
                    value={newTargetInterval}
                    onChange={(e) => setNewTargetInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value={1}>Toutes les 1 minute</option>
                    <option value={5}>Toutes les 5 minutes (Recommandé)</option>
                    <option value={10}>Toutes les 10 minutes</option>
                    <option value={14}>Toutes les 14 minutes (Limite 15m)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Méthode de Sonde
                  </label>
                  <select
                    value={newTargetMethod}
                    onChange={(e) => setNewTargetMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="WS_PROBE">WebSocket Probe (VLESS/Tunnel)</option>
                    <option value="GET">HTTP GET Standard</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Enregistrer & Démarrer le Ping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
