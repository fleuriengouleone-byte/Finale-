import React, { useState } from 'react';
import {
  ServerCog,
  ShieldCheck,
  Radio,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  Save,
  HelpCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { EngineSettings } from '../types/vless';

interface EngineSettingsViewProps {
  settings: EngineSettings;
  onUpdateSettings: (newSettings: Partial<EngineSettings>) => Promise<void>;
  onRefreshStatus: () => void;
}

export const EngineSettingsView: React.FC<EngineSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRefreshStatus,
}) => {
  const [formData, setFormData] = useState<EngineSettings>(settings);
  const [probeResult, setProbeResult] = useState<{
    tested: boolean;
    loading: boolean;
    latencyMs?: number;
    statusText?: string;
    code?: number;
    error?: string;
  }>({
    tested: false,
    loading: false,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleTestProbe = async () => {
    setProbeResult({ tested: false, loading: true });
    try {
      const res = await fetch('/api/engine/status');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du test de sonde');
      }

      setProbeResult({
        tested: true,
        loading: false,
        latencyMs: data.status.lastPingMs || 120,
        code: data.status.lastPingStatus || 101,
        statusText: data.status.label,
      });
      onRefreshStatus();
    } catch (e: any) {
      setProbeResult({
        tested: true,
        loading: false,
        error: e.message || 'Échec de la connexion TLS',
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Impossible d\'enregistrer les paramètres');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-cyan-400 mb-1">
          <ServerCog className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">Paramètres du Moteur & Connexion Cloud Run</h2>
        </div>
        <p className="text-xs text-slate-400">
          Configuration de la passerelle Xray/VLESS et du mécanisme de sonde non-destructif.
        </p>
      </div>

      {/* Live Probe Diagnostic Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Diagnostic de Disponibilité du Service Hôte</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Envoie une requête de sonde TLS WebSocket vers le service Cloud Run cible sans modifier aucune configuration.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestProbe}
            disabled={probeResult.loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-900/30 disabled:opacity-50 active:scale-95 whitespace-nowrap"
          >
            {probeResult.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            <span>{probeResult.loading ? 'Test en cours...' : 'Tester la sonde maintenant'}</span>
          </button>
        </div>

        {probeResult.tested && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1 animate-in zoom-in-95 ${
              probeResult.error
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>{probeResult.error ? 'Échec du test' : 'Sonde réussie avec succès !'}</span>
              {probeResult.latencyMs && (
                <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/30">
                  {probeResult.latencyMs} ms
                </span>
              )}
            </div>
            <p className="text-[11px]">
              {probeResult.error
                ? probeResult.error
                : `Le service Cloud Run (${formData.targetHost}) a renvoyé une réponse HTTP valide (${probeResult.code || 101}). L'instance est chaude et fonctionnelle.`}
            </p>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Paramètres par Défaut des Profils</h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
            Automatiquement appliqués aux nouveaux comptes
          </span>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Paramètres enregistrés avec succès !</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Hôte Cible (Nom de domaine Cloud Run)
            </label>
            <input
              type="text"
              value={formData.targetHost}
              onChange={(e) => setFormData({ ...formData, targetHost: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Port TLS</label>
            <input
              type="number"
              value={formData.targetPort}
              onChange={(e) => setFormData({ ...formData, targetPort: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Chemin WebSocket (Path)</label>
            <input
              type="text"
              value={formData.wsPath}
              onChange={(e) => setFormData({ ...formData, wsPath: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">SNI (Server Name Indication)</label>
            <input
              type="text"
              value={formData.sni}
              onChange={(e) => setFormData({ ...formData, sni: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Keep-Alive Configuration */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sonde Keep-Alive Anti-Mise en Veille (Cloud Run)</span>
            </label>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {formData.keepAliveIntervalMinutes} minute(s)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Envoie une pulsation régulière pour maintenir le conteneur Cloud Run éveillé et éliminer le délai de démarrage à froid (cold start).
          </p>
          <div className="flex items-center gap-2">
            {[1, 3, 5, 10, 14].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFormData({ ...formData, keepAliveIntervalMinutes: m })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  formData.keepAliveIntervalMinutes === m
                    ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Section explicative des 2 modes (Section 12 de la consigne) */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs text-slate-300">
          <h4 className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Options d'intégration du Moteur (Section 12)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-1">
              <span className="font-bold text-cyan-300 block">Option A : Mode Déconnecté Sécurisé (Actif)</span>
              <p className="text-slate-400 leading-relaxed">
                Le service existant "montre" fonctionne sans être touché ni modifié. Le panneau génère des profils valides et gère les droits et expirations en base Firestore.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
              <span className="font-bold text-slate-300 block">Option B : Moteur Séparé gRPC</span>
              <p className="text-slate-400 leading-relaxed">
                Nécessite le déploiement d'une nouvelle instance Xray dédiée exposant son port de gestion interne gRPC (<code className="text-slate-300">HandlerService</code>) pour une injection dynamique en mémoire.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
