/**
 * Realistic Linux terminal sandbox for instant testing without a real VPS
 */
export class MockLinuxSandbox {
  private currentDir: string = '/home/ubuntu';
  private files: Record<string, string> = {
    '/home/ubuntu/README.md': '# Bienvenue sur votre VPS virtuel (Mode Bac à sable)\nVous pouvez tester des commandes comme:\n- git clone https://github.com/example/mon-projet.git\n- node index.js\n- python3 app.py\n- pm2 status\n- docker ps\n- htop\n- free -m\n- df -h\n',
    '/home/ubuntu/app.py': 'import time\nprint("Serveur Python en écoute...")\nfor i in range(5):\n    print(f"Traitement job #{i}...")\n    time.sleep(1)\nprint("Terminé !")\n',
    '/home/ubuntu/index.js': 'console.log("🚀 Application Node.js démarrée sur le port 3000");\n',
    '/home/ubuntu/package.json': '{\n  "name": "mon-app-vps",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}\n',
  };
  private pm2Processes: Array<{ name: string; id: number; status: string; uptime: string; memory: string }> = [];

  constructor() {}

  public getPrompt(): string {
    const dirDisplay = this.currentDir === '/home/ubuntu' ? '~' : this.currentDir;
    return `ubuntu@vps-cloud:${dirDisplay}$ `;
  }

  public execute(rawCommand: string): string {
    const trimmed = rawCommand.trim();
    if (!trimmed) return '';

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'clear':
        return '__CLEAR__';

      case 'help':
        return `\x1b[36mCommandes disponibles dans le bac à sable :\x1b[0m
  \x1b[32mls, cd, pwd, cat, touch, rm, mkdir\x1b[0m   - Gestion des fichiers
  \x1b[32mpython3 [script.py]\x1b[0m                  - Exécuter du code Python
  \x1b[32mnode [fichier.js], npm start\x1b[0m         - Exécuter du code JavaScript/Node
  \x1b[32mpm2 [start|list|stop|logs]\x1b[0m           - Gestionnaire de processus de fond
  \x1b[32mdocker [ps|run|images]\x1b[0m               - Conteneurs Docker
  \x1b[32mfree, df, uptime, uname, whoami\x1b[0m      - Statistiques système
  \x1b[32mcurl, ping, git\x1b[0m                       - Outils réseau et versioning
  \x1b[33m💡 Pour connecter votre vrai serveur VPS, cliquez sur "Nouveau Serveur" en haut.\x1b[0m`;

      case 'pwd':
        return this.currentDir;

      case 'whoami':
        return 'ubuntu';

      case 'uname':
        if (args.includes('-a')) {
          return 'Linux vps-cloud 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
        }
        return 'Linux';

      case 'uptime':
        return ' 11:24:02 up 14 days,  3:18,  1 user,  load average: 0.12, 0.08, 0.05';

      case 'free':
        return `               total        used        free      shared  buff/cache   available
Mem:            3912         845        2104          32         963        2845
Swap:           2047           0        2047`;

      case 'df':
        return `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/root       40124320   9421804  28634884  25% /
udev             1982300         0   1982300   0% /dev
tmpfs             400652       948    399704   1% /run`;

      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const long = args.includes('-l') || args.includes('-la') || args.includes('-al');

        const inThisDir = Object.keys(this.files)
          .filter(path => path.startsWith(this.currentDir + '/'))
          .map(path => path.substring(this.currentDir.length + 1))
          .filter(file => !file.includes('/'));

        if (long) {
          let out = 'total ' + (inThisDir.length * 4) + '\n';
          if (showAll) {
            out += 'drwxr-xr-x 4 ubuntu ubuntu 4096 Oct 18 10:00 .\n';
            out += 'drwxr-xr-x 3 root   root   4096 Oct  4 08:30 ..\n';
          }
          inThisDir.forEach(file => {
            out += `-rw-r--r-- 1 ubuntu ubuntu  ${this.files[this.currentDir + '/' + file].length} Oct 18 10:15 ${file}\n`;
          });
          return out.trim();
        }

        return inThisDir.join('   ');
      }

      case 'cat': {
        if (!args[0]) return 'cat: argument manquant';
        const target = args[0].startsWith('/') ? args[0] : `${this.currentDir}/${args[0]}`;
        if (this.files[target]) {
          return this.files[target];
        }
        return `cat: ${args[0]}: Aucun fichier ou dossier de ce type`;
      }

      case 'cd': {
        const dest = args[0] || '~';
        if (dest === '~' || dest === '/home/ubuntu') {
          this.currentDir = '/home/ubuntu';
          return '';
        }
        if (dest === '..') {
          this.currentDir = '/home';
          return '';
        }
        if (dest === '/' || dest === '/var' || dest === '/etc') {
          this.currentDir = dest;
          return '';
        }
        return `bash: cd: ${dest}: Aucun dossier de ce type`;
      }

      case 'python3':
      case 'python': {
        if (!args[0]) {
          return 'Python 3.12.3 (main, Apr 10 2024)\n[GCC 13.2.0] on linux\n(Utilisez python3 <fichier.py> pour exécuter un script)';
        }
        if (args[0].endsWith('.py')) {
          return `\x1b[32m[Python 3.12]\x1b[0m Démarrage de ${args[0]}...
Serveur Python en écoute...
Traitement job #0...
Traitement job #1...
Traitement job #2...
\x1b[32m✔ Exécution terminée avec succès (code 0)\x1b[0m`;
        }
        return `python3: impossible d'ouvrir le fichier '${args[0]}': Fichier introuvable`;
      }

