import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CreateAccountView } from './components/CreateAccountView';
import { AccountsListView } from './components/AccountsListView';
import { StatisticsView } from './components/StatisticsView';
import { EngineSettingsView } from './components/EngineSettingsView';
import { AuditLogsView } from './components/AuditLogsView';
import { LoginModal } from './components/LoginModal';
import { AccountDetailsModal } from './components/AccountDetailsModal';
import { QrCodeModal } from './components/QrCodeModal';
import { ConnectionProfilesView } from './components/ConnectionProfilesView';
import { QuotasView } from './components/QuotasView';
import { VlessAccount, DashboardMetrics, AuditLogEntry, EngineSettings } from './types/vless';
import { buildVlessLink, buildVmessLink } from './utils/linkGenerators';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [accounts, setAccounts] = useState<VlessAccount[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<EngineSettings>({
    targetHost: 'montre-635195440423.us-central1.run.app',
    targetPort: 443,
    transport: 'ws',
    wsPath: '/Telegram/@AM2_D3/@AHMAD3214',
    security: 'tls',
    sni: 'crashlyticsreports-pa.googleapis.com',
    fingerprint: 'chrome',
    mode: 'disconnected',
    keepAliveIntervalMinutes: 5,
    autoExpiryCheckMinutes: 5,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<VlessAccount | null>(null);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; link: string; title: string; protocol: string }>({
    isOpen: false,
    link: '',
    title: '',
    protocol: '',
  });

  // Check auth and initial data load
  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    let token = localStorage.getItem('vless_token');

    // Auto-login with default admin token if none exists for seamless developer/user experience
    if (!token) {
      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'Admin@Vless2026' }),
        });
        const loginData = await loginRes.json();
        const autoToken = loginData?.token;
        if (loginData?.success && typeof autoToken === 'string') {
          token = autoToken;
          localStorage.setItem('vless_token', autoToken);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // ignore
      }
    } else if (token) {
      try {
        const authRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const authData = await authRes.json();
        setIsAuthenticated(Boolean(authData.authenticated));
      } catch (e) {
        setIsAuthenticated(false);
      }
    }

    await loadAllData();
  };

  const loadAllData = async () => {
    const token = localStorage.getItem('vless_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // 1. Dashboard metrics
      const dashRes = await fetch('/api/dashboard', { headers });
      const dashData = await dashRes.json();
      if (dashData.success && dashData.metrics) {
        setMetrics(dashData.metrics);
        if (dashData.metrics.serverConfig) {
          setSettings(dashData.metrics.serverConfig);
        }
      }

      // 2. Accounts list
      const accRes = await fetch('/api/accounts', { headers });
      const accData = await accRes.json();
      if (accData.success && accData.accounts) {
        setAccounts(accData.accounts);
      }

      // 3. Audit logs
      if (token) {
        const logsRes = await fetch('/api/logs', { headers });
        const logsData = await logsRes.json();
        if (logsData.success && logsData.logs) {
          setLogs(logsData.logs);
        }
      }

      // 4. Settings
      const setRes = await fetch('/api/settings', { headers });
      const setData = await setRes.json();
      if (setData.success && setData.settings) {
        setSettings(setData.settings);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  const handleRunExpiryCheck = async () => {
    const token = localStorage.getItem('vless_token');
    try {
      const res = await fetch('/api/expiry/run-check', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        await loadAllData();
        alert(`Vérification effectuée: ${data.result.expiredCount} compte(s) expiré(s) traité(s).`);
      }
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la vérification');
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<EngineSettings>) => {
    const token = localStorage.getItem('vless_token');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(newSettings),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Erreur sauvegarde');
    }
    setSettings(data.settings);
    await loadAllData();
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('vless_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('vless_token');
    }
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Responsive Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        metrics={metrics}
        onRefresh={loadAllData}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            accounts={accounts}
            recentLogs={logs}
            onNavigate={setCurrentTab}
            onRefresh={loadAllData}
            onRunExpiryCheck={handleRunExpiryCheck}
            onOpenCreate={() => setCurrentTab('create')}
            onSelectAccount={(acc) => {
              setSelectedAccount(acc);
            }}
          />
        )}

        {currentTab === 'create' && (
          <CreateAccountView
            onAccountCreated={() => {
              loadAllData();
            }}
            onCancel={() => setCurrentTab('all_accounts')}
          />
        )}

        {(currentTab === 'all_accounts' ||
          currentTab === 'active_accounts' ||
          currentTab === 'expired_accounts' ||
          currentTab === 'suspended_accounts') && (
          <AccountsListView
            accounts={accounts}
            initialStatusFilter={
              currentTab === 'active_accounts'
                ? 'active'
                : currentTab === 'expired_accounts'
                ? 'expired'
                : currentTab === 'suspended_accounts'
                ? 'suspended'
                : 'all'
            }
            onRefresh={loadAllData}
            onOpenCreate={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'profiles' && (
          <ConnectionProfilesView />
        )}

        {currentTab === 'quotas' && (
          <QuotasView accounts={accounts} onRefresh={loadAllData} />
        )}

        {currentTab === 'statistics' && (
          <StatisticsView metrics={metrics} accounts={accounts} />
        )}

        {currentTab === 'engine_settings' && (
          <EngineSettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRefreshStatus={loadAllData}
          />
        )}

        {currentTab === 'audit_logs' && (
          <AuditLogsView logs={logs} onRefresh={loadAllData} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            VLESS MANAGER © 2026 — Plateforme Cloud Run Indépendante (<code className="text-slate-400">vless-manager</code>)
          </p>
          <p className="text-[11px] text-slate-600">
            Région: <span className="text-cyan-400">us-central1</span> • Service cible <code className="text-slate-400">montre</code> protégé
          </p>
        </div>
      </footer>

      {/* Account Details Modal */}
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onOpenQr={(link, title, protocol) => {
            setSelectedAccount(null);
            setQrModalData({ isOpen: true, link, title, protocol });
          }}
        />
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ ...qrModalData, isOpen: false })}
        title={qrModalData.title}
        linkText={qrModalData.link}
        protocol={qrModalData.protocol}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          loadAllData();
        }}
      />
    </div>
  );
}
