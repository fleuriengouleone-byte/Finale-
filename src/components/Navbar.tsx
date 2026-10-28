import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Server,
  HardDrive,
  BarChart3,
  ServerCog,
  FileText,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Radio,
  Lock,
  Download,
} from 'lucide-react';
import { DashboardMetrics } from '../types/vless';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  metrics: DashboardMetrics | null;
  onRefresh: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  onRefresh,
  onLogout,
  isAuthenticated,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 12 Menu items requested by the user
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'create', label: 'Créer un compte', icon: UserPlus },
    { id: 'all_accounts', label: 'Tous les comptes', icon: Users, badge: metrics?.totalAccounts },
    { id: 'active_accounts', label: 'Comptes actifs', icon: UserCheck, badge: metrics?.activeAccounts, badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'expired_accounts', label: 'Comptes expirés', icon: UserX, badge: metrics?.expiredAccounts, badgeColor: 'bg-rose-500/20 text-rose-400' },
    { id: 'suspended_accounts', label: 'Comptes suspendus', icon: UserMinus, badge: metrics?.suspendedAccounts, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'profiles', label: 'Profils de connexion', icon: Server },
    { id: 'quotas', label: 'Quotas', icon: HardDrive },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'engine_settings', label: 'Paramètres', icon: ServerCog },
    { id: 'audit_logs', label: 'Journaux', icon: FileText },
  ];


  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  const isEngineOk = metrics?.engineStatus?.state === 'connected' || metrics?.engineStatus?.state === 'disconnected_mode';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-900/30 border border-cyan-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  VLESS MANAGER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Cloud Run
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestion des comptes VLESS / VMess
              </p>
            </div>
          </div>

          {/* Engine Status pill on header */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isEngineOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300 font-medium">Service montre :</span>
              <span className="text-slate-400 truncate max-w-[180px]">montre-635195440423.us-central1</span>
              {metrics?.engineStatus?.lastPingMs && (
                <span className="text-emerald-400 font-mono text-[11px]">
                  {metrics.engineStatus.lastPingMs}ms
                </span>
              )}
            </div>

            <a
              href="/vless-manager.zip"
              download="vless-manager.zip"
              title="Télécharger l'archive complète du projet (.zip)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger ZIP</span>
            </a>

            <button
              onClick={onRefresh}
              title="Rafraîchir les données"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Connexion Admin</span>
              </button>
            )}
          </div>


          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Primary Nav Bar */}
        <nav className="hidden lg:flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="p-3 mb-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isEngineOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="font-semibold text-slate-200">Service Cloud Run :</span>
              <span className="text-emerald-400 font-mono">{metrics?.engineStatus?.lastPingMs || '~120'}ms</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              montre-635195440423.us-central1.run.app
            </p>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-2 space-y-2">
            <a
              href="/vless-manager.zip"
              download="vless-manager.zip"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le code ZIP (.zip)</span>
            </a>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cyan-600 text-white text-sm font-bold shadow-md shadow-cyan-900/40"
              >
                <Lock className="w-4 h-4" />
                <span>Connexion Administrateur</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
