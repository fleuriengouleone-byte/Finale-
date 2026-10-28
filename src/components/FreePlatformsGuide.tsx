import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Smartphone, 
  Terminal, 
  Server, 
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  Globe
} from 'lucide-react';

export const FreePlatformsGuide: React.FC = () => {
  const platforms = [
    {
      name: "1. Hugging Face Spaces (Le Meilleur pour Python)",
      badge: "100% Gratuit · Sans CB",
      specs: "2 vCPU · 16 Go RAM · Tourne 24h/24",
      description: "La solution n°1 au monde pour héberger du code Python sans aucune carte bancaire. Aucune vérification de paiement n'est demandée.",
      idealFor: "Scripts Python, Bots (Telegram/Discord), API FastAPI, Traitement de données, IA",
      url: "https://huggingface.co/spaces",
      steps: [
        "Créez un compte gratuit sur huggingface.co avec votre simple adresse email.",
        "Cliquez sur 'Create new Space'. Donnez-lui un nom.",
        "Choisissez SDK 'Gradio', 'Streamlit' ou 'Docker' (ou Blank).",
        "Ajoutez vos fichiers ('app.py' et 'requirements.txt') directement dans l'interface web.",
        "Votre script tourne immédiatement en ligne 24h/24 !",
      ],
    },
    {
      name: "2. GitHub Codespaces (Machine Linux Complète)",
      badge: "60h gratuites / mois · Sans CB",
      specs: "2 à 4 cœurs · Machine Ubuntu Linux complète avec accès Root",
      description: "Chaque compte GitHub dispose de 60 heures gratuites par mois sur des machines Linux hébergées par Microsoft Azure, sans aucune carte de crédit.",
      idealFor: "Lancer n'importe quel code (Python, Node, C++, Docker, Go), cloner un repo, tester un serveur avec des ports ouverts",
      url: "https://github.com/codespaces",
      steps: [
        "Rendez-vous sur github.com/codespaces avec votre compte GitHub.",
        "Cliquez sur 'New codespace' ou 'Blank template'.",
        "Un terminal Linux Ubuntu avec VS Code s'ouvre directement dans votre navigateur.",
        "Vous avez les pleins droits root (sudo) pour installer et exécuter ce que vous voulez !",
      ],
    },
    {
      name: "3. Google Cloud Shell (Terminal Linux dans le navigateur)",
      badge: "50h gratuites / semaine · Sans CB",
      specs: "5 Go de disque persistant · Debian Linux",
      description: "Accessible avec n'importe quel compte Google (Gmail standard). Aucun abonnement ni carte bancaire requis.",
      idealFor: "Exécuter des scripts shell, tester des programmes Python/Node, manipuler des fichiers",
      url: "https://shell.cloud.google.com",
      steps: [
        "Ouvrez shell.cloud.google.com et connectez-vous avec votre compte Gmail.",
        "Vous obtenez immédiatement un terminal Linux Debian interactif gratuit.",
        "Installez vos paquets et lancez vos scripts directement en ligne de commande.",
      ],
    },
    {
      name: "4. Render.com (Services Web & API)",
      badge: "Formule gratuite · Sans CB",
      specs: "0.5 CPU · 512 Mo RAM · Certificat HTTPS auto",
      description: "Plateforme cloud moderne qui permet de déployer des applications Node.js, Python, Go ou Docker sans renseigner de carte bancaire.",
      idealFor: "Serveurs web Express, Flask, FastAPI, petits microservices",
      url: "https://render.com",
      steps: [
        "Inscrivez-vous sur render.com en vous connectant simplement avec votre compte GitHub.",
        "Cliquez sur 'New Web Service' et sélectionnez votre dépôt GitHub.",
        "Render compile et lance votre code automatiquement avec une URL publique en https.",
      ],
    },
    {
      name: "5. Glitch.com (Node.js & Bots)",
      badge: "100% Gratuit · Sans CB",
      specs: "Environnement Node.js instantané",
      description: "Créez et hébergez des applications Node.js directement dans le navigateur en quelques secondes.",
      idealFor: "Bots Discord, APIs Node.js rapides, prototypes",
      url: "https://glitch.com",
      steps: [
        "Allez sur glitch.com et cliquez sur 'New Project'.",
        "L'éditeur s'ouvre avec un terminal et votre code tourne en direct.",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Où lancer du code sans carte de crédit (100% Gratuit)
            </h2>
            <p className="text-xs text-slate-400">
              La plupart des hébergeurs classiques (AWS, GCP, DigitalOcean) demandent une carte bancaire même pour leurs offres gratuites. Voici les alternatives fiables qui ne demandent <strong className="text-emerald-400">strictement aucune carte de crédit</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Platforms List */}
      <div className="space-y-4">
        {platforms.map((p, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">{p.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {p.badge}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">{p.specs}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

            <div className="text-xs text-slate-400">
              <strong className="text-slate-200">Idéal pour :</strong> {p.idealFor}
            </div>

            {/* How to deploy steps */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                Comment démarrer en 2 minutes :
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed">
                {p.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-end pt-2">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>Accéder au site officiel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}

        {/* Bonus Tip: Android Phone as VPS */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Astuce Bonus : Transformer votre smartphone Android en VPS 24h/24 (0€, zéro carte)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Si vous avez un vieux téléphone Android branché chez vous sur votre box Wifi, vous possédez déjà un serveur Linux complet et gratuit :
          </p>
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono space-y-1 text-slate-300">
            <div>1. Installez l'application gratuite <span className="text-purple-400 font-semibold">Termux</span> (depuis F-Droid ou GitHub).</div>
            <div>2. Tapez : <span className="text-emerald-400">pkg update && pkg install python nodejs git openssh</span></div>
            <div>3. Lancez votre script : <span className="text-emerald-400">python mon_script.py</span></div>
            <div>4. Votre script tourne en continu sans dépendre de personne et sans jamais payer !</div>
          </div>
        </div>
      </div>
    </div>
  );
};