      case 'node': {
        if (!args[0]) {
          return 'Welcome to Node.js v22.11.0.\nType ".help" for more information.';
        }
        return `\x1b[32m[Node.js v22.11.0]\x1b[0m
🚀 Application Node.js démarrée sur le port 3000
Serveur HTTP actif et prêt à recevoir des requêtes.`;
      }

      case 'npm': {
        if (args[0] === 'start') {
          return `> mon-app-vps@1.0.0 start
> node index.js

🚀 Application Node.js démarrée sur le port 3000`;
        }
        if (args[0] === 'install' || args[0] === 'i') {
          return `added 42 packages, and audited 43 packages in 1.4s
found 0 vulnerabilities`;
        }
        return `npm version 10.8.2`;
      }

      case 'pm2': {
        if (args[0] === 'start') {
          const app = args[1] || 'index.js';
          this.pm2Processes.push({
            name: app.replace('.js', '').replace('.py', ''),
            id: this.pm2Processes.length,
            status: 'online',
            uptime: '0s',
            memory: '34.2mb'
          });
          return `\x1b[32m[PM2]\x1b[0m Script ${app} lancé avec succès en arrière-plan !
┌─────┬──────────────┬─────────────┬─────────┬──────────┬──────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status   │ cpu      │ memory   │
├─────┼──────────────┼─────────────┼─────────┼──────────┼──────────┼──────────┤
│ 0   │ ${app}       │ fork        │ 0       │ \x1b[32monline\x1b[0m   │ 0%       │ 34.2mb   │
└─────┴──────────────┴─────────────┴─────────┴──────────┴──────────┴──────────┘
\x1b[36m💡 Astuce : Votre code tourne désormais 24/7 en arrière-plan même après déconnexion !\x1b[0m`;
        }

        if (args[0] === 'list' || args[0] === 'status') {
          return `┌─────┬──────────────┬─────────────┬─────────┬──────────┬──────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status   │ cpu      │ memory   │
├─────┼──────────────┼─────────────┼─────────┼──────────┼──────────┼──────────┤
│ 0   │ bot-service  │ fork        │ 0       │ \x1b[32monline\x1b[0m   │ 0.2%     │ 48.1mb   │
│ 1   │ api-gateway  │ cluster     │ 0       │ \x1b[32monline\x1b[0m   │ 0.1%     │ 62.4mb   │
└─────┴──────────────┴─────────────┴─────────┴──────────┴──────────┴──────────┘`;
        }

        return `PM2 v5.3.1 - Process Manager`;
      }

      case 'docker': {
        if (args[0] === 'ps') {
          return `CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES
c3f12a84b910   nginx:alpine   "/docker-entrypoint.…"   2 hours ago     Up 2 hours     0.0.0.0:80->80/tcp     web-server
7d29e31ba801   redis:7-alpine "docker-entrypoint.s…"   5 hours ago     Up 5 hours     0.0.0.0:6379->6379/tcp cache-redis`;
        }
        if (args[0] === 'run') {
          return `Unable to find image '${args[args.length - 1]}' locally
latest: Pulling from library/${args[args.length - 1]}
Digest: sha256:4b1b38e...
Status: Downloaded newer image
48f98a21e7b99c82410a8b9e18192a`;
        }
        return `Docker version 27.1.1, build 6312585`;
      }

      case 'git': {
        if (args[0] === 'clone') {
          return `Cloning into '${args[1]?.split('/').pop()?.replace('.git', '') || 'repo'}'...
remote: Enumerating objects: 124, done.
remote: Counting objects: 100% (124/124), done.
remote: Compressing objects: 100% (82/82), done.
remote: Total 124 (delta 42), reused 110 (delta 28)
Receiving objects: 100% (124/124), 2.14 MiB | 8.20 MiB/s, done.
Resolving deltas: 100% (42/42), done.
\x1b[32m✔ Dépôt cloné avec succès !\x1b[0m`;
        }
        return `git version 2.43.0`;
      }

      case 'curl': {
        return `HTTP/1.1 200 OK\nDate: Sun, 18 Oct 2026 11:25:00 GMT\nContent-Type: application/json\n\n{"status": "ok", "message": "Service opérationnel"}`;
      }

      case 'htop':
      case 'top': {
        return `\x1b[36mTasks: 112 total, 1 running, 111 sleeping\x1b[0m
\x1b[32mCPU[|||||||                    14.2%]\x1b[0m   Tasks: 4 threads
\x1b[34mMem[||||||||||||||            845/3912MB]\x1b[0m  Swp[ 0/2047MB]

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 1420 ubuntu     20   0  782M   48M   22M S  0.5  1.2  0:42.12 node index.js
 1982 ubuntu     20   0  620M   36M   18M S  0.2  0.9  0:18.04 python3 app.py
  841 root       20   0  912M   88M   45M S  0.0  2.2  1:02.89 dockerd
    1 root       20   0  168M   12M    8M S  0.0  0.3  0:04.18 /sbin/init`;
      }

      default:
        return `bash: ${cmd}: commande introuvable (tapez 'help' pour voir la liste des commandes du bac à sable)`;
    }
  }
}
