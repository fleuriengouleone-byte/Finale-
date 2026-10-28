import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Terminal, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  HelpCircle,
  FileCode,
  CornerDownLeft,
  RefreshCw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { ansiToHtml } from '../utils/ansi';

interface LogEntry {
  time: string;
  type: 'stdout' | 'stderr' | 'system';
  text: string;
}

export const FreeCodeRunner: React.FC = () => {
  const [language, setLanguage] = useState<'python' | 'node' | 'bash'>('python');
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(120); // 2 hours by default
  const [code, setCode] = useState<string>(`# Exemple : Script Python qui tourne et affiche des tâches en direct
import time
import datetime

print(f"🚀 Démarrage du script Python à {datetime.datetime.now().strftime('%H:%M:%S')}")
print("Mode 100% gratuit activé (sans carte bancaire ni VPS nécessaire)")
print("Durée allouée : jusqu'à 2 heures d'exécution continue")
print("-" * 50)

for i in range(1, 21):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Traitement étape #{i}/20 en cours...")
    time.sleep(2)

print("✔ Tâche terminée avec succès !")
`);

  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const [showEnv, setShowEnv] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed' | 'stopped'>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Template presets
  const templates: Record<string, { label: string; lang: 'python' | 'node' | 'bash'; code: string }> = {
    python_loop: {
      label: '🐍 Python - Boucle & Traitement (2h)',
      lang: 'python',
      code: `import time
import datetime

print("🚀 Script Python démarré en tâche continue")
for step in range(1, 61):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] ⚙️ Exécution tâche #{step} - Système opérationnel...")
    time.sleep(3)
`,
    },
    python_scraper: {
      label: '🐍 Python - Requête Web & Données',
      lang: 'python',
      code: `import urllib.request
import json
import time

print("🌐 Test de récupération de données réseau...")
try:
    req = urllib.request.Request("https://api.github.com/zen", headers={'User-Agent': 'Python'})
    with urllib.request.urlopen(req) as response:
        quote = response.read().decode('utf-8')
        print(f"💡 Citation du jour reçue : \"{quote}\"")
except Exception as e:
    print(f"Erreur : {e}")

print("Traitement terminé.")
`,
    },
    node_server: {
      label: '⚡ Node.js - Serveur HTTP & Timer',
      lang: 'node',
      code: `const http = require('http');

console.log("🚀 Application Node.js démarrée !");
console.log("Exécution directe sur le serveur sans carte de crédit.");

let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(\`[\${new Date().toLocaleTimeString()}] Tâche périodique #\${count} active\`);
  if (count >= 30) {
    console.log("✔ Démo terminée !");
    clearInterval(interval);
  }
}, 2000);
`,
    },
    bash_script: {
      label: '💻 Bash - Commandes système & Tests',
      lang: 'bash',
      code: `echo "=== ENVIRONNEMENT LINUX ==="
echo "Utilisateur : $(whoami)"
echo "Noyau : $(uname -srm)"
echo "Date : $(date)"
echo "Espace disque :"
df -h /
echo "Mémoire :"
free -m
echo "=== FIN DES INFORMATIONS ==="
`,
    },
  };

  const handleSelectTemplate = (key: string) => {
    const tpl = templates[key];
    if (tpl) {
      setLanguage(tpl.lang);
      setCode(tpl.code);
    }
  };

  // Timer counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running' && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Start execution
  const handleStart = async () => {
    if (!code.trim()) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus('running');
    setLogs([]);
    setStartTime(Date.now());
    setElapsedSeconds(0);

    const envMap: Record<string, string> = {};
    envVars.forEach((ev) => {
      if (ev.key.trim()) envMap[ev.key.trim()] = ev.value;
    });

    try {
      const res = await fetch('/api/runner/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          env: envMap,
          timeoutMinutes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setStatus('failed');
        setLogs([
          {
            time: new Date().toLocaleTimeString(),
            type: 'stderr',
            text: `Échec du démarrage : ${data.error || 'Erreur inconnue'}`,
          },
        ]);
        return;
      }

      setJobId(data.jobId);

      // Connect to SSE stream
      const sse = new EventSource(`/api/runner/stream/${data.jobId}`);
      eventSourceRef.current = sse;

      sse.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'history') {
            setLogs(parsed.logs || []);
            if (parsed.status && parsed.status !== 'running') {
              setStatus(parsed.status);
              sse.close();
            }
          } else if (parsed.type === 'log') {
            if (parsed.entry) {
              setLogs((prev) => [...prev, parsed.entry]);
            }
            if (parsed.status && parsed.status !== 'running') {
              setStatus(parsed.status);
              sse.close();
            }
          }
        } catch (err) {
          // ignore
        }
      };

      sse.onerror = () => {
        sse.close();
      };
    } catch (err: any) {
      setStatus('failed');
      setLogs([
        {
          time: new Date().toLocaleTimeString(),
          type: 'stderr',
          text: `Erreur réseau : ${err.message}`,
        },
      ]);
    }
  };

  // Stop execution
  const handleStop = async () => {
    if (!jobId) return;

    try {
      await fetch(`/api/runner/stop/${jobId}`, { method: 'POST' });
      setStatus('stopped');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch (e) {
      // ignore
    }
  };

  // Send input to stdin
  const handleSendInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !inputVal.trim() || status !== 'running') return;

    try {
      await fetch(`/api/runner/input/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputVal }),
      });
      setInputVal('');
    } catch (e) {}
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `execution-log-${language}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? `${h}h ` : ''}${m % 60}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-5">
      {/* Solution Banner for user without credit card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Exécuteur Direct 100% Gratuit (Sans Carte de Crédit & Sans VPS)
              </h2>
              <p className="text-xs text-slate-300">
                Vous n'avez pas de carte bancaire ? Vous pouvez lancer votre code <strong className="text-white">directement ici jusqu'à 2 heures d'affilée</strong>.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            0€ · Aucune CB requise
          </span>
        </div>
      </div>

      {/* Editor & Console Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Side: Code Editor */}
        <div className="flex flex-col bg-[#0d121c] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Editor Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#111724] border-b border-slate-800">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['python', 'node', 'bash'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    disabled={status === 'running'}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      language === lang
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'python' ? 'Python 3' : lang === 'node' ? 'Node.js' : 'Bash'}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Durée :</span>
              <select
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                disabled={status === 'running'}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value={30}>30 min</option>
                <option value={60}>1 heure</option>
                <option value={120}>2 heures (Recommandé)</option>
                <option value={180}>3 heures (Max)</option>
              </select>
            </div>
          </div>

          {/* Quick template selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e16] border-b border-slate-800/80 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-medium whitespace-nowrap">Exemples :</span>
            {Object.entries(templates).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleSelectTemplate(key)}
                disabled={status === 'running'}
                className="px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Code Textarea */}
          <div className="relative flex-1 min-h-[350px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={status === 'running'}
              className="w-full h-full min-h-[350px] p-4 bg-[#070a0f] text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/30"
              placeholder="# Collez ici votre code Python, Node.js ou script bash..."
              spellCheck={false}
            />
          </div>

          {/* Environment Variables Collapsible */}
          <div className="border-t border-slate-800 bg-[#0f1422] p-3">
            <button
              onClick={() => setShowEnv(!showEnv)}
              className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200"
            >
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Variables d'environnement secrètes (API Keys, Tokens...)</span>
                {envVars.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 text-[10px]">
                    {envVars.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEnv ? 'rotate-180' : ''}`} />
            </button>

            {showEnv && (
              <div className="mt-3 space-y-2">
                {envVars.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="NOM_VARIABLE"
                      value={item.key}
                      onChange={(e) => {
                        const copy = [...envVars];
                        copy[idx].key = e.target.value;
                        setEnvVars(copy);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-white"
                    />
                    <input
                      type="password"
                      placeholder="Valeur secrète"
                      value={item.value}
                      onChange={(e) => {
                        const copy = [...envVars];
                        copy[idx].value = e.target.value;
                        setEnvVars(copy);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() => setEnvVars(envVars.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-500 hover:text-rose-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  + Ajouter une variable
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#121826] border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              Ressource : Google Cloud Run Container (Linux x86_64)
            </div>

            <div className="flex items-center gap-2">
              {status === 'running' ? (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter le Processus</span>
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={!code.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lancer le Code ({timeoutMinutes / 60}h)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Execution Output Stream */}
        <div className="flex flex-col bg-[#0b0f17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Output Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f141f] border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Console d'Exécution en Direct</span>
              
              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 border border-slate-800">
                {status === 'running' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-mono">En cours · {formatElapsed(elapsedSeconds)}</span>
                  </>
                ) : status === 'completed' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Terminé avec succès</span>
                  </>
                ) : status === 'failed' ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span className="text-rose-400">Échoué</span>
                  </>
                ) : status === 'stopped' ? (
                  <>
                    <Square className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400">Arrêté</span>
                  </>
                ) : (
                  <span className="text-slate-500">Prêt</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleCopyLogs}
                disabled={logs.length === 0}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
                title="Copier les logs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
                title="Télécharger les logs (.txt)"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLogs([])}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Effacer la console"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs View Area */}
          <div className="flex-1 p-4 bg-[#070a0f] font-mono text-[12px] leading-relaxed overflow-y-auto min-h-[380px] max-h-[500px]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
                <Terminal className="w-8 h-8 opacity-40 mb-1" />
                <p>Aucune exécution en cours.</p>
                <p className="text-[11px] text-slate-600">
                  Cliquez sur "Lancer le Code" à gauche pour exécuter votre script directement.
                </p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`py-0.5 whitespace-pre-wrap break-all ${
                    log.type === 'stderr'
                      ? 'text-rose-400'
                      : log.type === 'system'
                      ? 'text-sky-400/90 font-medium'
                      : 'text-slate-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: ansiToHtml(log.text) }}
                />
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Standard Input form for scripts that prompt input() */}
          {status === 'running' && (
            <form onSubmit={handleSendInput} className="flex items-center gap-2 p-2.5 bg-[#0f1422] border-t border-slate-800">
              <span className="text-emerald-400 font-mono text-xs pl-2 font-semibold">&gt;</span>
              <input
                type="text"
                placeholder="Envoyer une entrée à votre script (stdin)..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                <span>Envoyer</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
