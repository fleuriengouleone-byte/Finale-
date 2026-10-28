export type AccountProtocol = 'vless' | 'vmess';

export type AccountStatus = 'active' | 'expired' | 'suspended' | 'pending' | 'error';

export type EngineSyncStatus = 'synced' | 'unconfigured' | 'pending_sync' | 'error' | 'disconnected_mode';

export interface ServerConnectionConfig {
  host: string;
  port: number;
  transport: 'ws' | 'tcp' | 'grpc';
  wsPath: string;
  security: 'tls' | 'none' | 'reality';
  sni: string;
  fingerprint: string;
  vmessAlterId?: number;
  vmessSecurity?: 'auto' | 'aes-128-gcm' | 'chacha20-poly1305' | 'none';
}

export interface VlessAccount {
  id: string;
  clientName: string;
  protocol: AccountProtocol;
  uuid: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  durationDays: number;
  trafficQuotaGb: number; // 0 = illimité
  trafficUsedGb: number; // Mesuré si disponible
  trafficUpBytes: number;
  trafficDownBytes: number;
  trafficMeasured: boolean; // false si le moteur ne fournit pas de compteur
  status: AccountStatus;
  engineSyncStatus: EngineSyncStatus;
  description?: string;
  serverConfig: ServerConnectionConfig;
  vlessLink?: string;
  vmessLink?: string;
}

export interface DashboardMetrics {
  totalAccounts: number;
  activeAccounts: number;
  expiredAccounts: number;
  suspendedAccounts: number;
  pendingAccounts: number;
  totalTrafficGb: number | null;
  trafficMeasurable: boolean;
  expiringSoonCount: number; // Expirant dans les 48h
  engineStatus: {
    state: 'connected' | 'disconnected_mode' | 'error';
    label: string;
    targetHost: string;
    lastPingMs?: number;
    lastPingStatus?: number;
  };
  databaseStatus: {
    type: 'firestore' | 'local_persistent';
    connected: boolean;
    label: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'ACCOUNT_CREATED' | 'ACCOUNT_EXTENDED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_ACTIVATED' | 'ACCOUNT_DELETED' | 'ACCOUNT_QUOTA_UPDATED' | 'EXPIRY_CHECK_RUN' | 'ADMIN_LOGIN' | 'ENGINE_PING' | 'SETTINGS_UPDATED';
  accountId?: string;
  clientName?: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  ip?: string;
}

export interface EngineSettings {
  targetHost: string;
  targetPort: number;
  targetIp?: string;
  targetPortNumber?: number;
  transport: 'ws' | 'tcp';
  wsPath: string;
  security: 'tls' | 'none';
  sni: string;
  fingerprint: string;
  mode: 'disconnected' | 'grpc_api';
  grpcEndpoint?: string;
  keepAliveIntervalMinutes: number;
  autoExpiryCheckMinutes: number;
}

export interface ConnectionProfile {
  id: string;
  name: string;
  isVerified: boolean;
  statusLabel: string;
  isDefault: boolean;
  protocol: AccountProtocol;
  address: string;
  host: string;
  port: number;
  transport: 'ws' | 'tcp' | 'grpc';
  wsPath: string;
  security: 'tls' | 'none' | 'reality';
  sni: string;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
}

export interface QuotaSummary {
  measurable: boolean;
  reason: string;
  totalAllocatedGb: number;
  totalUsedGb: number;
  unlimitedAccountsCount: number;
  cappedAccountsCount: number;
  exceededAccountsCount: number;
}

