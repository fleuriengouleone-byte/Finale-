import React from 'react';
import {
  BarChart3,
  PieChart,
  HardDrive,
  Users,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Activity,
  CheckCircle,
  Info,
} from 'lucide-react';
import { VlessAccount, DashboardMetrics } from '../types/vless';
import { calculateRemainingDays } from '../utils/linkGenerators';

interface StatisticsViewProps {
  metrics: DashboardMetrics | null;
  accounts: VlessAccount[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  metrics,
  accounts,
}) => {
  const total = accounts.length;
  const vlessCount = accounts.filter((a) => a.protocol === 'vless').length;
  const vmessCount = accounts.filter((a) => a.protocol === 'vmess').length;
  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const expiredCount = accounts.filter((a) => a.status === 'expired').length;
  const suspendedCount = accounts.filter((a) => a.status === 'suspended').length;

  const unlimitedQuotaCount = accounts.filter((a) => a.trafficQuotaGb === 0).length;
  const limitedQuotaCount = accounts.filter((a) => a.trafficQuotaGb > 0).length;

  // Calculer l'échéance par tranche
  const now = Date.now();
  const expiring7d = accounts.filter((a) => {
    if (a.status !== 'active') return false;
    const diff = new Date(a.expiresAt).getTime() - now;
    return diff > 0 && diff <= 7 * 86400000;
  }).length;

  const expiring30d = accounts.filter((a) => {
    if (a.status !== 'active') return false;
    const diff = new Date(a.expiresAt).getTime() - now;
    return diff > 7 * 86400000 && diff <= 30 * 86400000;
  }).length;

  const expiringMore30d = accounts.filter((a) => {
    if (a.status !== 'active') return false;
    const diff = new Date(a.expiresAt).getTime() - now;
    return diff > 30 * 86400000;
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-cyan-400 mb-1">
          <BarChart3 className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">Statistiques & Répartition des Comptes</h2>
        </div>
        <p className="text-xs text-slate-400">
          Analyse globale des protocoles, statuts d'activité et politiques de quotas configurés.
        </p>
      </div>

      {/* Protocol & Status Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protocol Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Répartition par Protocole</span>
            </h3>
            <span className="text-xs text-slate-400">{total} comptes au total</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* VLESS bar */}
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span className="font-semibold text-cyan-400">VLESS</span>
                <span className="font-mono">
                  {vlessCount} ({total > 0 ? Math.round((vlessCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${total > 0 ? (vlessCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* VMess bar */}
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span className="font-semibold text-indigo-400">VMess</span>
                <span className="font-mono">
                  {vmessCount} ({total > 0 ? Math.round((vmessCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${total > 0 ? (vmessCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Répartition par Statut</span>
            </h3>
            <span className="text-xs text-slate-400">{activeCount} actifs</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Actifs */}
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span className="font-semibold text-emerald-400">Actifs</span>
                <span className="font-mono">
                  {activeCount} ({total > 0 ? Math.round((activeCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${total > 0 ? (activeCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Expirés */}
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span className="font-semibold text-rose-400">Expirés</span>
                <span className="font-mono">
                  {expiredCount} ({total > 0 ? Math.round((expiredCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${total > 0 ? (expiredCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Suspendus */}
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span className="font-semibold text-amber-400">Suspendus</span>
                <span className="font-mono">
                  {suspendedCount} ({total > 0 ? Math.round((suspendedCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${total > 0 ? (suspendedCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Timeline Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Échéancier des Comptes Actifs</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-semibold block">Expiration sous 7 jours</span>
            <div className="text-xl font-black text-white mt-1">{expiring7d}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">À renouveler rapidement</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-blue-400 font-semibold block">Expiration sous 8 à 30 jours</span>
            <div className="text-xl font-black text-white mt-1">{expiring30d}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Validité intermédiaire stable</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-emerald-400 font-semibold block">Expiration à plus de 30 jours</span>
            <div className="text-xl font-black text-white mt-1">{expiringMore30d}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Abonnements longue durée</p>
          </div>
        </div>
      </div>

      {/* Traffic Monitoring Transparent Explanation */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <HardDrive className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Gestion de la Consommation Réseau</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Comptes avec Quota Limité :</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">{limitedQuotaCount}</span>
            <span className="text-[10px] text-slate-500">Seuils enregistrés en base</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Comptes en Trafic Illimité :</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5 block">{unlimitedQuotaCount}</span>
            <span className="text-[10px] text-slate-500">Pas de plafond contractuel</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>Note technique de transparence (Sections 6 & 11) :</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Le service Cloud Run distant cible (<code className="text-slate-300">montre-635195440423.us-central1.run.app</code>) fonctionne en mode passerelle WebSocket isolée. Google Cloud Run n'expose qu'un unique port HTTP/WebSocket public et ne permet pas d'interroger directement les compteurs gRPC Xray sous-jacents sans déployer un agent dédié. Par conséquent, les statistiques réseau en direct sont rigoureusement affichées comme « Non disponible » pour éviter toute désinformation.
          </p>
        </div>
      </div>
    </div>
  );
};
