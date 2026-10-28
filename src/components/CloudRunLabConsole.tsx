import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Layers, 
  Cpu, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Lock, 
  Terminal as TerminalIcon, 
  Copy, 
  Check, 
  Play, 
  Square, 
  RotateCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Code2, 
  ExternalLink,
  ChevronRight,
  FolderArchive,
  FileCode2,
  Sliders,
  Settings2
} from 'lucide-react';

interface CloudRunService {
  serviceName: string;
  region: string;
  regionName: string;
  ingress: 'public' | 'private';
  memory: string;
  cpu: string;
  sourceType: 'docker' | 'source' | 'config';
  imageName: string;
  port: number;
  wsPath: string;
  uuid: string;
  status: 'running' | 'deploying' | 'failed' | 'stopped';
  deployedAt: number;
  revision: string;
  trafficPercent: number;
  publicUrl: string;
  vlessWsLink: string;
  remoteRelayLink: string;
  activePid: number | null;
}

interface CloudRunLabConsoleProps {
  onSwitchToTerminal: () => void;
}

export const CloudRunLabConsole: React.FC<CloudRunLabConsoleProps> = ({ onSwitchToTerminal }) => {
  const [activeView, setActiveView] = useState<'create' | 'details' | 'logs'>('create');
  const [service, setService] = useState<CloudRunService | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: string }>>([]);

  // Form Fields
  const [sourceType, setSourceType] = useState<'docker' | 'source' | 'config'>('docker');
  const [imageName, setImageName] = useState<string>('docker.io/ajndjd2/ahmed-vip1');
  const [serviceName, setServiceName] = useState<string>('ahmed-vip1-service');
  const [region, setRegion] = useState<string>('europe-west2');
  const [ingress, setIngress] = useState<'public' | 'private'>('public');
  const [memory, setMemory] = useState<string>('1 GiB');
  const [cpu, setCpu] = useState<string>('1 vCPU');
  const [port, setPort] = useState<number>(8080);
  const [wsPath, setWsPath] = useState<string>('/Telegram/@AM2_D3/@AHMAD3214');
  const [uuid, setUuid] = useState<string>('aaaa1111-bbbb-4ccc-8ddd-eeeeffff0000');
  const [rawConfigJson, setRawConfigJson] = useState<string>('');

  // Deployment Progress
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Copy states
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedVless, setCopiedVless] = useState<boolean>(false);
  const [copiedRelay, setCopiedRelay] = useState<boolean>(false);

  // Live Test
  const [testResult, setTestResult] = useState<{
    loading: boolean;
    success?: boolean;
    ip?: string;
    latencyMs?: number;
    error?: string;
  }>({ loading: false });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch current service info
  const fetchService = async () => {
    try {
      const res = await fetch('/api/cloudrun/service');
      const data = await res.json();
      if (data.success && data.service) {
        setService(data.service);
        if (data.logs) setLogs(data.logs);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchService();
    const timer = setInterval(fetchService, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Deployment Steps Execution
  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError(null);
    setDeployStep(1);

    try {
      // Step 1: Initializing revision
      await new Promise((r) => setTimeout(r, 600));
      setDeployStep(2);

      // Step 2: Extraction & Compilation
      const res = await fetch('/api/cloudrun/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          imageName,
          serviceName,
          region,
          ingress,
          memory,
          cpu,
          port,
          wsPath,
          uuid,
          configJson: sourceType === 'config' ? rawConfigJson : undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setDeployError(data.error || 'Erreur lors du déploiement');
        setDeploying(false);
        return;
      }

      setDeployStep(3);
      await new Promise((r) => setTimeout(r, 600));
      setDeployStep(4);
      await new Promise((r) => setTimeout(r, 500));

      setService(data.service);
      setDeploying(false);
      setActiveView('details');
      fetchService();
    } catch (err: any) {
      setDeployError(err.message);
      setDeploying(false);
    }
  };

  // Live Proxy Test
  const handleTestTunnel = async () => {
    setTestResult({ loading: true });
    try {
      const res = await fetch('/api/vip/test-tunnel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          loading: false,
          success: true,
          ip: data.ip,
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          loading: false,
          success: false,
          error: data.error,
        });
      }
    } catch (e: any) {
      setTestResult({ loading: false, success: false, error: e.message });
    }
  };

  const handleCopy = (text: string, type: 'url' | 'vless' | 'relay') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'vless') {
      setCopiedVless(true);
      setTimeout(() => setCopiedVless(false), 2000);
    } else {
      setCopiedRelay(true);
      setTimeout(() => setCopiedRelay(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Cloud Run Console Header */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-4 sm:px-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Google Cloud Platform</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-medium text-slate-300">Cloud Run</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{service?.serviceName || 'ahmed-vip1-service'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold">
                Actif
              </span>
            </h2>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveView('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Déployer un Service</span>
          </button>
          <button
            onClick={() => setActiveView('details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'details'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Détails & Connexion</span>
          </button>
          <button
            onClick={() => setActiveView('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'logs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Journaux (Logs)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CREATE / DEPLOY CLOUD RUN SERVICE (The User's Request) */}
      {activeView === 'create' && (
        <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Créer un service Cloud Run</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Déployez une révision à partir d'une image de conteneur Docker existante ou de code source. Le conteneur s'exécute selon les éléments de l'image sans modification et attribue automatiquement le point d'accès public sécurisé.
            </p>
          </div>

          {/* Section 1: Deployment Source */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              1. Source de déploiement (Type de fichier à déployer)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option A: Docker Image */}
              <div
                onClick={() => setSourceType('docker')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  sourceType === 'docker'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    checked={sourceType === 'docker'}
                    onChange={() => setSourceType('docker')}
                    className="accent-blue-500"
                  />
                </div>
                <div className="font-semibold text-white text-sm mt-3">Image Docker existante</div>
                <div className="text-xs text-slate-400 mt-1">
                  Exécuter directement l'image <code className="text-blue-300 font-mono">ajndjd2/ahmed-vip1</code>
                </div>
              </div>

              {/* Option B: Source Code */}
              <div
                onClick={() => setSourceType('source')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  sourceType === 'source'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    checked={sourceType === 'source'}
                    onChange={() => setSourceType('source')}
                    className="accent-blue-500"
                  />
                </div>
                <div className="font-semibold text-white text-sm mt-3">Dossier / Code source</div>
                <div className="text-xs text-slate-400 mt-1">
                  Déployer des fichiers depuis l'espace de travail ou une archive ZIP
                </div>
              </div>

              {/* Option C: Direct Config JSON */}
              <div
                onClick={() => setSourceType('config')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  sourceType === 'config'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    checked={sourceType === 'config'}
                    onChange={() => setSourceType('config')}
                    className="accent-blue-500"
                  />
                </div>
                <div className="font-semibold text-white text-sm mt-3">Configuration JSON V2Ray</div>
                <div className="text-xs text-slate-400 mt-1">
                  Injecter directement une configuration personnalisée
                </div>
              </div>
            </div>

            {/* Sub-Panel: If Docker selected */}
            {sourceType === 'docker' && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 mt-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  URL de l'image de conteneur (Docker Hub ou Artifact Registry) :
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="docker.io/ajndjd2/ahmed-vip1"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => setImageName('docker.io/ajndjd2/ahmed-vip1')}
                    className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium whitespace-nowrap border border-slate-700 transition-colors"
                  >
                    Image VIP Par Défaut
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Image analysée : Architecture Linux amd64 · Moteur V2Fly 5.42.0 · Protocole VLESS WebSocket</span>
                </div>
              </div>
            )}

            {/* Sub-Panel: If Source selected */}
            {sourceType === 'source' && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mt-2">
                <div className="text-xs text-slate-300">
                  Les fichiers seront chargés depuis votre espace <code className="text-emerald-400 font-mono">/tmp/workspace</code>.
                </div>
                <p className="text-[11px] text-slate-400">
                  Vous pouvez importer vos dossiers Android ou ZIP dans l'onglet « Fichiers » pour les déployer ici.
                </p>
              </div>
            )}

            {/* Sub-Panel: If Config selected */}
            {sourceType === 'config' && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mt-2">
                <label className="text-xs font-semibold text-slate-200 block">Collez votre JSON V2Ray complet :</label>
                <textarea
                  value={rawConfigJson}
                  onChange={(e) => setRawConfigJson(e.target.value)}
                  placeholder={`{\n  "remarks": "VIP-Custom",\n  "inbounds": [...],\n  "outbounds": [...]\n}`}
                  rows={8}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Section 2: Service Name & Region */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              2. Nom du service et Région Cloud Run
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Nom du service</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Région du serveur</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="europe-west2">🇬🇧 europe-west2 (Londres) · Actuelle</option>
                  <option value="europe-west1">🇧🇪 europe-west1 (Belgique)</option>
                  <option value="europe-west9">🇫🇷 europe-west9 (Paris)</option>
                  <option value="us-central1">🇺🇸 us-central1 (Iowa)</option>
                  <option value="us-east1">🇺🇸 us-east1 (Caroline du Sud)</option>
                  <option value="asia-east1">🇹🇼 asia-east1 (Taïwan)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Ingress / Authentication */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              3. Authentification & Type de connexion
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ingress === 'public'
                    ? 'bg-blue-950/40 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="ingress"
                  checked={ingress === 'public'}
                  onChange={() => setIngress('public')}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <div className="font-semibold text-xs text-white">Autoriser les invocations non authentifiées (Public)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Permet aux clients v2rayNG, NekoBox et navigateurs de se connecter directement via Internet mondial.
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ingress === 'private'
                    ? 'bg-blue-950/40 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="ingress"
                  checked={ingress === 'private'}
                  onChange={() => setIngress('private')}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <div className="font-semibold text-xs text-white">Exiger une authentification (Privé)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Seules les identités IAM autorisées peuvent envoyer des requêtes.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Compute Capacity (CPU & RAM) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              4. Capacité de calcul (Mémoire RAM et CPU de la machine Linux)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* RAM Select */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Allocation de RAM</label>
                <select
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="512 MiB">512 MiB</option>
                  <option value="1 GiB">1 GiB (Recommandé)</option>
                  <option value="2 GiB">2 GiB</option>
                  <option value="4 GiB">4 GiB</option>
                  <option value="8 GiB">8 GiB</option>
                </select>
              </div>

              {/* CPU Select */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Allocation de CPU</label>
                <select
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="1 vCPU">1 vCPU (Standard)</option>
                  <option value="2 vCPU">2 vCPU</option>
                  <option value="4 vCPU">4 vCPU</option>
                </select>
              </div>

              {/* Container Port */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Port d'écoute du conteneur</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* WebSocket Path */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Chemin d'accès WebSocket</label>
                <input
                  type="text"
                  value={wsPath}
                  onChange={(e) => setWsPath(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Advanced Docker Elements (Client UUID, etc.) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Éléments du Docker VIP (Configuration sans modification) :</span>
              <span className="text-[11px] font-mono text-blue-400">VLESS WebSocket Protocol</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Identifiant Client UUID</label>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Passerelle Publique WSS</label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Port 443 TLS (HTTPS / WSS)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {deployError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{deployError}</span>
            </div>
          )}

          {/* Deployment Progress Modal / Overlay */}
          {deploying && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <RotateCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Déploiement du service Cloud Run en cours...</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className={`flex items-center gap-2 ${deployStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 1 ? '✔' : '○'} Étape 1 : Création de la révision Cloud Run ({serviceName})...
                </div>
                <div className={`flex items-center gap-2 ${deployStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 2 ? '✔' : '○'} Étape 2 : Chargement et vérification de l'image de conteneur {imageName}...
                </div>
                <div className={`flex items-center gap-3 ${deployStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 3 ? '✔' : '○'} Étape 3 : Démarrage du serveur selon les éléments du Docker sans modification...
                </div>
                <div className={`flex items-center gap-2 ${deployStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 4 ? '✔' : '○'} Étape 4 : Attribution de l'URL publique et routage WebSocket 100% actif !
                </div>
              </div>
            </div>
          )}

          {/* Create Button (Style Google Cloud) */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 hidden sm:block">
              Pas besoin d'ouvrir une page index · Connexion directe à l'application serveur
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('details')}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={deploying}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deploying ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Déploiement en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>CRÉER LE SERVICE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SERVICE DETAILS & CONNECTION (Google Cloud Run Overview) */}
      {activeView === 'details' && (
        <div className="space-y-5">
          {/* Main Status & Public URL Card */}
          <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {service?.serviceName || 'ahmed-vip1-service'}
                    </h3>
                    <div className="text-xs text-emerald-400 font-medium">
                      Ce service diffuse 100 % du trafic · {service?.regionName || 'europe-west2 (Londres)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestTunnel}
                  disabled={testResult.loading}
                  className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Activity className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
                  <span>{testResult.loading ? 'Test du tunnel...' : 'Tester la connexion serveur (Ping IP)'}</span>
                </button>
                <button
                  onClick={() => setActiveView('create')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  Modifier et redéployer
                </button>
              </div>
            </div>

            {/* Public Service URL Bar */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-400">URL publique du service Cloud Run (HTTPS / WSS) :</div>
                <div className="font-mono text-xs text-blue-400 truncate font-semibold">
                  {service?.publicUrl || 'https://ais-dev-lysdff6q7t7e3u6paibaqm-376987535874.europe-west2.run.app'}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => handleCopy(service?.publicUrl || '', 'url')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copié !' : 'Copier l\'URL'}</span>
                </button>
                <a
                  href={service?.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Test result callout if performed */}
            {testResult.success !== undefined && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {testResult.success
                      ? `✔ Connexion au serveur active ! IP publique masquée de sortie : ${testResult.ip} (${testResult.latencyMs}ms)`
                      : `✖ ${testResult.error || 'Erreur de routage'}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* VLESS Client Connection Links (Public WebSocket & Relay) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card A: Cloud Run Direct WebSocket Link */}
            <div className="p-4 rounded-xl bg-[#0c121e] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Lien VLESS WebSocket Direct (Cloud Run)</span>
                </div>
                <button
                  onClick={() => handleCopy(service?.vlessWsLink || '', 'vless')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  {copiedVless ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVless ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Lien client prêt pour <strong className="text-white">v2rayNG</strong> (Android), <strong className="text-white">NekoBox</strong>, <strong className="text-white">Clash Meta</strong>. Connexion directe par WebSocket TLS sur le port 443.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-300 break-all select-all max-h-24 overflow-y-auto">
                {service?.vlessWsLink}
              </div>
            </div>

            {/* Card B: Remote Relay Link */}
            <div className="p-4 rounded-xl bg-[#0c121e] border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Lien VLESS Relais Distant (192.179.18.100)</span>
                </div>
                <button
                  onClick={() => handleCopy(service?.remoteRelayLink || '', 'relay')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  {copiedRelay ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRelay ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Configuration de chaîne VLESS avec Host Header <code className="text-blue-300">youngboyvipfast...</code> et SNI Google.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-blue-300 break-all select-all max-h-24 overflow-y-auto">
                {service?.remoteRelayLink}
              </div>
            </div>
          </div>

          {/* Machine & Specifications Grid (Like Cloud Run Service Details) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Révision active</div>
              <div className="text-xs font-mono font-bold text-white truncate" title={service?.revision}>
                {service?.revision || 'rev-001'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Mémoire (RAM)</div>
              <div className="text-xs font-bold text-emerald-400">{service?.memory || '1 GiB'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">CPU alloué</div>
              <div className="text-xs font-bold text-blue-400">{service?.cpu || '1 vCPU'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Port Inbound</div>
              <div className="text-xs font-mono font-bold text-amber-300">8080 (WS 8081)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Région GCP</div>
              <div className="text-xs font-bold text-white truncate">{service?.region || 'europe-west2'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Image Conteneur</div>
              <div className="text-xs font-mono font-bold text-purple-300 truncate" title={service?.imageName}>
                ajndjd2/ahmed-vip1
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CLOUD LOGGING / LIVE LOGS */}
      {activeView === 'logs' && (
        <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Journaux Cloud Run en direct</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{logs.length} entrées</span>
              <button
                onClick={async () => {
                  await fetch('/api/vip/logs/clear', { method: 'POST' });
                  setLogs([]);
                }}
                className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Vider
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#05070c] max-h-96 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-6 text-center">Aucun journal disponible pour le moment.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 select-none text-[10px] shrink-0">{log.time}</span>
                  <span
                    className={
                      log.type === 'error'
                        ? 'text-rose-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'success'
                        ? 'text-emerald-300 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
