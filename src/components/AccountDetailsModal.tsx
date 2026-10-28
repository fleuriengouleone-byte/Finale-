import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  ShieldAlert,
  Server,
  Calendar,
  HardDrive,
  Key,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { VlessAccount } from '../types/vless';
import {
  buildVlessLink,
  buildVmessLink,
  buildClientJsonConfig,
  calculateRemainingDays,
} from '../utils/linkGenerators';

interface AccountDetailsModalProps {
  account: VlessAccount | null;
  onClose: () => void;
  onOpenQr: (link: string, title: string, protocol: string) => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  onClose,
  onOpenQr,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'json' | 'server'>('link');

  if (!account) return null;

  const rawLink =
    account.protocol === 'vless' ? buildVlessLink(account) : buildVmessLink(account);
  const jsonConfig = buildClientJsonConfig(account);
  const remaining = calculateRemainingDays(account.expiresAt);

  const copyToClipboard = (text: string, type: 'link' | 'json' | 'uuid') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === 'json') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase px-2 py-0.5 rounded font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {account.protocol.toUpperCase()}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">{account.clientName}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">ID: {account.id}</p>
          </div>
          <div className="text-right">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                account.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : account.status === 'expired'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {account.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Key stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Validité</span>
            <span className="font-bold text-amber-400">{remaining.label}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Quota Trafic</span>
            <span className="font-bold text-indigo-300">
              {account.trafficQuotaGb === 0 ? 'Illimité' : `${account.trafficQuotaGb} Go`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Créé le</span>
            <span className="font-medium text-slate-300">
              {new Date(account.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Expire le</span>
            <span className="font-medium text-slate-300">
              {new Date(account.expiresAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-1 text-xs">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'link'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lien Direct
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'json'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Configuration JSON
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'server'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Détails Serveur
          </button>
        </div>

        {/* Tab 1: Link & Actions */}
        {activeTab === 'link' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400">Lien {account.protocol.toUpperCase()} :</span>
                <span className="text-[11px] text-slate-500">v2rayNG / Sing-box / NekoBox</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-slate-200 break-all select-all border border-slate-800 max-h-32 overflow-y-auto">
                {rawLink}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => copyToClipboard(rawLink, 'link')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
              </button>
              <button
                onClick={() => onOpenQr(rawLink, account.clientName, account.protocol)}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Afficher QR Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Full JSON Config */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Configuration standard Xray / Sing-box :</span>
              <button
                onClick={() => copyToClipboard(jsonConfig, 'json')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copié !' : 'Copier JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64 border border-slate-800">
              {jsonConfig}
            </pre>
          </div>
        )}

        {/* Tab 3: Detailed Server Parameters */}
        {activeTab === 'server' && (
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Identifiant UUID :</span>
              <div className="flex items-center gap-1">
                <span className="text-cyan-300 font-mono text-[11px]">{account.uuid}</span>
                <button
                  onClick={() => copyToClipboard(account.uuid, 'uuid')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedUuid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Hôte (Cloud Run) :</span>
              <span className="text-slate-200 font-mono">{account.serverConfig.host}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Port :</span>
              <span className="text-slate-200 font-mono">{account.serverConfig.port}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Transport Réseau :</span>
              <span className="text-slate-200 font-mono">{account.serverConfig.transport.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Chemin WebSocket :</span>
              <span className="text-slate-200 font-mono">{account.serverConfig.wsPath}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Sécurité TLS :</span>
              <span className="text-emerald-400 font-mono">{account.serverConfig.security.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">SNI / ServerName :</span>
              <span className="text-slate-200 font-mono">{account.serverConfig.sni}</span>
            </div>
          </div>
        )}

        {/* Security Warning */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p>
            <strong>Sensibilité des données :</strong> Le lien et le JSON contiennent l'UUID privé du client.
            Ne diffusez jamais publiquement ce lien.
          </p>
        </div>
      </div>
    </div>
  );
};
