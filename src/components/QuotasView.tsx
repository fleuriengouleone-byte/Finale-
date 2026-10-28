import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  AlertCircle,
  TrendingUp,
  Infinity as InfinityIcon,
  PieChart,
  Edit2,
  Save,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import { VlessAccount } from '../types/vless';

interface QuotasViewProps {
  accounts: VlessAccount[];
  onRefresh: () => void;
}

export const QuotasView: React.FC<QuotasViewProps> = ({ accounts, onRefresh }) => {
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editQuotaValue, setEditQuotaValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const cappedAccounts = accounts.filter((a) => a.trafficQuotaGb > 0);
  const unlimitedAccounts = accounts.filter((a) => !a.trafficQuotaGb || a.trafficQuotaGb === 0);
  const totalAllocatedGb = cappedAccounts.reduce((acc, curr) => acc + curr.trafficQuotaGb, 0);

  const handleStartEdit = (account: VlessAccount) => {
    setEditingAccountId(account.id);
    setEditQuotaValue(account.trafficQuotaGb || 0);
  };

  const handleSaveQuota = async (accountId: string) => {
    setSaving(true);
    const token = localStorage.getItem('vless_token');
    try {
      const res = await fetch(`/api/quotas/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ trafficQuotaGb: editQuotaValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur mise à jour');
      }
      setEditingAccountId(null);
      setSuccessId(accountId);
      setTimeout(() => setSuccessId(null), 2500);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la sauvegarde du quota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                Gestion des Quotas de Données
              </h1>
              <p className="text-sm text-slate-400">
                Attribution des limites de bande passante par client (Go) et statut de mesure
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Disconnected Engine Reality Notice (CRITICAL REQUIREMENT) */}
      <div className="bg-amber-950/25 border border-amber-500/40 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Indisponible : moteur non connecté</span>
        </div>
        <p className="text-sm text-amber-200/90 leading-relaxed">
          Le service distant <span className="font-mono text-xs bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300">montre-635195440423.us-central1.run.app</span> exécute son conteneur de manière autonome sans exposer d'API gRPC StatsService ouverte.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Protection appliquée :</span>
            Aucune tentative d'intrusion ou de surcharge réseau n'est exécutée vers le service existant.
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Règle de gestion :</span>
            Les plafonds de quotas sont enregistrés en base. Si le quota d'un compte est atteint ou expiré, son statut bascule automatiquement sur <span className="text-rose-400 font-semibold">Expiré / Suspendu</span>.
          </div>
        </div>
      </div>

      {/* Quota Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Volume Quota Total Alloué</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {totalAllocatedGb} <span className="text-sm font-normal text-slate-400">Go</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Réparti sur {cappedAccounts.length} compte(s) avec limite
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Comptes avec Quota Limité</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {cappedAccounts.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Moyenne : {cappedAccounts.length > 0 ? (totalAllocatedGb / cappedAccounts.length).toFixed(1) : 0} Go / compte
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Comptes Illimités (0 Go)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            {unlimitedAccounts.length}
            <InfinityIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bande passante non bridée contractuellement
          </div>
        </div>
      </div>

      {/* Quota Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            Allocation des quotas par compte client
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {accounts.length} comptes au total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Protocole</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Quota Alloué</th>
                <th className="py-3 px-4">Consommation mesurée</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {accounts.map((account) => {
                const isEditing = editingAccountId === account.id;
                const isUnlimited = !account.trafficQuotaGb || account.trafficQuotaGb === 0;

                return (
                  <tr key={account.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-slate-100">
                      <div>{account.clientName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {account.uuid}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 uppercase">
                        {account.protocol}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          account.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : account.status === 'expired'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {account.status === 'active' ? 'Actif' : account.status === 'expired' ? 'Expiré' : 'Suspendu'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editQuotaValue}
                            onChange={(e) => setEditQuotaValue(parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
                          />
                          <span className="text-slate-400 text-xs font-sans">Go (0=Illimité)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-sans">
                          {isUnlimited ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                              <InfinityIcon className="w-3.5 h-3.5" />
                              Illimité
                            </span>
                          ) : (
                            <span className="font-bold text-slate-200">
                              {account.trafficQuotaGb} <span className="text-slate-400 font-normal">Go</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>Non mesurable (moteur non connecté)</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingAccountId(null)}
                            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleSaveQuota(account.id)}
                            disabled={saving}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            {saving ? '...' : 'Sauvegarder'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {successId === account.id && (
                            <span className="text-emerald-400 text-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Modifié
                            </span>
                          )}
                          <button
                            onClick={() => handleStartEdit(account)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1 ml-auto"
                          >
                            <Edit2 className="w-3 h-3 text-cyan-400" />
                            Modifier Quota
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
