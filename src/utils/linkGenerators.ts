import { VlessAccount, ServerConnectionConfig } from '../types/vless';

/**
 * Valide un format UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Génère un UUID v4 cryptographiquement sûr
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback si crypto.randomUUID n'est pas dispo
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Construit un lien VLESS conforme aux spécifications Xray / V2Ray
 */
export function buildVlessLink(account: {
  uuid: string;
  clientName: string;
  serverConfig: ServerConnectionConfig;
}): string {
  const { uuid, clientName, serverConfig } = account;
  const { host, port, transport, wsPath, security, sni, fingerprint } = serverConfig;

  const params = new URLSearchParams();
  params.set('type', transport || 'ws');
  params.set('security', security || 'tls');

  if (transport === 'ws' && wsPath) {
    params.set('path', wsPath);
  }

  if (sni) {
    params.set('sni', sni);
  }

  if (fingerprint) {
    params.set('fp', fingerprint);
  }

  const encodedRemarks = encodeURIComponent(clientName.trim());
  return `vless://${uuid}@${host}:${port}?${params.toString()}#${encodedRemarks}`;
}

/**
 * Construit une configuration VMess standard (v2rayN format base64)
 */
export function buildVmessLink(account: {
  uuid: string;
  clientName: string;
  serverConfig: ServerConnectionConfig;
}): string {
  const { uuid, clientName, serverConfig } = account;
  const { host, port, transport, wsPath, security, sni } = serverConfig;

  const vmessJson = {
    v: '2',
    ps: clientName.trim(),
    add: host,
    port: String(port),
    id: uuid,
    aid: String(serverConfig.vmessAlterId ?? 0),
    scy: serverConfig.vmessSecurity || 'auto',
    net: transport || 'ws',
    type: 'none',
    host: sni || host,
    path: wsPath || '/',
    tls: security === 'tls' ? 'tls' : '',
    sni: sni || '',
    alpn: '',
  };

  const jsonStr = JSON.stringify(vmessJson);
  let base64 = '';
  if (typeof btoa !== 'undefined') {
    base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  } else if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
  }

  return `vmess://${base64}`;
}

/**
 * Génère le fichier de configuration JSON complet pour client sing-box ou v2ray
 */
export function buildClientJsonConfig(account: VlessAccount): string {
  const isVless = account.protocol === 'vless';
  
  if (isVless) {
    return JSON.stringify(
      {
        remarks: account.clientName,
        log: { loglevel: 'warning' },
        inbounds: [
          {
            tag: 'socks-in',
            port: 10808,
            protocol: 'socks',
            settings: { auth: 'noauth', udp: true },
            sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] },
          },
        ],
        outbounds: [
          {
            tag: 'proxy',
            protocol: 'vless',
            settings: {
              vnext: [
                {
                  address: account.serverConfig.host,
                  port: account.serverConfig.port,
                  users: [
                    {
                      id: account.uuid,
                      encryption: 'none',
                      level: 0,
                    },
                  ],
                },
              ],
            },
            streamSettings: {
              network: account.serverConfig.transport,
              security: account.serverConfig.security,
              wsSettings: {
                path: account.serverConfig.wsPath,
                headers: {
                  Host: account.serverConfig.host,
                },
              },
              tlsSettings: {
                serverName: account.serverConfig.sni || account.serverConfig.host,
                fingerprint: account.serverConfig.fingerprint || 'chrome',
              },
            },
          },
          {
            tag: 'direct',
            protocol: 'freedom',
            settings: {},
          },
        ],
      },
      null,
      2
    );
  }

  // VMess JSON config
  return JSON.stringify(
    {
      remarks: account.clientName,
      log: { loglevel: 'warning' },
      inbounds: [
        {
          tag: 'socks-in',
          port: 10808,
          protocol: 'socks',
          settings: { auth: 'noauth', udp: true },
        },
      ],
      outbounds: [
        {
          tag: 'proxy',
          protocol: 'vmess',
          settings: {
            vnext: [
              {
                address: account.serverConfig.host,
                port: account.serverConfig.port,
                users: [
                  {
                    id: account.uuid,
                    alterId: account.serverConfig.vmessAlterId || 0,
                    security: account.serverConfig.vmessSecurity || 'auto',
                  },
                ],
              },
            ],
          },
          streamSettings: {
            network: account.serverConfig.transport,
            security: account.serverConfig.security,
            wsSettings: {
              path: account.serverConfig.wsPath,
              headers: {
                Host: account.serverConfig.host,
              },
            },
            tlsSettings: {
              serverName: account.serverConfig.sni || account.serverConfig.host,
            },
          },
        },
      ],
    },
    null,
    2
  );
}

/**
 * Calcule les jours restants avant expiration
 */
export function calculateRemainingDays(expiresAtIso: string): {
  days: number;
  hours: number;
  isExpired: boolean;
  label: string;
} {
  const now = Date.now();
  const exp = new Date(expiresAtIso).getTime();
  const diffMs = exp - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, isExpired: true, label: 'Expiré' };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return { days, hours, isExpired: false, label: `${days}j ${hours}h restants` };
  }
  return { days: 0, hours, isExpired: false, label: `${hours}h restantes` };
}
