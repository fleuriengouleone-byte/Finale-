import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { AuditLogEntry } from '../types/vless';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onRefresh }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchClient = log.clientName && log.clientName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      if (!matchDetails && !matchClient && !matchAction) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Journaux d'Activité & Traçabilité (Audit)</h2>
            </div>
            <p className="text-xs text-slate-400">
              Historique immuable des créations, modifications, expirations et connexions administratives.
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Security note: no secrets in logs */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Confidentialité garantie :</strong> Aucun identifiant UUID privé, mot de passe ou clé secrète n'est consigné dans ces journaux.
        </span>
      </div>

      {/* Filters */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans les journaux..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
        >
          <option value="all">Toutes les actions</option>
          <option value="ACCOUNT_CREATED">Création de compte</option>
          <option value="ACCOUNT_EXTENDED">Prolongation</option>
          <option value="ACCOUNT_SUSPENDED">Suspension</option>
          <option value="ACCOUNT_ACTIVATED">Réactivation</option>
          <option value="ACCOUNT_DELETED">Suppression</option>
          <option value="EXPIRY_CHECK_RUN">Vérification expiration</option>
          <option value="ADMIN_LOGIN">Connexion Admin</option>
        </select>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Aucun journal ne correspond à votre recherche.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => {
              const isSuccess = log.status === 'SUCCESS';
              const isWarning = log.status === 'WARNING';

              return (
                <div key={log.id} className="p-3.5 sm:p-4 hover:bg-slate-800/40 transition-colors text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuccess ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {log.action}
                      </span>
                      {log.clientName && (
                        <span className="font-semibold text-cyan-300">
                          {log.clientName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {log.ip && <span className="font-mono text-slate-400">{log.ip}</span>}
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 pl-4 text-xs leading-relaxed">{log.details}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
