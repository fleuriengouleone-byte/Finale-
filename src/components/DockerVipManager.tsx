import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Radio, 
  Activity, 
  Settings, 
  Code2, 
  Zap, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Globe, 
  Lock, 
  ArrowRight,
  RefreshCw,
  Sliders,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface VipStatus {
  success: boolean;
  imageTag: string;
  imageInstalled: boolean;
  running: boolean;
  pid: number | null;
  uptimeSec: number;
  currentConfig: any;
  vlessLink: string;
  cloudRunWsLink?: string;
  remoteRelayLink?: string;
  vlessPort?: number;
  socksPort: number;
  httpPort: number;
  wsPath?: string;
  remarks: string;
  cloudRunHost?: string;
}

interface LogEntry {
  time: string;
  text: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

interface DockerVipManagerProps {
  onSwitchToTerminal?: () => void;
}

export const DockerVipManager: React.FC<DockerVipManagerProps> = ({ onSwitchToTerminal }) => {
  const [status, setStatus] = useState<VipStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [copiedCloudRunLink, setCopiedCloudRunLink] = useState<boolean>(false);
  const [copiedRelayLink, setCopiedRelayLink] = useState<boolean>(false);
  const [copiedSocks, setCopiedSocks] = useState<boolean>(false);

  // Tunnel live test
  const [tunnelTest, setTunnelTest] = useState<{
    tested: boolean;
    success: boolean;
    ip?: string;
    latencyMs?: number;
    error?: string;
    loading: boolean;
  }>({
    tested: false,
    success: false,
    loading: false,
  });

  // Config editor state
  const [editorMode, setEditorMode] = useState<'visual' | 'json'>('visual');
  const [rawJson, setRawJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  // Quick form fields
  const [remarks, setRemarks] = useState<string>('VIP-YoungBoy FasT');
  const [serverAddress, setServerAddress] = useState<string>('192.179.18.100');
  const [serverPort, setServerPort] = useState<number>(443);
  const [uuid, setUuid] = useState<string>('aaaa1111-bbbb-4ccc-8ddd-eeeeffff0000');
  const [wsPath, setWsPath] = useState<string>('/Telegram/@AM2_D3/@AHMAD3214');
  const [wsHost, setWsHost] = useState<string>('youngboyvipfast-378921728202.us-central1.run.app');
  const [tlsSni, setTlsSni] = useState<string>('crashlyticsreports-pa.googleapis.com');
  const [socksPort, setSocksPort] = useState<number>(10808);
  const [httpPort, setHttpPort] = useState<number>(10809);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/vip/status');
      const data: VipStatus = await res.json();
      if (data.success) {
        setStatus(data);
        if (!rawJson && data.currentConfig) {
          syncStateFromConfig(data.currentConfig);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/vip/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {}
  };

  const syncStateFromConfig = (cfg: any) => {
    setRawJson(JSON.stringify(cfg, null, 2));
    setRemarks(cfg.remarks || 'VIP-YoungBoy FasT');
    const proxy = cfg.outbounds?.find((o: any) => o.protocol === 'vless');
    if (proxy) {
      const vnext = proxy.settings?.vnext?.[0];
      if (vnext) {
        setServerAddress(vnext.address || '192.179.18.100');
        setServerPort(vnext.port || 443);
        const user = vnext.users?.[0];
        if (user) setUuid(user.id || '');
      }
      const stream = proxy.streamSettings;
      if (stream) {
        setWsPath(stream.wsSettings?.path || '');
        setWsHost(stream.wsSettings?.headers?.Host || '');
        setTlsSni(stream.tlsSettings?.serverName || '');
      }
    }
    const socksInbound = cfg.inbounds?.find((i: any) => i.protocol === 'socks');
    if (socksInbound) setSocksPort(socksInbound.port || 10808);
    const httpInbound = cfg.inbounds?.find((i: any) => i.protocol === 'http');
    if (httpInbound) setHttpPort(httpInbound.port || 10809);
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Actions
  const handleStart = async () => {
    setActionLoading('start');
    setFeedback(null);
    try {
      const res = await fetch('/api/vip/start', { method: 'POST' });
      const data = await res.json();
      setFeedback({ text: data.message, success: data.success });
      await fetchStatus();
      await fetchLogs();
      if (data.success) {
        setTimeout(handleTestTunnel, 1200);
      }
    } catch (e: any) {
      setFeedback({ text: `Erreur: ${e.message}`, success: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    setActionLoading('stop');
    setFeedback(null);
    try {
      const res = await fetch('/api/vip/stop', { method: 'POST' });
      const data = await res.json();
      setFeedback({ text: data.message, success: data.success });
      await fetchStatus();
      await fetchLogs();
    } catch (e: any) {
      setFeedback({ text: `Erreur: ${e.message}`, success: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestart = async () => {
    setActionLoading('restart');
    setFeedback(null);
    try {
      const res = await fetch('/api/vip/restart', { method: 'POST' });
      const data = await res.json();
      setFeedback({ text: data.message, success: data.success });
      await fetchStatus();
      await fetchLogs();
      if (data.success) {
        setTimeout(handleTestTunnel, 1200);
      }
    } catch (e: any) {
      setFeedback({ text: `Erreur: ${e.message}`, success: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePullImage = async () => {
    setActionLoading('pull');
    setFeedback({ text: 'Téléchargement et extraction des couches Docker en cours...', success: true });
    try {
      const res = await fetch('/api/vip/pull-image', { method: 'POST' });
      const data = await res.json();
      setFeedback({ text: data.message, success: data.success });
      await fetchStatus();
      await fetchLogs();
    } catch (e: any) {
      setFeedback({ text: `Erreur de téléchargement: ${e.message}`, success: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestTunnel = async () => {
    setTunnelTest({ tested: false, success: false, loading: true });
    try {
      const res = await fetch('/api/vip/test-tunnel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTunnelTest({
          tested: true,
          success: true,
          ip: data.ip,
          latencyMs: data.latencyMs,
          loading: false,
        });
      } else {
        setTunnelTest({
          tested: true,
          success: false,
          error: data.error,
          latencyMs: data.latencyMs,
          loading: false,
        });
      }
    } catch (e: any) {
      setTunnelTest({
        tested: true,
        success: false,
        error: e.message,
        loading: false,
      });
    }
  };

  // Build JSON from visual form
  const buildConfigFromVisual = () => {
    let baseConfig = status?.currentConfig ? JSON.parse(JSON.stringify(status.currentConfig)) : {};
    baseConfig.remarks = remarks;
    if (!baseConfig.log) baseConfig.log = { loglevel: 'warning' };
    
    // Inbounds
    baseConfig.inbounds = [
      {
        tag: 'socks',
        port: Number(socksPort) || 10808,
        protocol: 'socks',
        settings: { auth: 'noauth', udp: true, userLevel: 8 },
        sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'], routeOnly: false },
      },
      {
        tag: 'http',
        port: Number(httpPort) || 10809,
        protocol: 'http',
        settings: { auth: 'noauth', userLevel: 8 },
      },
    ];

    // Outbounds
    baseConfig.outbounds = [
      {
        tag: 'proxy',
        protocol: 'vless',
        settings: {
          vnext: [
            {
              address: serverAddress,
              port: Number(serverPort) || 443,
              users: [{ id: uuid, level: 8, encryption: 'none' }],
            },
          ],
        },
        streamSettings: {
          network: 'ws',
          security: 'tls',
          wsSettings: {
            path: wsPath,
            headers: { Host: wsHost },
          },
          tlsSettings: {
            serverName: tlsSni || wsHost,
            fingerprint: 'chrome',
            show: false,
          },
        },
        mux: { enabled: false, concurrency: -1, xudpConcurrency: 8, xudpProxyUDP443: '' },
      },
      { tag: 'direct', protocol: 'freedom', settings: { domainStrategy: 'UseIP' }, mux: { enabled: false, concurrency: 8, xudpConcurrency: 8, xudpProxyUDP443: '' } },
      { tag: 'block', protocol: 'blackhole', settings: { response: { type: 'http' } }, mux: { enabled: false, concurrency: 8, xudpConcurrency: 8, xudpProxyUDP443: '' } },
    ];

    if (!baseConfig.dns) {
      baseConfig.dns = { servers: ['1.1.1.1'], queryStrategy: 'UseIPv4' };
    }

    if (!baseConfig.routing) {
      baseConfig.routing = {
        domainStrategy: 'AsIs',
        rules: [
          { type: 'field', ip: ['1.1.1.1'], outboundTag: 'proxy', port: '53' },
          { type: 'field', ip: ['223.5.5.5'], outboundTag: 'direct', port: '53' },
        ],
      };
    }

    return baseConfig;
  };

  const handleValidateConfig = async () => {
    setJsonError(null);
    setValidationSuccess(null);
    const configToTest = editorMode === 'visual' ? buildConfigFromVisual() : rawJson;

    try {
      const res = await fetch('/api/vip/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configToTest }),
      });
      const data = await res.json();
      if (data.valid) {
        setValidationSuccess(data.output || '✔ Syntaxe V2Ray 100% valide et correcte !');
      } else {
        setJsonError(data.error || 'Erreur de syntaxe dans la configuration.');
      }
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSaveConfig = async () => {
    setJsonError(null);
    setValidationSuccess(null);
    setActionLoading('save');

    let configToSave: any;
    if (editorMode === 'visual') {
      configToSave = buildConfigFromVisual();
    } else {
      try {
        configToSave = JSON.parse(rawJson);
      } catch (e: any) {
        setJsonError(`JSON invalide: ${e.message}`);
        setActionLoading(null);
        return;
      }
    }

    try {
      const res = await fetch('/api/vip/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configToSave, restartIfRunning: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message, success: true });
        syncStateFromConfig(data.config);
        await fetchStatus();
        await fetchLogs();
        if (status?.running) {
          setTimeout(handleTestTunnel, 1200);
        }
      } else {
        setJsonError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e: any) {
      setJsonError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetDefault = async () => {
    if (!window.confirm('Voulez-vous restaurer la configuration originale VIP-YoungBoy FasT ?')) return;
    setActionLoading('reset');
    try {
      const res = await fetch('/api/vip/reset-config', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        syncStateFromConfig(data.config);
        setFeedback({ text: data.message, success: true });
        await fetchStatus();
      }
    } catch (e: any) {
      setFeedback({ text: `Erreur: ${e.message}`, success: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyVless = () => {
    if (status?.vlessLink) {
      navigator.clipboard.writeText(status.vlessLink);
      setCopiedCloudRunLink(true);
      setTimeout(() => setCopiedCloudRunLink(false), 2000);
    }
  };

  const handleCopySocks = () => {
    const socksStr = `socks5://127.0.0.1:${status?.socksPort || 10808}`;
    navigator.clipboard.writeText(socksStr);
    setCopiedSocks(true);
    setTimeout(() => setCopiedSocks(false), 2000);
  };

  const isRunning = status?.running || false;

  return (
    <div className="space-y-5">
      {/* Top Banner / Hero Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Conteneur Docker VIP · <span className="text-amber-400 font-mono">ajndjd2/ahmed-vip1</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-500/30">
                  {status?.remarks || 'VIP-YoungBoy FasT'}
                </span>
                {isRunning ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    En cours d'exécution (PID: {status?.pid})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    Arrêté
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Ce conteneur intègre le cœur <strong className="text-white">V2Fly 5.42.0</strong> et la passerelle proxy <strong className="text-blue-300">VLESS WebSocket TLS</strong> vers <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">192.179.18.100:443</code>. L'accès Web et Terminal sur le port 3000 reste toujours 100% accessible.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!status?.imageInstalled ? (
              <button
                onClick={handlePullImage}
                disabled={actionLoading === 'pull'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-950 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{actionLoading === 'pull' ? 'Téléchargement...' : 'Télécharger l\'image'}</span>
              </button>
            ) : isRunning ? (
              <>
                <button
                  onClick={handleRestart}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${actionLoading === 'restart' ? 'animate-spin text-blue-400' : ''}`} />
                  <span>Redémarrer</span>
                </button>
                <button
                  onClick={handleStop}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStart}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{actionLoading === 'start' ? 'Démarrage...' : 'Lancer l\'image VIP'}</span>
              </button>
            )}

            <button
              onClick={handleTestTunnel}
              disabled={!isRunning || tunnelTest.loading}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                !isRunning
                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/40 shadow-sm'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${tunnelTest.loading ? 'animate-spin' : ''}`} />
              <span>{tunnelTest.loading ? 'Test du tunnel...' : 'Tester le Tunnel IP'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border ${
              feedback.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Live Tunnel Test Result Card */}
        {tunnelTest.tested && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              tunnelTest.success
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${tunnelTest.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>{tunnelTest.success ? '✔ Connexion VLESS établie avec succès !' : '✖ Échec du routage'}</span>
                  {tunnelTest.latencyMs && (
                    <span className="px-2 py-0.5 rounded bg-black/40 font-mono text-[11px] text-amber-300">
                      {tunnelTest.latencyMs} ms
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {tunnelTest.success ? (
                    <span>
                      IP publique masquée de sortie : <strong className="font-mono text-emerald-300 font-bold">{tunnelTest.ip}</strong> (Trafic chiffré via Cloud Run & VLESS)
                    </span>
                  ) : (
                    <span>{tunnelTest.error || 'Vérifiez la connexion ou le serveur distant.'}</span>
                  )}
                </div>
              </div>
            </div>

            {tunnelTest.success && (
              <button
                onClick={handleCopySocks}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedSocks ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSocks ? 'Copié !' : 'Copier SOCKS5 proxy'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid of Key Info / Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Remote VLESS Endpoint */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Serveur VLESS Cible</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-white truncate" title={serverAddress}>
            {serverAddress}:{serverPort}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={wsHost}>
            Hôte: {wsHost.split('.')[0]}...
          </div>
        </div>

        {/* Card 2: SOCKS5 & HTTP Inbounds */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Ports Locaux Ouverts</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-emerald-400">
            SOCKS: {status?.socksPort || 10808} · HTTP: {status?.httpPort || 10809}
          </div>
          <div className="text-[11px] text-slate-400">
            127.0.0.1 (Prêt pour curl, Telegram, apps)
          </div>
        </div>

        {/* Card 3: Security & SNI */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Sécurité TLS & SNI</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-xs font-semibold text-amber-300 truncate" title={tlsSni}>
            {tlsSni}
          </div>
          <div className="text-[11px] text-slate-400">
            Empreinte: Chrome · WS: {wsPath.substring(0, 16)}...
          </div>
        </div>

        {/* Card 4: Web Console Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Disponibilité Web (Port 3000)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            100% Accessible 24/7
          </div>
          <div className="text-[11px] text-emerald-400">
            Google Cloud Run Actif (Sans conflit)
          </div>
        </div>
      </div>

      {/* WebSocket Port 8080 & Cloud Run Explanation Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-blue-300 font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Pourquoi le port interne est 8081 et comment l'accès WebSocket fonctionne :</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          Dans le Dockerfile original <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">ajndjd2/ahmed-vip1</code>, V2Ray écoutait sur le port 8080. Sur <strong className="text-white">Google Cloud Run</strong>, le port 8080 est déjà réservé par le point d'entrée officiel Nginx qui reçoit tout le trafic Internet mondial en HTTPS/WSS (port 443).
        </p>
        <p className="text-slate-300 leading-relaxed">
          Pour éviter tout conflit d'adresse (<em className="text-rose-300">address already in use</em>), V2Ray écoute sur le port interne <strong className="text-emerald-400 font-mono">8081</strong>, et notre serveur <strong className="text-blue-300">relaie automatiquement toutes les requêtes WebSocket</strong> arrivant sur <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded font-mono">{status?.wsPath || '/Telegram/@AM2_D3/@AHMAD3214'}</code> directement dans V2Ray ! Vos clients peuvent donc se connecter depuis n'importe où en <strong className="text-emerald-400">WebSocket TLS sur le port 443</strong>.
        </p>
      </div>

      {/* Share / Export Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Link 1: Cloud Run Public WebSocket Link */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Lien VLESS WebSocket Direct (Cloud Run)</span>
            </div>
            <button
              onClick={() => {
                if (status?.cloudRunWsLink) {
                  navigator.clipboard.writeText(status.cloudRunWsLink);
                  setCopiedCloudRunLink(true);
                  setTimeout(() => setCopiedCloudRunLink(false), 2000);
                }
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            >
              {copiedCloudRunLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCloudRunLink ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Connexion directe par WebSocket TLS sur le port 443 de cette instance Cloud Run.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-300 break-all select-all max-h-24 overflow-y-auto">
            {status?.cloudRunWsLink || 'Génération du lien...'}
          </div>
        </div>

        {/* Link 2: Remote Relay Link */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-blue-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-white">Lien VLESS Relais Distant (192.179.18.100)</span>
            </div>
            <button
              onClick={() => {
                if (status?.remoteRelayLink) {
                  navigator.clipboard.writeText(status.remoteRelayLink);
                  setCopiedRelayLink(true);
                  setTimeout(() => setCopiedRelayLink(false), 2000);
                }
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              {copiedRelayLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRelayLink ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Relais externe VLESS WebSocket avec Host Header et SNI personnalisés.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-blue-300 break-all select-all max-h-24 overflow-y-auto">
            {status?.remoteRelayLink || 'Génération du lien...'}
          </div>
        </div>
      </div>

      {/* Configuration Section (Visual & JSON tabs) */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-3.5 sm:px-5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Configuration du Client & Proxy</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setEditorMode('visual')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  editorMode === 'visual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Formulaire Rapide
              </button>
              <button
                onClick={() => {
                  setRawJson(JSON.stringify(buildConfigFromVisual(), null, 2));
                  setEditorMode('json');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  editorMode === 'json' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Éditeur JSON Avancé
              </button>
            </div>

            <button
              onClick={handleResetDefault}
              disabled={actionLoading !== null}
              className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-amber-300 transition-colors"
              title="Restaurer la configuration d'origine fournie"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Validation Feedback */}
          {validationSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
              <span>{validationSuccess}</span>
              <button onClick={() => setValidationSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {jsonError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
              <span>{jsonError}</span>
              <button onClick={() => setJsonError(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {editorMode === 'visual' ? (
            /* Visual Form */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Nom / Remarque du Profil</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  placeholder="VIP-YoungBoy FasT"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Adresse Serveur VLESS Distant</label>
                <input
                  type="text"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="192.179.18.100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Port Serveur Distant</label>
                <input
                  type="number"
                  value={serverPort}
                  onChange={(e) => setServerPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="443"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-300 block mb-1 font-medium">UUID Utilisateur Client (ID VLESS)</label>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="aaaa1111-bbbb-4ccc-8ddd-eeeeffff0000"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Port Local SOCKS5</label>
                <input
                  type="number"
                  value={socksPort}
                  onChange={(e) => setSocksPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="10808"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-300 block mb-1 font-medium">Chemin WebSocket (Path)</label>
                <input
                  type="text"
                  value={wsPath}
                  onChange={(e) => setWsPath(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="/Telegram/@AM2_D3/@AHMAD3214"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Port Local HTTP</label>
                <input
                  type="number"
                  value={httpPort}
                  onChange={(e) => setHttpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="10809"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">En-tête WebSocket Host Header</label>
                <input
                  type="text"
                  value={wsHost}
                  onChange={(e) => setWsHost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="youngboyvipfast-378921728202.us-central1.run.app"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">TLS SNI (Server Name)</label>
                <input
                  type="text"
                  value={tlsSni}
                  onChange={(e) => setTlsSni(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  placeholder="crashlyticsreports-pa.googleapis.com"
                />
              </div>
            </div>
          ) : (
            /* JSON Raw Editor */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Édition directe du fichier <code className="text-amber-300">/etc/v2ray/config.json</code> :</span>
                <span className="font-mono text-[11px]">{rawJson.split('\n').length} lignes</span>
              </div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Action bar for config */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleValidateConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Tester la syntaxe (V2Ray Test)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveConfig}
                disabled={actionLoading === 'save'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-950 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading === 'save' ? 'Sauvegarde...' : 'Sauvegarder & Appliquer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Logs Section */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-0">
        <div className="p-3.5 sm:px-5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Journal d'exécution V2Ray en direct</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">{logs.length} lignes</span>
            <button
              onClick={async () => {
                await fetch('/api/vip/logs/clear', { method: 'POST' });
                setLogs([]);
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60"
            >
              Vider
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#05070c] max-h-64 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-4 text-center">Aucun journal pour le moment. Démarrez l'image pour voir les logs.</div>
          ) : (
            logs.map((log, index) => {
              const colorClass =
                log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'warn'
                  ? 'text-amber-400'
                  : log.type === 'success'
                  ? 'text-emerald-300 font-semibold'
                  : 'text-slate-300';
              return (
                <div key={index} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-600 select-none text-[10px] shrink-0">{log.time}</span>
                  <span className={colorClass}>{log.text}</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

function Share2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}
