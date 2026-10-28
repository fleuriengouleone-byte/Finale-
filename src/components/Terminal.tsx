import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Copy, 
  Trash2, 
  Download, 
  Maximize2, 
  Minimize2, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  CornerDownLeft,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { ansiToHtml } from '../utils/ansi';
import { SshCredentials } from '../types/ssh';

interface TerminalProps {
  server: SshCredentials | null;
  logs: string[];
  onSendCommand: (cmd: string) => void;
  onSendRaw?: (raw: string) => void;
  onClear: () => void;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  isSandbox?: boolean;
  isDirect?: boolean;
  onReconnect?: () => void;
  onSwitchToDirect?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  server,
  logs,
  onSendCommand,
  onSendRaw,
  onClear,
  status,
  isSandbox,
  isDirect,
  onReconnect,
  onSwitchToDirect,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Keep focus on input when clicking terminal
  const handleTerminalClick = (e: React.MouseEvent) => {
    if (window.getSelection()?.toString().length === 0) {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!input.trim()) {
        if (onSendRaw) onSendRaw('\r');
        else onSendCommand('');
        return;
      }

      onSendCommand(input);
      setHistory((prev) => [input, ...prev]);
      setHistoryIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (onSendRaw) {
        onSendRaw(input + '\t');
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (onSendRaw) {
        onSendRaw('\x03');
      } else {
        onSendCommand('^C');
      }
      setInput('');
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      onClear();
    }
  };

  const handleCopyLogs = () => {
    const plainText = logs.map(l => l.replace(/\x1b\[[0-9;]*m/g, '')).join('');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLog = () => {
    const plainText = logs.map(l => l.replace(/\x1b\[[0-9;]*m/g, '')).join('');
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terminal-log-${new Date().toISOString().slice(0, 19)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick preset commands
  const quickCommands = [
    { label: 'ls -la', cmd: 'ls -la' },
    { label: 'uname -a', cmd: 'uname -a' },
    { label: 'tmate -F', cmd: 'tmate -F' },
    { label: 'ps aux', cmd: 'ps aux' },
    { label: 'free -m', cmd: 'free -m' },
    { label: 'df -h', cmd: 'df -h' },
    { label: 'curl ifconfig.me', cmd: 'curl ifconfig.me' },
  ];

  const filteredLogs = searchQuery
    ? logs.filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : logs;

  const promptText = isDirect
    ? 'root@google-run:/tmp$ '
    : isSandbox
    ? 'ubuntu@vps-cloud:~$ '
    : server
    ? `${server.username}@${server.host}:~$ `
    : 'root@vps:~$ ';

  return (
    <div
      className={`flex flex-col bg-[#0b0f17] border border-slate-800 rounded-xl overflow-hidden transition-all shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[620px] w-full'
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f141f] border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block hover:opacity-100 opacity-80 cursor-pointer" onClick={onClear} title="Effacer" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-100 opacity-80 cursor-pointer" onClick={() => setAutoScroll(!autoScroll)} title="Toggle auto-scroll" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-100 opacity-80 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} title="Plein écran" />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">
              {isDirect
                ? 'Terminal Direct Google Cloud Run (Linux x86_64)'
                : isSandbox
                ? 'Ubuntu 24.04 LTS (Bac à sable virtuel)'
                : server
                ? `${server.name || 'VPS'} · ${server.username}@${server.host}:${server.port}`
                : 'Terminal Google Cloud Run'}
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 border border-slate-800">
            {status === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">{isDirect ? 'Direct Cloud Run' : 'Connecté'}</span>
              </>
            ) : status === 'connecting' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-amber-400">Connexion en cours...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-rose-400">Déconnecté</span>
              </>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 text-slate-400">
          {showSearch ? (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 py-0.5 mr-1">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-28 sm:w-36 font-mono"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-300 ml-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Rechercher dans les logs"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {status === 'disconnected' && onReconnect && (
            <button
              onClick={onReconnect}
              className="flex items-center gap-1 px-2 py-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors font-medium"
              title="Relancer la connexion"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reconnecter</span>
            </button>
          )}

          <button
            onClick={handleCopyLogs}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Copier les logs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadLog}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Télécharger l'historique (.txt)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClear}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Nettoyer l'écran"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Command Ribbon */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0e14] border-b border-slate-800/80 overflow-x-auto text-[11px] font-mono scrollbar-none">
        <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold mr-1">Raccourcis:</span>
        {quickCommands.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => onSendCommand(qc.cmd)}
            className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors whitespace-nowrap"
          >
            {qc.label}
          </button>
        ))}

        <div className="h-3 w-[1px] bg-slate-800 mx-1" />

        {/* Special Control Keys */}
        <button
          onClick={() => (onSendRaw ? onSendRaw('\x03') : onSendCommand('^C'))}
          className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-colors font-sans font-medium"
          title="Interrompre le processus en cours (SIGINT)"
        >
          Ctrl+C
        </button>

        <button
          onClick={() => (onSendRaw ? onSendRaw('\t') : onSendCommand('\t'))}
          className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors font-sans font-medium"
          title="Auto-complétion Tab"
        >
          Tab ⇥
        </button>

        <button
          onClick={onClear}
          className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors font-sans font-medium"
          title="Effacer l'affichage"
        >
          Ctrl+L
        </button>
      </div>

      {/* Terminal Screen Output */}
      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed cursor-text selection:bg-emerald-500/30 selection:text-white"
        style={{ backgroundColor: '#070a0f' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-2">
            Session initialisée. Tapez vos commandes ci-dessous ou cliquez sur les raccourcis.
          </div>
        ) : (
          filteredLogs.map((chunk, idx) => (
            <div
              key={idx}
              className="whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: ansiToHtml(chunk) }}
            />
          ))
        )}
      </div>

      {/* Command Input Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0d121c] border-t border-slate-800">
        <span className="text-emerald-400 font-mono text-xs font-semibold whitespace-nowrap select-none">
          {promptText}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Entrez une commande (ex: python3 app.py, git clone ..., pm2 start index.js)..."
          className="flex-1 bg-transparent border-none text-slate-100 font-mono text-xs focus:outline-none focus:ring-0 placeholder:text-slate-600"
          autoFocus
        />

        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <button
            onClick={() => {
              if (input.trim()) {
                onSendCommand(input);
                setHistory((prev) => [input, ...prev]);
                setHistoryIndex(-1);
                setInput('');
              }
            }}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
          >
            <span>Envoyer</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
