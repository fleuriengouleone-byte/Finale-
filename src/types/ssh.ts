export interface SshCredentials {
  id?: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'privateKey';
  password?: string;
  privateKey?: string;
  passphrase?: string;
  isSandbox?: boolean;
  createdAt?: number;
}

export interface TerminalEntry {
  id: string;
  timestamp: string;
  type: 'input' | 'output' | 'system' | 'error' | 'success';
  content: string;
}

export interface ScriptPreset {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'run' | 'monitor' | 'security';
  commands: string[];
  icon: string;
  needsSudo?: boolean;
}

export interface ServerStats {
  osName: string;
  uptime: string;
  cpuLoad: string;
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    percentage: number;
  };
  disk: {
    total: string;
    used: string;
    available: string;
    percentage: number;
    mount: string;
  };
  dockerRunning?: boolean;
}
