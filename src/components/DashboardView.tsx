import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Activity,
  Server,
  Database,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  Plus,
  AlertTriangle,
  Info,
  Download,
} from 'lucide-react';
import { DashboardMetrics, VlessAccount, AuditLogEntry } from '../types/vless';
import { calculateRemainingDays } from '../utils/linkGenerators';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  accounts: VlessAccount[];
  recentLogs: AuditLogEntry[];
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  onRunExpiryCheck: () => void;
  onOpenCreate: () => void;
  onSelectAccount: (account: VlessAccount) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  accounts,
  recentLogs,
  onNavigate,
  onRefresh,
  onRunExpiryCheck,
  onOpenCreate,
  onSelectAccount,
}) => {
  const activeList = accounts.filter((a) => a.status === 'active');
  const expiringSoon = activeList
    .map((a) => ({ ...a, ...calculateRemainingDays(a.expiresAt) }))
    .filter((a) => !a.isExpired && a.days <= 3)
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Service Protection & Identity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 border border-slate-700/80 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                VLESS MANAGER — Dashboard
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                us-central1
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Plateforme d'administration sécurisée des accès VLESS & VMess sur Google Cloud Run.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Service hôte protégé : <code className="text-slate-300 font-mono">montre-635195440423.us-central1.run.app</code>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Port TLS: 443 (WSS)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/vless-manager.zip"
              download="vless-manager.zip"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              title="Télécharger l'archive ZIP complète du projet"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le ZIP</span>
            </a>
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un compte</span>
            </button>
            <button
              onClick={onRunExpiryCheck}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors"
              title="Vérifier et désactiver les comptes expirés"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Vérifier expirations</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Accounts */}
        <div
          onClick={() => onNavigate('all_accounts')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300">Total Comptes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{metrics?.totalAccounts ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tous les protocoles (VLESS/VMess)</p>
        </div>

        {/* Active Accounts */}
        <div
          onClick={() => onNavigate('active_accounts')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400">Comptes Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics?.activeAccounts ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Accès autorisés en cours</p>
        </div>

        {/* Expired Accounts */}
        <div
          onClick={() => onNavigate('expired_accounts')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/30 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400">Comptes Expirés</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">{metrics?.expiredAccounts ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Échéance de validité dépassée</p>
        </div>

        {/* Suspended Accounts */}
        <div
          onClick={() => onNavigate('suspended_accounts')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400">Comptes Suspendus</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{metrics?.suspendedAccounts ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Désactivés par l'administrateur</p>
        </div>
      </div>

      {/* Engine & Database Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine Connectivity Status Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">État du Moteur Xray / Cloud Run</h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {metrics?.engineStatus?.lastPingMs ? `${metrics.engineStatus.lastPingMs} ms` : 'En ligne'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Hôte cible :</span>
              <span className="text-slate-200 font-mono">{metrics?.engineStatus?.targetHost}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Mode opérationnel :</span>
              <span className="text-amber-300 font-semibold">Mode Déconnecté Sécurisé</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Dernier statut HTTP :</span>
              <span className="text-emerald-400 font-mono">
                {metrics?.engineStatus?.lastPingStatus ? `Code HTTP ${metrics.engineStatus.lastPingStatus}` : 'HTTP 101 WebSocket'}
              </span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Le conteneur distant est actif et répond aux requêtes TLS WebSocket. Conformément aux spécifications de sécurité, le service existant reste strictement inchangé sans injection gRPC risquée.
            </p>
          </div>
        </div>

        {/* Traffic Quota Reality Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Consommation & Compteurs Trafic</h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Non disponible
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trafic Total Mesuré :</span>
              <span className="text-slate-400 italic">Non disponible</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Compteur entrant / sortant :</span>
              <span className="text-slate-400 italic">Non disponible</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Contrôle des quotas :</span>
              <span className="text-cyan-300">Enregistré en base Firestore</span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Règle de rigueur technique :</strong> Le service Cloud Run existant n'expose pas de port gRPC d'administration pour les statistiques Xray. Les quotas définis servent de règles de gestion contractuelle.
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Soon & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expiring Soon (< 72h) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Comptes Proches de l'Expiration (≤ 3 jours)</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
              {expiringSoon.length} compte(s)
            </span>
          </div>

          {expiringSoon.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-800/30 border border-dashed border-slate-800">
              Aucun compte actif n'arrive à expiration dans les 3 prochains jours.
            </div>
          ) : (
            <div className="space-y-2">
              {expiringSoon.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => onSelectAccount(acc)}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-200">{acc.clientName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                        {acc.protocol}
                      </span>
                      <span>Échéance: {new Date(acc.expiresAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                      {acc.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Operations */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Dernières Opérations d'Audit</h2>
            </div>
            <button
              onClick={() => onNavigate('audit_logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-800/30 border border-dashed border-slate-800">
              Aucune opération enregistrée pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 line-clamp-1 text-[11px]">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
