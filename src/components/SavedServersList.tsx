import React from 'react';
import { Server, Trash2, ArrowRight, ShieldCheck, Key, Plus } from 'lucide-react';
import { SshCredentials } from '../types/ssh';

interface SavedServersListProps {
  servers: SshCredentials[];
  activeServerId: string | undefined;
  onSelectServer: (server: SshCredentials) => void;
  onDeleteServer: (id: string) => void;
  onAddNew: () => void;
}

export const SavedServersList: React.FC<SavedServersListProps> = ({
  servers,
  activeServerId,
  onSelectServer,
  onDeleteServer,
  onAddNew,
}) => {
  if (servers.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200">Serveurs enregistrés ({servers.length})</h3>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un serveur</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {servers.map((srv) => {
          const isActive = srv.id === activeServerId;
          return (
            <div
              key={srv.id || srv.host}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <div
                onClick={() => onSelectServer(srv)}
                className="flex-1 cursor-pointer min-w-0 pr-2"
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span className="text-xs font-semibold text-white truncate">{srv.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {srv.username}@{srv.host}:{srv.port}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelectServer(srv)}
                  className="p-1.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Se connecter"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (srv.id && confirm(`Supprimer le serveur ${srv.name} ?`)) {
                      onDeleteServer(srv.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Supprimer des favoris"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
