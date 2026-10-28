import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Key, 
  Lock, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  FolderLock, 
  HelpCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { SshCredentials } from '../types/ssh';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (creds: SshCredentials) => void;
  onStartSandbox: () => void;
  initialCreds?: SshCredentials | null;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  onStartSandbox,
  initialCreds,
}) => {
  const [tab, setTab] = useState<'ssh' | 'sandbox'>('ssh');
  const [name, setName] = useState(initialCreds?.name || 'Mon Serveur VPS');
  const [host, setHost] = useState(initialCreds?.host || '');
  const [port, setPort] = useState(initialCreds?.port || 22);
  const [username, setUsername] = useState(initialCreds?.username || 'root');
  const [authType, setAuthType] = useState<'password' | 'privateKey'>(initialCreds?.authType || 'password');
  const [password, setPassword] = useState(initialCreds?.password || '');
  const [privateKey, setPrivateKey] = useState(initialCreds?.privateKey || '');
  const [passphrase, setPassphrase] = useState(initialCreds?.passphrase || '');
  const [saveLocally, setSaveLocally] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!host || !username) {
      setTestResult({ success: false, message: 'Veuillez saisir au moins l\'hôte IP et le nom d\'utilisateur.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ssh/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port,
          username,
          authType,
          password,
          privateKey,
          passphrase,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message || 'Connexion SSH établie avec succès !' });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Impossible de joindre le serveur. Vérifiez l\'adresse IP et le port 22.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Erreur réseau : ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'sandbox') {
      onStartSandbox();
      onClose();
      return;
    }

    if (!host.trim()) {
      alert('Veuillez spécifier l\'adresse IP ou le nom de domaine de votre VPS');
      return;
    }

    const creds: SshCredentials = {
      id: initialCreds?.id || `vps-${Date.now()}`,
      name: name.trim() || host,
      host: host.trim(),
      port: Number(port) || 22,
      username: username.trim() || 'root',
      authType,
      password: authType === 'password' ? password : undefined,
      privateKey: authType === 'privateKey' ? privateKey : undefined,
      passphrase: authType === 'privateKey' ? passphrase : undefined,
      createdAt: Date.now(),
    };

    if (saveLocally) {
      try {
        const stored = localStorage.getItem('vps_saved_servers');
        const list: SshCredentials[] = stored ? JSON.parse(stored) : [];
        const existingIdx = list.findIndex((s) => s.id === creds.id || (s.host === creds.host && s.username === creds.username));
        if (existingIdx >= 0) {
          list[existingIdx] = creds;
        } else {
          list.push(creds);
        }
        localStorage.setItem('vps_saved_servers', JSON.stringify(list));
      } catch (e) {
        // ignore localStorage error
      }
    }

    onConnect(creds);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPrivateKey(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131926]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Connexion au VPS SSH</h2>
              <p className="text-xs text-slate-400">Configurez vos accès pour piloter votre serveur distant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('ssh')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              tab === 'ssh'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mon VPS réel (SSH)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('sandbox')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              tab === 'sandbox'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bac à sable démo (Sans VPS)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {tab === 'sandbox' ? (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Mode Démo / Bac à sable Linux virtuel
                </div>
                <p>
                  Vous n'avez pas encore d'identifiants VPS ou vous souhaitez tester des commandes sans risque ?
                </p>
                <p>
                  Ce mode simule un serveur Ubuntu 24.04 complet avec Python, Node.js, PM2, Docker et Git déjà installés.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-200">Ce que vous pourrez tester :</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Lancer un script Python (<code className="text-emerald-400">python3 app.py</code>)</li>
                  <li>Lancer un serveur Node.js (<code className="text-emerald-400">node index.js</code>)</li>
                  <li>Faire tourner une tâche 24/7 avec <code className="text-emerald-400">pm2 start</code></li>
                  <li>Surveiller les ressources (<code className="text-emerald-400">htop, free -m, df -h</code>)</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onStartSandbox();
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-950/50 mt-4 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ouvrir le Bac à sable maintenant</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Server Name & Host */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-slate-300">Nom du serveur</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mon VPS"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Adresse IP ou Domaine <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="Ex: 51.159.23.42 ou vps.domaine.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Port & Username */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Port SSH</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Utilisateur <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="root ou ubuntu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Authentication Type Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-slate-300">Méthode d'authentification</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthType('password')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                      authType === 'password'
                        ? 'bg-slate-800 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('privateKey')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                      authType === 'privateKey'
                        ? 'bg-slate-800 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Clé privée SSH (.pem / RSA)
                  </button>
                </div>
              </div>

              {/* Password Input */}
              {authType === 'password' ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Mot de passe SSH</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Clé privée OpenSSH / RSA</label>
                    <label className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>Charger un fichier .pem / id_rsa</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" accept=".pem,.key,id_rsa,id_ed25519" />
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Passphrase de la clé (si chiffrée)</label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Local Storage checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <input
                  type="checkbox"
                  id="saveLocally"
                  checked={saveLocally}
                  onChange={(e) => setSaveLocally(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="saveLocally" className="cursor-pointer select-none">
                  Mémoriser ce serveur dans ce navigateur pour les prochaines fois
                </label>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-snug">{testResult.message}</div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !host}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Test en cours...</span>
                    </>
                  ) : (
                    <span>Tester la connexion</span>
                  )}
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-colors"
                >
                  <span>Connecter & Ouvrir</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
