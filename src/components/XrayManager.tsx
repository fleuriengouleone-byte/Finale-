import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Square, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  RefreshCw, 
  ExternalLink, 
  Globe, 
  Key, 
  Smartphone, 
  Monitor, 
  ArrowRight,
  Radio,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';

export const XrayManager: React.FC = () => {
  const [installed, setInstalled] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string>('e78d8a1c-3b95-46cb-8452-f47289b6b7a2');
  const [vlessLink, setVlessLink] = useState<string>('');
  const [hostDomain, setHostDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/xray/status');
      const data = await res.json();
      if (data.success) {
        setInstalled(data.installed);
        setRunning(data.running);
        setUuid(data.uuid);
        setVlessLink(data.vlessLink);
        setHostDomain(data.host);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleInstall = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/xray/install', { method: 'POST' });
      const data = await res.json();
      setMessage({ text: data.message, success: data.success });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ text: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/xray/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid }),
      });
      const data = await res.json();
      setMessage({ text: data.message, success: data.success });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ text: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch('/api/xray/stop', { method: 'POST' });
      await fetchStatus();
      setMessage({ text: 'Xray arrêté.', success: true });
    } catch (err: any) {
      setMessage({ text: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenUuid = async () => {
    try {
      const res = await fetch('/api/xray/uuid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.uuid) {
        setUuid(data.uuid);
        await fetchStatus();
      }
    } catch (e) {}
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Xray-core (VLESS / WebSocket) & Accès SSH sur Google Cloud Run
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  running
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {running ? 'Xray Actif sur Port 443' : 'Inactif'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Passez à travers les pare-feux en utilisant le protocole VLESS acheminé sur les WebSockets sécurisés de Google Cloud Run.
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          message.success ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Control Panel */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Contrôle du Serveur Xray</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Installez le binaire officiel Xray-core (Linux x86_64) et démarrez le service en 1 clic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!installed ? (
              <button
                onClick={handleInstall}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-colors"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Installer Xray-core (Linux 64)</span>
              </button>
            ) : !running ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Démarrer Xray sur Cloud Run</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Arrêter Xray</span>
              </button>
            )}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Protocole</span>
            <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">VLESS + WS + TLS</div>
            <span className="text-[10px] text-slate-500">Port public : 443 (HTTPS)</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Chemin WebSocket</span>
            <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">/vless</div>
            <span className="text-[10px] text-slate-500">Routé via Google Run</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Domaine Cloud Run</span>
            <div className="text-xs font-mono font-bold text-slate-200 mt-0.5 truncate">{hostDomain}</div>
            <span className="text-[10px] text-emerald-400">TLS géré par Google</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold">UUID Client</span>
              <button onClick={handleRegenUuid} className="text-[10px] text-amber-400 hover:underline">Générer</button>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5 truncate">{uuid}</div>
            <span className="text-[10px] text-slate-500">Identifiant secret</span>
          </div>
        </div>

        {/* Client Connection Link */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Lien de Connexion Client VLESS (Prêt à importer) :</span>
            </label>
            <span className="text-[11px] text-slate-400">v2rayN, v2rayNG, Shadowrocket, Nekoray</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
            <input
              type="text"
              readOnly
              value={vlessLink}
              className="flex-1 bg-transparent border-none font-mono text-xs text-sky-300 focus:outline-none select-all"
            />
            <button
              onClick={() => handleCopy(vlessLink, 'vless')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              {copiedKey === 'vless' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'vless' ? 'Copié !' : 'Copier le lien'}</span>
            </button>
          </div>
        </div>

        {/* How to import into clients */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Comment l'utiliser sur vos appareils :
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android (v2rayNG)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ouvrez v2rayNG $\rightarrow$ bouton <strong>+</strong> $\rightarrow$ <em>« Importer la configuration depuis le presse-papiers »</em>.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Windows (v2rayN / Nekoray)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ouvrez v2rayN $\rightarrow$ Appuyez sur <strong>Ctrl+V</strong> pour importer le lien copié.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>iOS (Shadowrocket)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ouvrez Shadowrocket, il détecte automatiquement le lien dans le presse-papiers et vous propose de l'ajouter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remote SSH via Tunnels (Tmate & Cloudflare) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Accès SSH Distant depuis votre PC (PuTTY / Terminal externe)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Google Cloud Run n'autorise que les flux HTTP/WebSocket sur le port 443 et bloque le port 22 entrant. Pour vous connecter avec PuTTY ou votre terminal depuis l'extérieur, utilisez **Tmate** qui crée un pont SSH sortant sécurisé :
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-white">Lancer un relais SSH instantané :</span>
            <button
              onClick={() => handleCopy('tmate -F', 'tmate_cmd')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
            >
              {copiedKey === 'tmate_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copier</span>
            </button>
          </div>

          <div className="p-2.5 bg-black/60 rounded-lg font-mono text-xs text-emerald-400 select-all">
            tmate -F
          </div>

          <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
            <p>1. Tapez simplement <code className="text-emerald-400 font-mono">tmate -F</code> dans l'onglet <strong>Terminal</strong>.</p>
            <p>2. Tmate vous affichera une commande SSH publique directe :</p>
            <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-sky-300">
              ssh aB91cd...24@lon1.tmate.io
            </div>
            <p>3. Collez cette commande dans votre terminal Windows, Linux, Mac ou PuTTY pour avoir le contrôle direct !</p>
          </div>
        </div>
      </div>
    </div>
  );
};
