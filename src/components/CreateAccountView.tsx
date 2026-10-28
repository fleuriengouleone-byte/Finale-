import React, { useState } from 'react';
import {
  UserPlus,
  RefreshCw,
  Key,
  Calendar,
  HardDrive,
  Server,
  ShieldCheck,
  Check,
  AlertCircle,
  Copy,
  Info,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { AccountProtocol, VlessAccount } from '../types/vless';
import { generateUUID, buildVlessLink, buildVmessLink } from '../utils/linkGenerators';

interface CreateAccountViewProps {
  onAccountCreated: (account: VlessAccount) => void;
  onCancel: () => void;
}

export const CreateAccountView: React.FC<CreateAccountViewProps> = ({
  onAccountCreated,
  onCancel,
}) => {
  const [clientName, setClientName] = useState('');
  const [protocol, setProtocol] = useState<AccountProtocol>('vless');
  const [uuid, setUuid] = useState(generateUUID());
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(30);
  const [customDays, setCustomDays] = useState(60);
  const [isUnlimitedQuota, setIsUnlimitedQuota] = useState(false);
  const [quotaGb, setQuotaGb] = useState(50);
  const [description, setDescription] = useState('');

  // Paramètres réels du moteur Cloud Run
  const [host, setHost] = useState('montre-635195440423.us-central1.run.app');
  const [port, setPort] = useState(443);
  const [transport, setTransport] = useState<'ws' | 'tcp'>('ws');
  const [wsPath, setWsPath] = useState('/Telegram/@AM2_D3/@AHMAD3214');
  const [security, setSecurity] = useState<'tls' | 'none'>('tls');
  const [sni, setSni] = useState('crashlyticsreports-pa.googleapis.com');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [vmessAlterId, setVmessAlterId] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSuccessAccount, setCreatedSuccessAccount] = useState<VlessAccount | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const effectiveDays = durationPreset === 'custom' ? customDays : durationPreset;
  const calculatedExpiration = new Date(Date.now() + effectiveDays * 86400000);

  const handleRegenerateUuid = () => {
    setUuid(generateUUID());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim()) {
      setError('Veuillez saisir un nom ou un identifiant de client.');
      return;
    }

    if (!uuid.trim()) {
      setError('Un identifiant UUID valide est obligatoire.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('vless_token');
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientName: clientName.trim(),
          protocol,
          customUuid: uuid.trim(),
          durationDays: effectiveDays,
          trafficQuotaGb: isUnlimitedQuota ? 0 : quotaGb,
          description: description.trim(),
          serverConfig: {
            host: host.trim(),
            port: Number(port),
            transport,
            wsPath: wsPath.trim(),
            security,
            sni: sni.trim(),
            fingerprint,
            vmessAlterId,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la création du compte');
      }

      setCreatedSuccessAccount(data.account);
      onAccountCreated(data.account);
    } catch (err: any) {
      setError(err.message || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  if (createdSuccessAccount) {
    const rawLink =
      createdSuccessAccount.protocol === 'vless'
        ? buildVlessLink(createdSuccessAccount)
        : buildVmessLink(createdSuccessAccount);

    const handleCopy = () => {
      navigator.clipboard.writeText(rawLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Compte créé avec succès !</h2>
          <p className="text-sm text-slate-400">
            Le compte <strong className="text-slate-200">{createdSuccessAccount.clientName}</strong> a été enregistré en base de données sécurisée.
          </p>
        </div>

        {/* Link presentation */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">
              Lien de connexion client ({createdSuccessAccount.protocol.toUpperCase()})
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Prêt à l'emploi</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 break-all select-all border border-slate-800">
            {rawLink}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copié dans le presse-papier !' : 'Copier le lien'}</span>
            </button>
            <button
              onClick={() => {
                setCreatedSuccessAccount(null);
                setClientName('');
                setUuid(generateUUID());
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors border border-slate-700"
            >
              Créer un autre compte
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Avertissement de sécurité :</strong> Ce lien contient un identifiant UUID privé. Ne le communiquez qu'au destinataire autorisé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 mb-1">
          <UserPlus className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">Créer un nouveau compte d'accès</h2>
        </div>
        <p className="text-xs text-slate-400">
          Générez un profil d'accès VLESS ou VMess cryptographiquement sécurisé pour vos utilisateurs.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil & Protocole */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Nom ou Identifiant du Client <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ex: Ahmed-Android, VIP-User-01"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Protocole Réseau</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProtocol('vless')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase border transition-all ${
                  protocol === 'vless'
                    ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-900/30'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                VLESS (Recommandé)
              </button>
              <button
                type="button"
                onClick={() => setProtocol('vmess')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase border transition-all ${
                  protocol === 'vmess'
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                VMess (Legacy)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: UUID Sécurisé */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Identifiant Unique (UUID v4)</span>
            </label>
            <button
              type="button"
              onClick={handleRegenerateUuid}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regénérer aléatoirement</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={uuid}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs select-all focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Généré automatiquement selon la norme RFC 4122 (cryptographiquement sûr).
          </p>
        </div>

        {/* Section 3: Durée & Expiration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Durée de validité</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
            {[1, 3, 7, 15, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDurationPreset(days)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  durationPreset === days
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {days} jour{days > 1 ? 's' : ''}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDurationPreset('custom')}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                durationPreset === 'custom'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
              Perso
            </button>
          </div>

          {durationPreset === 'custom' && (
            <div className="pt-2 flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
              <span className="text-xs text-slate-400">jours de validité</span>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Date et heure d'expiration :</span>
            <span className="text-amber-400 font-mono font-bold">
              {calculatedExpiration.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}{' '}
              à{' '}
              {calculatedExpiration.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Section 4: Quota de Trafic */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quota de trafic</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isUnlimitedQuota}
                onChange={(e) => setIsUnlimitedQuota(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="font-semibold text-cyan-400">Trafic Illimité</span>
            </label>
          </div>

          {!isUnlimitedQuota && (
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => setQuotaGb(gb)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    quotaGb === gb
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {gb} Go
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Paramètres Serveur réels du moteur */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paramètres du serveur Cloud Run (Réel)</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Protégé</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400">Nom d'hôte (Host)</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Port TLS</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Chemin WebSocket</label>
              <input
                type="text"
                value={wsPath}
                onChange={(e) => setWsPath(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">SNI / ServerName</label>
              <input
                type="text"
                value={sni}
                onChange={(e) => setSni(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Description / Note interne (optionnel)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex: Client mobile de confiance, renouvellement le 1er du mois"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-900/40 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Création et enregistrement...' : 'Créer et générer le lien'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
