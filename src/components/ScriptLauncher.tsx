import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  FolderGit2, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Code2, 
  FileCode,
  Layers
} from 'lucide-react';
import { ScriptPreset, SshCredentials } from '../types/ssh';

interface ScriptLauncherProps {
  server: SshCredentials | null;
  isSandbox?: boolean;
  onRunInTerminal: (command: string) => void;
  onExecuteBatch?: (command: string) => Promise<{ success: boolean; stdout?: string; stderr?: string }>;
}

export const ScriptLauncher: React.FC<ScriptLauncherProps> = ({
  server,
  isSandbox,
  onRunInTerminal,
  onExecuteBatch,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'run' | 'setup' | 'monitor' | 'security'>('all');
  const [customScript, setCustomScript] = useState<string>(
    `# 1. Cloner un dépôt Git ou créer un fichier
git clone https://github.com/example/mon-projet.git
cd mon-projet

# 2. Installer les dépendances
npm install

# 3. Lancer en arrière-plan avec PM2 (tourne 24h/24)
pm2 start index.js --name "mon-app"`
  );
  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const [customOutput, setCustomOutput] = useState<{ stdout: string; stderr: string; success: boolean } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presets: ScriptPreset[] = [
    {
      id: 'node-pm2',
      title: 'Node.js 24/7 avec PM2',
      category: 'run',
      description: 'Démarre votre serveur Node.js et garantit qu\'il redémarre automatiquement s\'il plante ou si le VPS reboot.',
      icon: 'Layers',
      commands: [
        'npm install -g pm2',
        'pm2 start index.js --name "node-app"',
        'pm2 save',
        'pm2 startup',
      ],
    },
    {
      id: 'python-background',
      title: 'Script Python en tâche de fond',
      category: 'run',
      description: 'Exécute un script Python en tâche de fond avec nohup et redirige les logs dans app.log.',
      icon: 'FileCode',
      commands: [
        'nohup python3 app.py > app.log 2>&1 &',
        'echo "Script Python lancé en PID: $!"',
        'tail -n 10 app.log',
      ],
    },
    {
      id: 'docker-compose',
      title: 'Déployer avec Docker',
      category: 'run',
      description: 'Télécharge une image Docker et la fait tourner en arrière-plan avec politique de redémarrage permanent.',
      icon: 'Code2',
      commands: [
        'docker run -d --name mon-serveur --restart always -p 80:80 nginx:alpine',
        'docker ps',
      ],
    },
    {
      id: 'install-stack',
      title: 'Installation Stack Complète (Node 22 + Python 3 + Git + Curl)',
      category: 'setup',
      description: 'Met à jour les paquets apt et installe tous les outils indispensables pour héberger votre code.',
      icon: 'Cpu',
      needsSudo: true,
      commands: [
        'apt update && apt upgrade -y',
        'apt install -y curl git build-essential python3 python3-pip python3-venv',
        'curl -fsSL https://deb.nodesource.com/setup_22.x | bash -',
        'apt install -y nodejs',
        'node -v && npm -v && python3 --version',
      ],
    },
    {
      id: 'install-docker',
      title: 'Installation Rapide de Docker & Docker Compose',
      category: 'setup',
      description: 'Installe la dernière version officielle de Docker CE pour exécuter n\'importe quel conteneur.',
      icon: 'Code2',
      needsSudo: true,
      commands: [
        'curl -fsSL https://get.docker.com -o get-docker.sh',
        'sh get-docker.sh',
        'systemctl enable --now docker',
        'docker --version',
      ],
    },
    {
      id: 'secure-ufw',
      title: 'Sécuriser le VPS avec le Pare-feu UFW',
      category: 'security',
      description: 'Autorise uniquement le port SSH (22), HTTP (80) et HTTPS (443), puis bloque tout le reste.',
      icon: 'ShieldCheck',
      needsSudo: true,
      commands: [
        'ufw default deny incoming',
        'ufw default allow outgoing',
        'ufw allow 22/tcp',
        'ufw allow 80/tcp',
        'ufw allow 443/tcp',
        'ufw --force enable',
        'ufw status verbose',
      ],
    },
    {
      id: 'system-health',
      title: 'Bilan de santé & Ressources du Serveur',
      category: 'monitor',
      description: 'Affiche la charge CPU, l\'utilisation de la mémoire RAM, l\'espace disque et les 10 processus les plus lourds.',
      icon: 'Cpu',
      commands: [
        'echo "=== CHARGE DU SYSTÈME ===" && uptime',
        'echo "=== MÉMOIRE RAM ===" && free -m',
        'echo "=== ESPACE DISQUE ===" && df -h /',
        'echo "=== TOP PROCESSUS ===" && ps aux --sort=-%mem | head -n 10',
      ],
    },
  ];

  const filteredPresets = activeCategory === 'all'
    ? presets
    : presets.filter((p) => p.category === activeCategory);

  const handleRunPreset = (preset: ScriptPreset) => {
    const fullCommand = preset.commands.join(' && ');
    onRunInTerminal(fullCommand);
  };

  const handleCopyPreset = (preset: ScriptPreset) => {
    navigator.clipboard.writeText(preset.commands.join('\n'));
    setCopiedId(preset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteCustom = async () => {
    if (!customScript.trim()) return;

    if (isSandbox) {
      // In sandbox, run line by line in terminal
      onRunInTerminal(customScript.replace(/\n/g, ' && '));
      return;
    }

    if (onExecuteBatch && server) {
      setIsRunningCustom(true);
      setCustomOutput(null);
      try {
        const res = await onExecuteBatch(customScript);
        setCustomOutput({
          stdout: res.stdout || '',
          stderr: res.stderr || '',
          success: res.success,
        });
      } catch (err: any) {
        setCustomOutput({
          stdout: '',
          stderr: err.message,
          success: false,
        });
      } finally {
        setIsRunningCustom(false);
      }
    } else {
      onRunInTerminal(customScript.replace(/\n/g, ' && '));
    }
  };

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'all', label: 'Toutes les recettes' },
          { id: 'run', label: '🚀 Exécution 24h/24' },
          { id: 'setup', label: '⚙️ Installation stacks' },
          { id: 'monitor', label: '📊 Monitoring système' },
          { id: 'security', label: '🛡️ Sécurité & Pare-feu' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Script Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {preset.title}
                  </h3>
                </div>
                {preset.needsSudo && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                    sudo/root
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {preset.description}
              </p>

              {/* Commands preview */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                {preset.commands.map((cmd, i) => (
                  <div key={i} className="truncate">
                    <span className="text-emerald-500 mr-1.5">$</span>
                    {cmd}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleCopyPreset(preset)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedId === preset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le script</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleRunPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Exécuter dans le Terminal</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Script Editor */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Éditeur & Lanceur de Code Bash Personnalisé</h3>
          </div>
          <span className="text-xs text-slate-400">Exécution directe sur le serveur connecté</span>
        </div>

        <p className="text-xs text-slate-400">
          Collez ici vos commandes ou votre script de déploiement pour le faire exécuter immédiatement.
        </p>

        <textarea
          rows={6}
          value={customScript}
          onChange={(e) => setCustomScript(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
          placeholder="# Entrez vos commandes..."
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {isSandbox ? 'Mode actif: Bac à sable virtuel' : server ? `Cible: ${server.username}@${server.host}` : 'Aucun serveur connecté'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunInTerminal(customScript.replace(/\n/g, ' && '))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Envoyer au Terminal Interactif</span>
            </button>

            <button
              onClick={handleExecuteCustom}
              disabled={isRunningCustom || !customScript.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors"
            >
              {isRunningCustom ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exécution en cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lancer le Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Script Run Output */}
        {customOutput && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={customOutput.success ? 'text-emerald-400' : 'text-rose-400'}>
                {customOutput.success ? '✔ Script terminé avec succès' : '✖ Erreur lors de l\'exécution'}
              </span>
              <button
                onClick={() => setCustomOutput(null)}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Fermer
              </button>
            </div>
            {customOutput.stdout && (
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto bg-black/40 p-2 rounded">
                {customOutput.stdout}
              </pre>
            )}
            {customOutput.stderr && (
              <pre className="font-mono text-xs text-rose-300 whitespace-pre-wrap max-h-48 overflow-y-auto bg-rose-950/30 p-2 rounded border border-rose-900/40">
                {customOutput.stderr}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
