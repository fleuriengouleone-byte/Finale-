import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Copy, 
  Check, 
  QrCode, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Database, 
  Wifi, 
  ExternalLink, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Search, 
  Edit3, 
  PauseCircle, 
  PlayCircle, 
  Activity,
  Server,
  Download,
  X
} from 'lucide-react';
import QRCode from 'qrcode';

export interface VpsUser {
  id: string;
  name: string;
  uuid: string;
  quotaMb: number; // 0 = unlimited
  usedMb: number;
  expiresAt: string;
  status: 'active' | 'suspended' | 'expired' | 'quota_exceeded';
  createdAt: string;
  lastActive?: string;
  protocol: 'vless';
  notes?: string;
  vlessLink: string;
}

export interface VpsConfig {
  targetUrl: string;
  host: string;
  port: number;
  wsPath: string;
  security: string;
  serverName: string;
  fingerprint: string;
  serviceName: string;
  cloudRegion: string;
}

export function VpsUserManager() {
  const [users, setUsers] = useState<VpsUser[]>([]);
  const [config, setConfig] = useState<VpsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'quota_exceeded' | 'suspended'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VpsUser | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Form states
  const [userName, setUserName] = useState('');
  const [userUuid, setUserUuid] = useState('');
  const [userQuotaType, setUserQuotaType] = useState<'5gb' | '10gb' | '20gb' | '50gb' | 'unlimited' | 'custom'>('10gb');
  const [customQuotaMb, setCustomQuotaMb] = useState<number>(10240);
  const [expiresDays, setExpiresDays] = useState(30);
  const [userNotes, setUserNotes] = useState('');

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndConfig();
  }, []);

  const fetchUsersAndConfig = async () => {
    try {
      setLoading(true);
      const [cfgRes, usersRes] = await Promise.all([
        fetch('/api/vps/config'),
        fetch('/api/vps/users'),
      ]);

      const cfgData = await cfgRes.json();
      const usersData = await usersRes.json();

      if (cfgData.success) {
        setConfig(cfgData.config);
      }
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    let quotaVal = 10240;
    if (userQuotaType === '5gb') quotaVal = 5120;
    else if (userQuotaType === '10gb') quotaVal = 10240;
    else if (userQuotaType === '20gb') quotaVal = 20480;
    else if (userQuotaType === '50gb') quotaVal = 51200;
    else if (userQuotaType === 'unlimited') quotaVal = 0;
    else if (userQuotaType === 'custom') quotaVal = Number(customQuotaMb) || 0;

    try {
      const res = await fetch('/api/vps/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          uuid: userUuid,
          quotaMb: quotaVal,
          expiresDays,
          notes: userNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setUserName('');
        setUserUuid('');
        setUserNotes('');
        await fetchUsersAndConfig();
      } else {
        alert(data.error || 'Erreur de création');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCopyLink = async (user: VpsUser) => {
    try {
      await navigator.clipboard.writeText(user.vlessLink);
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenQr = async (user: VpsUser) => {
    setSelectedUser(user);
    try {
      const url = await QRCode.toDataURL(user.vlessLink, {
        width: 340,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
      setIsQrModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetQuota = async (id: string) => {
    if (!confirm('Réinitialiser le quota consommé par cet utilisateur à 0 Mo ?')) return;
    try {
      const res = await fetch(`/api/vps/users/${id}/reset-quota`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === id ? data.user : u)));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSimulateTraffic = async (id: string, amountMb: number) => {
    try {
      const res = await fetch(`/api/vps/users/${id}/simulate-traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMb }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === id ? data.user : u)));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (user: VpsUser) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/vps/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === user.id ? data.user : u)));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'utilisateur "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/vps/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== id));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.uuid.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && u.status === statusFilter;
  });

  const totalUsedMb = users.reduce((acc, u) => acc + (u.usedMb || 0), 0);
  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Target VPS Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                VPS Cloud Run Connecté
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Port 443 TLS (WSS)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                us-central1
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{config?.serviceName || 'montre'}</span>
              <span className="text-slate-500 text-base font-normal">· Corps & Squelette VPS</span>
            </h2>

            <p className="text-sm text-slate-300 font-mono break-all flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{config?.targetUrl || 'https://montre-635195440423.us-central1.run.app'}</span>
            </p>

            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <span>Path WebSocket : <strong className="text-slate-200 font-mono">{config?.wsPath || '/Telegram/@AM2_D3/@AHMAD3214'}</strong></span>
              <span>Protocole : <strong className="text-blue-400 font-mono">VLESS + WebSocket + TLS</strong></span>
              <span>Sécurité SNI : <strong className="text-emerald-400 font-mono">{config?.serverName}</strong></span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Utilisateurs VPS</div>
              <div className="text-xl font-bold text-white mt-0.5">
                {activeCount} <span className="text-xs font-normal text-slate-500">/ {users.length}</span>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Trafic Consommé</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {(totalUsedMb / 1024).toFixed(2)} <span className="text-xs font-normal text-slate-400">Go</span>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">Statut Quota</div>
              <div className="text-xl font-bold text-blue-400 mt-0.5">
                100% <span className="text-xs font-normal text-slate-400">Actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add User Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom ou UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['all', 'active', 'quota_exceeded', 'suspended'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' && 'Tous'}
                {filter === 'active' && 'Actifs'}
                {filter === 'quota_exceeded' && 'Quota Épuisé'}
                {filter === 'suspended' && 'Suspendus'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setUserUuid(crypto.randomUUID());
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Créer un Utilisateur VPS</span>
        </button>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isUnlimited = user.quotaMb === 0;
          const quotaPercent = isUnlimited ? 0 : Math.min(100, (user.usedMb / user.quotaMb) * 100);
          const isNearlyFull = quotaPercent >= 90;
          const isExceeded = user.status === 'quota_exceeded' || (!isUnlimited && user.usedMb >= user.quotaMb);

          return (
            <div
              key={user.id}
              className={`relative flex flex-col justify-between rounded-2xl bg-slate-900/90 border transition-all hover:shadow-lg ${
                isExceeded
                  ? 'border-amber-500/40 shadow-amber-500/5'
                  : user.status === 'suspended'
                  ? 'border-slate-800 opacity-70'
                  : 'border-slate-800 hover:border-blue-500/50 shadow-slate-950/40'
              } p-4 sm:p-5`}
            >
              {/* Top Row: User Name & Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base tracking-tight">{user.name}</h3>
                      {user.status === 'active' && !isExceeded && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Actif
                        </span>
                      )}
                      {isExceeded && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Quota Épuisé
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                          Suspendu
                        </span>
                      )}
                    </div>
                    {user.notes && (
                      <p className="text-xs text-slate-400 italic line-clamp-1">{user.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      title={user.status === 'suspended' ? 'Activer' : 'Suspendre'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {user.status === 'suspended' ? (
                        <PlayCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <PauseCircle className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* UUID Box */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 truncate">{user.uuid}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.uuid);
                      setCopiedId(`uuid-${user.id}`);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    title="Copier UUID"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                  >
                    {copiedId === `uuid-${user.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Quota Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      Consommation
                    </span>
                    <span className="font-mono text-slate-200">
                      <strong>{(user.usedMb < 1024 ? `${user.usedMb.toFixed(1)} Mo` : `${(user.usedMb / 1024).toFixed(2)} Go`)}</strong>
                      <span className="text-slate-500"> / </span>
                      {isUnlimited ? (
                        <span className="text-purple-400 font-semibold">Illimité</span>
                      ) : (
                        <span>{user.quotaMb >= 1024 ? `${(user.quotaMb / 1024).toFixed(0)} Go` : `${user.quotaMb} Mo`}</span>
                      )}
                    </span>
                  </div>

                  {!isUnlimited ? (
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/60">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isNearlyFull
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-emerald-500/40"></div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Expire : {new Date(user.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button
                      onClick={() => handleResetQuota(user.id)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset quota
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyLink(user)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    copiedId === user.id
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {copiedId === user.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Lien VLESS</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenQr(user)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>QR Code</span>
                </button>

                {/* Simulate test traffic */}
                <button
                  onClick={() => handleSimulateTraffic(user.id, 250)}
                  className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                >
                  <Activity className="w-3 h-3 text-slate-500" />
                  <span>Tester le compteur (+250 Mo de trafic simulé)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">Aucun utilisateur trouvé</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Créez votre premier utilisateur VPS pour lui générer un lien VLESS personnalisé avec quota et validité.
          </p>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Nouveau Client VPS Cloud Run</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nom ou Identifiant du Client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ahmed VIP Client, Youssef-4G..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">UUID VLESS Client</label>
                  <button
                    type="button"
                    onClick={() => setUserUuid(crypto.randomUUID())}
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Régénérer aléatoire
                  </button>
                </div>
                <input
                  type="text"
                  value={userUuid}
                  onChange={(e) => setUserUuid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Limite de Quota de Données
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '5gb', label: '5 Go' },
                    { id: '10gb', label: '10 Go' },
                    { id: '20gb', label: '20 Go' },
                    { id: '50gb', label: '50 Go' },
                    { id: 'unlimited', label: 'Illimité ∞' },
                    { id: 'custom', label: 'Personnalisé' },
                  ].map((q) => (
                    <button
                      type="button"
                      key={q.id}
                      onClick={() => setUserQuotaType(q.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        userQuotaType === q.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {userQuotaType === 'custom' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="number"
                      min="100"
                      step="100"
                      placeholder="Quota en Mo"
                      value={customQuotaMb}
                      onChange={(e) => setCustomQuotaMb(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <span className="text-xs text-slate-400 font-mono">Mo</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Durée de Validité
                  </label>
                  <select
                    value={expiresDays}
                    onChange={(e) => setExpiresDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value={7}>7 Jours (Essai)</option>
                    <option value={15}>15 Jours</option>
                    <option value={30}>30 Jours (1 Mois)</option>
                    <option value={90}>90 Jours (3 Mois)</option>
                    <option value={365}>365 Jours (1 An)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Serveur Hôte
                  </label>
                  <input
                    type="text"
                    disabled
                    value={config?.host || 'montre-635195440423.us-central1.run.app'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Notes / Remarques (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Client WhatsApp +225..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  Générer l'Accès & Lien VLESS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE & VLESS LINK VIEWER */}
      {isQrModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Scanner le profil VLESS</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-white text-lg">{selectedUser.name}</h4>
              <p className="text-xs text-slate-400">
                Scannez avec <strong className="text-slate-200">v2rayNG</strong> (Android), <strong className="text-slate-200">NekoBox</strong>, ou <strong className="text-slate-200">Shadowrocket</strong>
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="flex justify-center p-4 rounded-2xl bg-white shadow-inner max-w-[260px] mx-auto">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code pour ${selectedUser.name}`}
                  className="w-full h-auto rounded"
                />
              )}
            </div>

            {/* Raw Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Lien VLESS Complet :</label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 break-all font-mono text-[11px] text-blue-300 max-h-24 overflow-y-auto">
                {selectedUser.vlessLink}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyLink(selectedUser)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20"
              >
                <Copy className="w-4 h-4" />
                <span>Copier le Lien</span>
              </button>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
