import React, { useState, useEffect } from 'react';
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Copy,
  ExternalLink,
  Save,
  Check,
  Code2,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ConnectionProfile } from '../types/vless';

interface ConnectionProfilesViewProps {
  onSelectDefaultProfile?: (profile: ConnectionProfile) => void;
}

export const ConnectionProfilesView: React.FC<ConnectionProfilesViewProps> = () => {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Partial<ConnectionProfile>>({
    name: '',
    protocol: 'vless',
    address: '192.179.18.100',
    host: 'montre-635195440423.us-central1.run.app',
    port: 443,
    transport: 'ws',
    wsPath: '/Telegram/@AM2_D3/@AHMAD3214',
    security: 'tls',
    sni: 'crashlyticsreports-pa.googleapis.com',
    fingerprint: 'chrome',
    remarks: '',
  });
  const [syntaxFeedback, setSyntaxFeedback] = useState<{
    tested: boolean;
    valid?: boolean;
    summary?: string;
  }>({ tested: false });
  const [saving, setSaving] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error('Erreur chargement profils:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleTestSyntax = async () => {
    try {
      const res = await fetch('/api/profiles/test-syntax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile),
      });
      const data = await res.json();
      setSyntaxFeedback({
        tested: true,
        valid: data.valid,
        summary: data.summary,
      });
    } catch (e: any) {
      setSyntaxFeedback({
        tested: true,
        valid: false,
        summary: e.message || 'Erreur lors du test de syntaxe',
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('vless_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      let res;
      if (currentProfile.id) {
        res = await fetch(`/api/profiles/${currentProfile.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(currentProfile),
        });
      } else {
        res = await fetch('/api/profiles', {
          method: 'POST',
          headers,
          body: JSON.stringify(currentProfile),
        });
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde du profil');
      }
      setIsEditing(false);
      setSyntaxFeedback({ tested: false });
      await fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = localStorage.getItem('vless_token');
    try {
      const res = await fetch(`/api/profiles/${id}/set-default`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        await fetchProfiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce profil ?')) return;
    const token = localStorage.getItem('vless_token');
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Impossible de supprimer');
        return;
      }
      await fetchProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                Profils de connexion
              </h1>
              <p className="text-sm text-slate-400">
                Gestion des modèles de routage réseau, adresses passerelles, chemins WebSocket et paramètres TLS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfiles}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={() => {
              setCurrentProfile({
                name: 'Nouveau profil personnalisé',
                protocol: 'vless',
                address: '192.179.18.100',
                host: 'montre-635195440423.us-central1.run.app',
                port: 443,
                transport: 'ws',
                wsPath: '/Telegram/@AM2_D3/@AHMAD3214',
                security: 'tls',
                sni: 'crashlyticsreports-pa.googleapis.com',
                fingerprint: 'chrome',
                remarks: '',
              });
              setSyntaxFeedback({ tested: false });
              setIsEditing(true);
            }}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-900/30"
          >
            <Plus className="w-4 h-4" />
            Ajouter un profil
          </button>
        </div>
      </div>

      {/* Notice about Reference Profile */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-300 block mb-1">
            Garantie de non-altération du service distant :
          </span>
          Le profil étiqueté <span className="font-mono bg-amber-900/40 px-1 py-0.5 rounded text-amber-300">Profil de référence non vérifié</span> contient les valeurs issues de la configuration Docker d'origine (<span className="font-mono">montre-635195440423.us-central1.run.app</span>). Ces valeurs servent à calibrer la génération des liens clients sans jamais solliciter d'API d'écriture sur le conteneur distant.
        </div>
      </div>

      {/* Edit or Create Profile Modal / Section */}
      {isEditing && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              {currentProfile.id ? 'Modifier le profil' : 'Créer un nouveau profil de connexion'}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Nom du profil
                </label>
                <input
                  type="text"
                  required
                  value={currentProfile.name || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
                  placeholder="Ex: Cloud Run Principal"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Protocole
                </label>
                <select
                  value={currentProfile.protocol || 'vless'}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, protocol: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="vless">VLESS</option>
                  <option value="vmess">VMess</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Port
                </label>
                <input
                  type="number"
                  required
                  value={currentProfile.port || 443}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, port: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Adresse de connexion (IP / Domaine)
                </label>
                <input
                  type="text"
                  required
                  value={currentProfile.address || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, address: e.target.value })}
                  placeholder="Ex: 192.179.18.100 ou montre-*.run.app"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  En-tête Host (Cloud Run)
                </label>
                <input
                  type="text"
                  required
                  value={currentProfile.host || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, host: e.target.value })}
                  placeholder="montre-635195440423.us-central1.run.app"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Chemin WebSocket (wsPath)
                </label>
                <input
                  type="text"
                  required
                  value={currentProfile.wsPath || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, wsPath: e.target.value })}
                  placeholder="/Telegram/@AM2_D3/@AHMAD3214"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Sécurité TLS
                </label>
                <select
                  value={currentProfile.security || 'tls'}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, security: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="tls">TLS (chiffrement standard 443)</option>
                  <option value="none">Aucun (texte brut)</option>
                  <option value="reality">Reality</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  SNI (Server Name Indication)
                </label>
                <input
                  type="text"
                  value={currentProfile.sni || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, sni: e.target.value })}
                  placeholder="crashlyticsreports-pa.googleapis.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                  Empreinte TLS (Fingerprint)
                </label>
                <input
                  type="text"
                  value={currentProfile.fingerprint || 'chrome'}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, fingerprint: e.target.value })}
                  placeholder="chrome"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">
                Remarques / Notes techniques
              </label>
              <textarea
                rows={2}
                value={currentProfile.remarks || ''}
                onChange={(e) => setCurrentProfile({ ...currentProfile, remarks: e.target.value })}
                placeholder="Notes sur la configuration..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Syntax feedback */}
            {syntaxFeedback.tested && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  syntaxFeedback.valid
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                }`}
              >
                {syntaxFeedback.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{syntaxFeedback.summary}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestSyntax}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                Vérifier la syntaxe
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-900/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Enregistrer le profil'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Profiles list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
          Chargement des profils de connexion...
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
          Aucun profil de connexion configuré.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all relative ${
                profile.isDefault
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-100">{profile.name}</h3>
                    {profile.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Défaut
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        profile.statusLabel.includes('non vérifié')
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {profile.statusLabel}
                    </span>
                  </div>
                  {profile.remarks && (
                    <p className="text-xs text-slate-400 leading-relaxed">{profile.remarks}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!profile.isDefault && (
                    <button
                      onClick={() => handleSetDefault(profile.id)}
                      title="Définir comme profil par défaut"
                      className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      Activer par défaut
                    </button>
                  )}
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 font-mono text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      Protocole / Transport
                    </span>
                    <span className="text-cyan-400 font-semibold uppercase">{profile.protocol}</span>{' '}
                    + <span className="text-slate-300 uppercase">{profile.transport}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      Port / Sécurité
                    </span>
                    <span className="text-slate-200">{profile.port}</span> /{' '}
                    <span className="text-emerald-400 uppercase">{profile.security}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-2">
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">
                    Adresse IP sortante
                  </span>
                  <span className="text-slate-200 break-all">{profile.address}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">
                    En-tête Host (Domaine Cloud Run)
                  </span>
                  <span className="text-blue-300 break-all">{profile.host}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">
                    Chemin WebSocket (wsPath)
                  </span>
                  <span className="text-amber-300 break-all">{profile.wsPath}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      SNI
                    </span>
                    <span className="text-slate-300 truncate block">{profile.sni}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      Fingerprint
                    </span>
                    <span className="text-slate-300">{profile.fingerprint}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setCurrentProfile(profile);
                    setSyntaxFeedback({ tested: false });
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Modifier ce profil
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(profile, null, 2),
                        profile.id
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                    title="Copier configuration JSON"
                  >
                    {copiedId === profile.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {!profile.isDefault && (
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Supprimer ce profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
