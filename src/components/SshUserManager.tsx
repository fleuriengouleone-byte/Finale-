import React, { useState, useEffect } from 'react';
import { 
  Key, 
  UserCheck, 
  UserPlus, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SshCredentials } from '../types/ssh';

interface SshUserManagerProps {
  onQuickConnect: (creds: SshCredentials) => void;
}

export const SshUserManager: React.FC<SshUserManagerProps> = ({ onQuickConnect }) => {
  const [users, setUsers] = useState<Array<{ username: string; password: string }>>([
    { username: 'dev', password: 'vps2026!' },
    { username: 'root', password: 'rootpassword!' },
  ]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'embedded' | 'background_methods' | 'linux_command'>('embedded');

  useEffect(() => {
    fetch('/api/embedded-ssh/info')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.users) {
          setUsers(data.users);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    try {
      const res = await fetch('/api/embedded-ssh/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        setNewUsername('');
        setNewPassword('');
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
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Identifiants SSH pour tester & Garder votre code actif en arrière-plan
              </h2>
              <p className="text-xs text-slate-300">
                Voici les paramètres prêts à l'emploi et la marche à suivre pour faire tourner vos programmes 24h/24.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Serveur SSH actif · Port 2222
          </span>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('embedded')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'embedded'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paramètres SSH pour Tester Ici</span>
        </button>

        <button
          onClick={() => setActiveTab('background_methods')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'background_methods'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Faire tourner en arrière-plan (24h/24)</span>
        </button>

        <button
          onClick={() => setActiveTab('linux_command')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'linux_command'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Créer un utilisateur sur un VPS externe</span>
        </button>
      </div>

      {/* Tab 1: Embedded SSH server credentials */}
      {activeTab === 'embedded' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Paramètres de connexion du serveur SSH intégré
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Utilisez ces paramètres dans la console pour tester une vraie session SSH Linux immédiatement.
                </p>
              </div>
            </div>

            {/* Credentials Card Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400">Hôte (Host)</span>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">127.0.0.1</div>
                <span className="text-[10px] text-slate-500 font-mono">(ou localhost)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400">Port SSH</span>
                <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">2222</div>
                <span className="text-[10px] text-slate-500 font-mono">Port test dédié</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400">Utilisateur par défaut</span>
                <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">dev</div>
                <span className="text-[10px] text-slate-500 font-mono">Accès shell standard</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400">Mot de passe par défaut</span>
                <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">vps2026!</div>
                <span className="text-[10px] text-slate-500 font-mono">Modifiable ci-dessous</span>
              </div>
            </div>

            {/* One-click quick connect buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Envie de tester sans rien taper ?
              </span>
              <button
                onClick={() =>
                  onQuickConnect({
                    name: 'Serveur Test Local',
                    host: '127.0.0.1',
                    port: 2222,
                    username: 'dev',
                    authType: 'password',
                    password: 'vps2026!',
                  })
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Se connecter en 1 clic au serveur SSH de test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Create custom SSH user form */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Créer un utilisateur SSH supplémentaire</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajoutez vos propres identifiants pour tester l'authentification avec le nom et mot de passe de votre choix.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300">Nom d'utilisateur</label>
                <input
                  type="text"
                  required
                  placeholder="ex: mon_utilisateur"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300">Mot de passe SSH</label>
                <input
                  type="text"
                  required
                  placeholder="ex: MonMotDePasse123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                >
                  Ajouter cet utilisateur
                </button>
              </div>
            </form>

            {/* List of active test users */}
            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Utilisateurs configurés prêts à la connexion :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono"
                  >
                    <div>
                      <span className="text-slate-400">User:</span>{' '}
                      <span className="text-white font-semibold">{u.username}</span>
                      <span className="text-slate-500 mx-2">|</span>
                      <span className="text-slate-400">Pass:</span>{' '}
                      <span className="text-purple-300">{u.password}</span>
                    </div>

                    <button
                      onClick={() =>
                        onQuickConnect({
                          name: `Test (${u.username})`,
                          host: '127.0.0.1',
                          port: 2222,
                          username: u.username,
                          authType: 'password',
                          password: u.password,
                        })
                      }
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-[11px] text-slate-300 hover:text-white transition-colors"
                    >
                      Connecter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: How to keep code running in the background */}
      {activeTab === 'background_methods' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Comment faire tourner son code en arrière-plan (24h/24)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sur Linux, quand vous fermez votre session SSH, le terminal tue normalement tous les processus en cours. Voici les 3 commandes universelles pour que votre code <strong className="text-emerald-400">continue de tourner indéfiniment en tâche de fond</strong> :
            </p>
          </div>

          {/* Method 1: nohup */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
                  Méthode 1
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  La commande 'nohup' (Universelle, sans rien installer)
                </span>
              </div>
              <button
                onClick={() => handleCopy('nohup python3 mon_script.py > logs.txt 2>&1 &', 'nohup')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedKey === 'nohup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copier</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 select-all">
              nohup python3 mon_script.py &gt; logs.txt 2&gt;&amp;1 &amp;
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p><strong>Ce que fait chaque partie :</strong></p>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-300">
                <li><code className="text-sky-300">nohup</code> : empêche le système de couper le script à la déconnexion.</li>
                <li><code className="text-sky-300">&gt; logs.txt 2&gt;&amp;1</code> : redirige tous les affichages et erreurs dans un fichier.</li>
                <li><code className="text-sky-300">&amp;</code> : lance le programme en tâche de fond et rend la main au terminal.</li>
              </ul>
              <div className="pt-1">
                <span className="text-[11px] text-slate-400">Pour voir les logs en direct : </span>
                <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded text-[11px]">tail -f logs.txt</code>
              </div>
            </div>
          </div>

          {/* Method 2: PM2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Méthode 2 (Recommandée)
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  PM2 (Redémarrage automatique si crash ou reboot du VPS)
                </span>
              </div>
              <button
                onClick={() => handleCopy('npm install -g pm2 && pm2 start mon_script.py --name "mon-job" && pm2 save', 'pm2')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedKey === 'pm2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copier</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 space-y-1 select-all">
              <div># 1. Lancer votre script (Node.js ou Python) :</div>
              <div className="text-white">pm2 start mon_script.py --name "mon-job"</div>
              <div className="text-slate-400"># 2. Sauvegarder pour qu'il redémarre si le serveur redémarre :</div>
              <div className="text-white">pm2 save && pm2 startup</div>
              <div className="text-slate-400"># 3. Voir les logs ou l'état :</div>
              <div className="text-white">pm2 status && pm2 logs</div>
            </div>
          </div>

          {/* Method 3: Screen / Tmux */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-800">
                  Méthode 3
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Screen ou Tmux (Terminal virtuel détachable)
                </span>
              </div>
              <button
                onClick={() => handleCopy('screen -S mon_job\npython3 mon_script.py\n# Ctrl+A puis D pour détacher', 'screen')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedKey === 'screen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copier</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-1">
              <div><span className="text-purple-400">screen -S mon_job</span> <span className="text-slate-500"># Crée un terminal permanent</span></div>
              <div><span className="text-emerald-400">python3 mon_script.py</span> <span className="text-slate-500"># Lancez votre script</span></div>
              <div className="text-amber-300">Appuyez sur Ctrl+A puis D pour détacher la session et la laisser tourner.</div>
              <div><span className="text-sky-400">screen -r mon_job</span> <span className="text-slate-500"># Pour revenir voir à tout moment !</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: How to create a user on an external Linux machine */}
      {activeTab === 'linux_command' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Comment créer un utilisateur SSH sur votre vrai serveur Linux distant</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Si vous êtes sur un serveur Ubuntu, Debian ou GitHub Codespaces et souhaitez créer un utilisateur dédié avec mot de passe accessible depuis cette console :
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 space-y-2">
            <div>
              <span className="text-slate-500"># 1. Créer le nouvel utilisateur :</span>
              <div className="text-emerald-400 mt-0.5">sudo adduser nom_utilisateur</div>
            </div>
            <div>
              <span className="text-slate-500"># 2. Lui donner les droits sudo (administrateur) :</span>
              <div className="text-emerald-400 mt-0.5">sudo usermod -aG sudo nom_utilisateur</div>
            </div>
            <div>
              <span className="text-slate-500"># 3. S'assurer que SSH autorise les mots de passe :</span>
              <div className="text-emerald-400 mt-0.5">echo "PasswordAuthentication yes" | sudo tee -a /etc/ssh/sshd_config.d/auth.conf</div>
            </div>
            <div>
              <span className="text-slate-500"># 4. Redémarrer le service SSH :</span>
              <div className="text-emerald-400 mt-0.5">sudo systemctl restart ssh</div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Une fois fait, renseignez l'IP de votre serveur, l'utilisateur et le mot de passe dans le bouton <strong className="text-white">« Connecter un VPS »</strong> pour ouvrir votre session !
          </p>
        </div>
      )}
    </div>
  );
};
