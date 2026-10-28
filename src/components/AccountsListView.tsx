import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Check,
  QrCode,
  Eye,
  Calendar,
  Trash2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { VlessAccount, AccountStatus, AccountProtocol } from '../types/vless';
import {
  buildVlessLink,
  buildVmessLink,
  calculateRemainingDays,
} from '../utils/linkGenerators';
import { QrCodeModal } from './QrCodeModal';
import { AccountDetailsModal } from './AccountDetailsModal';
import { ExtendModal } from './ExtendModal';

interface AccountsListViewProps {
  accounts: VlessAccount[];
  initialStatusFilter?: string;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

export const AccountsListView: React.FC<AccountsListViewProps> = ({
  accounts,
  initialStatusFilter = 'all',
  onRefresh,
  onOpenCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'expiresAt' | 'clientName'>('createdAt');

  // Modals state
  const [selectedAccount, setSelectedAccount] = useState<VlessAccount | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [accountToExtend, setAccountToExtend] = useState<VlessAccount | null>(null);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; link: string; title: string; protocol: string }>({
    isOpen: false,
    link: '',
    title: '',
    protocol: '',
  });

  // Delete confirmation modal state
  const [accountToDelete, setAccountToDelete] = useState<VlessAccount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Quick feedback for copied links
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
    if (protocolFilter !== 'all' && acc.protocol !== protocolFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = acc.clientName.toLowerCase().includes(q);
      const matchId = acc.id.toLowerCase().includes(q);
      const matchDesc = acc.description && acc.description.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesc) return false;
    }
    return true;
  });

  // Sort
  filteredAccounts.sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'expiresAt') {
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }
    return a.clientName.localeCompare(b.clientName);
  });

  const handleCopyLink = (account: VlessAccount) => {
    const link =
      account.protocol === 'vless' ? buildVlessLink(account) : buildVmessLink(account);
    navigator.clipboard.writeText(link);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSuspend = async (account: VlessAccount) => {
    const isSuspended = account.status === 'suspended';
    const endpoint = isSuspended
      ? `/api/accounts/${account.id}/enable`
      : `/api/accounts/${account.id}/disable`;

    try {
      const token = localStorage.getItem('vless_token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Erreur lors du changement de statut');
      } else {
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('vless_token');
      const response = await fetch(`/api/accounts/${accountToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Erreur lors de la suppression');
      } else {
        setAccountToDelete(null);
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de client ou identifiant..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Compte</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Status filter buttons */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'active', label: 'Actifs' },
              { id: 'expired', label: 'Expirés' },
              { id: 'suspended', label: 'Suspendus' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Protocol filter & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium focus:outline-none"
            >
              <option value="all">Tous les protocoles</option>
              <option value="vless">VLESS uniquement</option>
              <option value="vmess">VMess uniquement</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium focus:outline-none"
            >
              <option value="createdAt">Plus récents</option>
              <option value="expiresAt">Expiration proche</option>
              <option value="clientName">Nom A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts List / Cards (Mobile optimized) */}
      {filteredAccounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">Aucun compte trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Aucun résultat ne correspond à vos filtres actuels.'
              : 'Commencez par créer votre premier compte VLESS ou VMess.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un compte</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAccounts.map((account) => {
            const remaining = calculateRemainingDays(account.expiresAt);
            const isVless = account.protocol === 'vless';

            return (
              <div
                key={account.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-md transition-all space-y-3"
              >
                {/* Header row: Client Name, Protocol, Status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-white">
                        {account.clientName}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full ${
                          isVless
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {account.protocol.toUpperCase()}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Mode Protégé
                      </span>
                    </div>
                    {account.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{account.description}</p>
                    )}
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                      account.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : account.status === 'expired'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {account.status === 'active'
                      ? 'Actif'
                      : account.status === 'expired'
                      ? 'Expiré'
                      : 'Suspendu'}
                  </span>
                </div>

                {/* Info Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Validité restante</span>
                    <span
                      className={`font-bold font-mono ${
                        remaining.isExpired
                          ? 'text-rose-400'
                          : remaining.days <= 3
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {remaining.label}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Quota Trafic</span>
                    <span className="font-bold text-slate-200">
                      {account.trafficQuotaGb === 0 ? 'Illimité' : `${account.trafficQuotaGb} Go`}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Échéance</span>
                    <span className="font-medium text-slate-300">
                      {new Date(account.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Transport & Port</span>
                    <span className="font-mono text-cyan-300">
                      {account.serverConfig.transport.toUpperCase()}:{account.serverConfig.port}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(account)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors active:scale-95"
                      title="Copier le lien complet"
                    >
                      {copiedId === account.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === account.id ? 'Copié !' : 'Copier lien'}</span>
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => {
                        const link =
                          account.protocol === 'vless'
                            ? buildVlessLink(account)
                            : buildVmessLink(account);
                        setQrModalData({
                          isOpen: true,
                          link,
                          title: account.clientName,
                          protocol: account.protocol,
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                      title="Afficher QR code pour Android"
                    >
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">QR Code</span>
                    </button>

                    {/* Details */}
                    <button
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsDetailsOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                      title="Voir configuration complète"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Détails</span>
                    </button>

                    {/* Prolonger */}
                    <button
                      onClick={() => {
                        setAccountToExtend(account);
                        setIsExtendOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium transition-colors"
                      title="Prolonger la durée"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Prolonger</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Suspend / Resume */}
                    <button
                      onClick={() => handleToggleSuspend(account)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        account.status === 'suspended'
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      }`}
                      title={account.status === 'suspended' ? 'Réactiver le compte' : 'Suspendre le compte'}
                    >
                      {account.status === 'suspended' ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : (
                        <PauseCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setAccountToDelete(account)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-500/40 p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Confirmer la suppression</h3>
              <p className="text-xs text-slate-400">
                Êtes-vous sûr de vouloir supprimer définitivement le compte{' '}
                <strong className="text-slate-200">{accountToDelete.clientName}</strong> ?
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 leading-relaxed">
              Cette action est irréversible et supprimera le compte de la base de données Firestore.
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      <ExtendModal
        account={accountToExtend}
        isOpen={isExtendOpen}
        onClose={() => {
          setIsExtendOpen(false);
          setAccountToExtend(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Account Details Modal */}
      <AccountDetailsModal
        account={selectedAccount}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAccount(null);
        }}
        onOpenQr={(link, title, protocol) => {
          setIsDetailsOpen(false);
          setQrModalData({ isOpen: true, link, title, protocol });
        }}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ ...qrModalData, isOpen: false })}
        title={qrModalData.title}
        linkText={qrModalData.link}
        protocol={qrModalData.protocol}
      />
    </div>
  );
};
