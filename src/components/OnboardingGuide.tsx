import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  Play, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Key
} from 'lucide-react';

interface OnboardingGuideProps {
  onStartSandbox: () => void;
  onOpenConnect: () => void;
  onSelectScriptPreset?: (presetId: string) => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  onStartSandbox,
  onOpenConnect,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: "1. Obtenir un serveur VPS",
      subtitle: "Si vous n'avez pas encore de serveur dédié ou cloud",
      icon: Server,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Un <strong className="text-white">VPS (Serveur Privé Virtuel)</strong> est une machine Linux distante qui tourne 24h/24 dans un datacenter. Vous pouvez en louer un pour quelques euros par mois auprès de :
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { name: "OVHcloud", desc: "France & Europe", price: "~3€/mois" },
              { name: "Hetzner", desc: "Très rapide & abordable", price: "~4€/mois" },
              { name: "Scaleway", desc: "Cloud français", price: "~3€/mois" },
              { name: "DigitalOcean", desc: "Idéal pour développeurs", price: "~4$/mois" },
            ].map((prov) => (
              <div key={prov.name} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div className="font-semibold text-white">{prov.name}</div>
                <div className="text-slate-400 text-[11px]">{prov.desc}</div>
                <div className="text-emerald-400 mt-1 font-mono text-[11px]">{prov.price}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Lors de la création, choisissez le système d'exploitation <strong className="text-slate-200">Ubuntu 24.04 LTS</strong> ou <strong className="text-slate-200">Debian 12</strong> (les plus simples et recommandés).
          </p>
        </div>
      ),
    },
    {
      step: 2,
      title: "2. Récupérer vos identifiants de connexion",
      subtitle: "Envoyés par email ou visibles dans la console de l'hébergeur",
      icon: Key,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Pour se connecter en SSH, vous avez besoin de 4 informations fournies par votre hébergeur :
          </p>
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Adresse IP :</span>
              <span className="text-amber-400 font-semibold">Ex: 51.159.23.42 (ou un nom de domaine)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Port :</span>
              <span className="text-emerald-400 font-semibold">22 (port standard SSH)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Utilisateur :</span>
              <span className="text-sky-400 font-semibold">root (ou ubuntu / debian)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mot de passe ou Clé :</span>
              <span className="text-purple-400 font-semibold">Mot de passe reçu par mail ou clé SSH .pem</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            ⚠️ <span className="text-amber-300 font-medium">Important :</span> Vérifiez dans le panneau de votre hébergeur que le pare-feu autorise les connexions entrantes sur le <strong>Port 22</strong> (règle SSH par défaut).
          </p>
        </div>
      ),
    },
    {
      step: 3,
      title: "3. Se connecter directement ici",
      subtitle: "Console web sécurisée intégrée dans votre navigateur",
      icon: Terminal,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Vous n'avez pas besoin d'installer PuTTY ou de configurer un terminal complexe sur votre ordinateur :
          </p>
          <ul className="space-y-2 list-disc list-inside text-xs text-slate-300">
            <li>Cliquez sur <strong className="text-white">"Connecter un serveur"</strong> en haut de l'écran.</li>
            <li>Saisissez l'adresse IP et votre mot de passe (ou clé privée).</li>
            <li>Vous aurez accès instantanément au shell complet de votre serveur distant !</li>
          </ul>
          <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg text-xs text-sky-200">
            💡 <strong>Pas encore de VPS sous la main ?</strong> Vous pouvez cliquer immédiatement sur <em>"Lancer le Bac à sable"</em> pour tester les commandes sans aucun risque !
          </div>
        </div>
      ),
    },
    {
      step: 4,
      title: "4. Lancer et pérenniser votre code (24h/24)",
      subtitle: "Comment faire tourner votre bot, site ou script en continu",
      icon: Play,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Lorsque vous lancez un script normalement (<code className="bg-slate-800 px-1 py-0.5 rounded text-white">python3 bot.py</code>), il s'arrête si vous fermez votre navigateur.
          </p>
          <p className="text-xs text-slate-300">
            Pour que votre code tourne <strong className="text-emerald-400">24h/24 sans interruption</strong> même après déconnexion, utilisez l'un de ces 3 outils :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <div className="font-semibold text-emerald-400">PM2 (Recommandé)</div>
              <div className="text-[11px] text-slate-400 mt-1">Pour Node.js & Python. Redémarre tout seul en cas de crash ou reboot.</div>
              <code className="block mt-2 text-[10px] bg-slate-950 p-1 rounded text-slate-300 font-mono">pm2 start script.py</code>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <div className="font-semibold text-sky-400">Tmux / Screen</div>
              <div className="text-[11px] text-slate-400 mt-1">Crée un terminal virtuel permanent détachable.</div>
              <code className="block mt-2 text-[10px] bg-slate-950 p-1 rounded text-slate-300 font-mono">tmux new -s mon-bot</code>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <div className="font-semibold text-purple-400">Docker</div>
              <div className="text-[11px] text-slate-400 mt-1">Isole l'application dans un conteneur avec redémarrage auto.</div>
              <code className="block mt-2 text-[10px] bg-slate-950 p-1 rounded text-slate-300 font-mono">docker run -d --restart always</code>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            👉 Tous ces modèles de démarrage sont préconfigurés dans l'onglet <strong className="text-slate-200">"Scripts en 1 clic"</strong> de cette application !
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Où partir pour lancer du code sur un VPS SSH ?
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Guide pas-à-pas pour débuter, configurer vos accès et faire tourner vos applications à distance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onStartSandbox}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tester le Bac à sable</span>
          </button>

          <button
            onClick={onOpenConnect}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm shadow-emerald-900/40"
          >
            <Server className="w-4 h-4" />
            <span>Connecter mon VPS</span>
          </button>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`flex items-start gap-2.5 p-3 rounded-lg text-left transition-all border ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  Étape {item.step}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{item.title.replace(/^\d+\.\s*/, '')}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Content */}
      <div className="mt-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-white">
              {steps[activeStep - 1].title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {steps[activeStep - 1].subtitle}
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activeStep} / 4
          </span>
        </div>

        {steps[activeStep - 1].content}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-3 py-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            ← Étape précédente
          </button>

          {activeStep < 4 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              <span>Suivant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenConnect}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              <span>Lancer la connexion maintenant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
