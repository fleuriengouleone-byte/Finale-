import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Wifi,
  Radio,
  Send,
  Zap
} from 'lucide-react';

export const PublicAccessCard: React.FC = () => {
  const [publicUrl, setPublicUrl] = useState<string>(
    window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'https://ais-dev-lysdff6q7t7e3u6paibaqm-376987535874.europe-west2.run.app'
      : window.location.origin
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/public-info')
      .then((r) => r.json())
      .then((data) => {
        if (data.publicUrl) {
          setPublicUrl(data.publicUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestPing = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/public/webhook', { method: 'POST' });
      const data = await res.json();
      setTestResponse(data);
    } catch (e: any) {
      setTestResponse({ error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${publicUrl}/api/public/webhook`;

  return (
    <div className="space-y-6">
      {/* Main Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Votre Adresse Publique Google Cloud Run
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  En ligne sur Internet
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cette application est hébergée sur l'infrastructure Google Cloud Run avec une URL publique mondiale sécurisée HTTPS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Public URL Box */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Adresse Publique Accessible Partout dans le Monde (Sans Localhost)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Voici votre domaine public Google Run qui peut être partagé, appelé par des requêtes cURL, des webhooks Discord/Telegram ou ouvert sur n'importe quel appareil :
          </p>
        </div>

        {/* Public App URL */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">URL Publique de votre App</span>
            <div className="font-mono text-xs sm:text-sm text-sky-400 font-semibold truncate select-all">
              {publicUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(publicUrl, 'app_url')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedKey === 'app_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copier</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <span>Ouvrir</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Public Webhook Endpoint */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Point d'Accès API / Webhook Public (POST & GET)</span>
            <div className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold truncate select-all">
              {webhookUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(webhookUrl, 'webhook_url')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedKey === 'webhook_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copier</span>
            </button>
            <button
              onClick={handleTestPing}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tester le Ping Public</span>
            </button>
          </div>
        </div>

        {/* Ping Test Result */}
        {testResponse && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-xs font-mono">
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Réponse reçue du point public Google Cloud Run :</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto bg-black/40 p-2 rounded">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Solutions to get Public SSH addresses for free (Like in Google Cloud Shell & Labs) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Comment avoir une adresse SSH Publique Gratuite (Comme dans les Labs)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Pour exposer un serveur SSH ou un port local vers Internet avec une <strong className="text-white">adresse publique mondiale</strong> sans ouvrir de ports sur votre box et sans carte de crédit :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Tmate */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-sky-400 font-mono">1. TMATE (SSH Public Mondial en 1 ligne)</span>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">100% Gratuit</span>
            </div>
            <p className="text-xs text-slate-400">
              Transforme n'importe quelle session de terminal en adresse SSH publique accessible depuis n'importe où dans le monde.
            </p>
            <div className="p-2 bg-black/60 rounded font-mono text-[11px] text-emerald-400 flex items-center justify-between">
              <span>tmate -F</span>
              <button
                onClick={() => handleCopy('tmate -F', 'tmate')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'tmate' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Génère une adresse du type : <code className="text-slate-400">ssh random@lon1.tmate.io</code>
            </span>
          </div>

          {/* Cloudflare Tunnel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-400 font-mono">2. Cloudflare Tunnel (URL HTTPS Publique)</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">100% Gratuit</span>
            </div>
            <p className="text-xs text-slate-400">
              Expose n'importe quel port ou code web sur un domaine public mondial HTTPS sans carte de crédit.
            </p>
            <div className="p-2 bg-black/60 rounded font-mono text-[11px] text-emerald-400 flex items-center justify-between">
              <span>cloudflared tunnel --url http://localhost:3000</span>
              <button
                onClick={() => handleCopy('cloudflared tunnel --url http://localhost:3000', 'cloudflared')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'cloudflared' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Génère une URL publique mondiale : <code className="text-slate-400">https://xyz.trycloudflare.com</code>
            </span>
          </div>

          {/* Google Cloud Shell Web Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-400 font-mono">3. Google Cloud Shell (Aperçu Web)</span>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">Google Officiel</span>
            </div>
            <p className="text-xs text-slate-400">
              Dans <a href="https://shell.cloud.google.com" target="_blank" rel="noreferrer" className="text-purple-300 underline">Google Cloud Shell</a> (gratuit 50h/semaine avec Gmail), cliquez sur l'icône <strong>« Aperçu sur le web »</strong> en haut à droite.
            </p>
            <span className="text-[10px] text-slate-500 block">
              Génère une adresse publique Google Cloud Run / App Engine instantanée sur le port 8080 !
            </span>
          </div>

          {/* Localhost.run */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-400 font-mono">4. Localhost.run (SSH pur sans logiciel)</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">Aucune install</span>
            </div>
            <p className="text-xs text-slate-400">
              Aucun programme à installer, une simple commande SSH redirige votre code vers un domaine public :
            </p>
            <div className="p-2 bg-black/60 rounded font-mono text-[11px] text-emerald-400 flex items-center justify-between">
              <span>ssh -R 80:localhost:3000 nokey@localhost.run</span>
              <button
                onClick={() => handleCopy('ssh -R 80:localhost:3000 nokey@localhost.run', 'localhost_run')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'localhost_run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
