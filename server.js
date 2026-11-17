import express from 'express';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { BackendServicesClient } from '@google-cloud/compute';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));

const computeClient = new BackendServicesClient();

const PROJECT_ID = process.env.PROJECT_ID || 'project-117f1e92-119b-47be-a05';
const BACKEND_SERVICE_NAME = process.env.BACKEND_SERVICE_NAME || 'jordan-xyz-run-backend';

let currentStatus = 'Stable';
let targetRegion = 'n/a';

const WHOAMI_CACHE_TTL_MS = 10 * 60 * 1000;
const WHOAMI_CACHE_MAX = 500;
const whoamiCache = new Map();

function normalizeIp(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let ip = raw.trim();
  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'));
  } else if (ip.includes('.') && ip.includes(':') && net.isIP(ip) === 0) {
    ip = ip.split(':')[0];
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  return net.isIP(ip) ? ip : '';
}

function isPrivateOrLocalIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  const lower = ip.toLowerCase();
  return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:');
}

function extractClientIp(req) {
  const candidates = [];
  for (const header of ['cf-connecting-ip', 'true-client-ip', 'x-real-ip']) {
    const val = req.headers[header];
    if (typeof val === 'string') candidates.push(val);
  }
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    for (const part of xff.split(',')) {
      candidates.push(part);
    }
  }
  if (req.socket?.remoteAddress) {
    candidates.push(req.socket.remoteAddress);
  }

  const normalized = candidates.map(normalizeIp).filter(Boolean);
  return normalized.find(ip => !isPrivateOrLocalIp(ip)) || normalized[0] || '';
}

async function lookupIpMeta(ip) {
  if (!ip || isPrivateOrLocalIp(ip)) return {};

  const cached = whoamiCache.get(ip);
  if (cached && Date.now() - cached.ts < WHOAMI_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(1800),
    });
    if (!response.ok) return {};
    const json = await response.json();
    if (!json || json.success === false) return {};

    const rawAsn = json.connection?.asn;
    const asn = rawAsn
      ? String(rawAsn).toUpperCase().startsWith('AS')
        ? String(rawAsn)
        : `AS${rawAsn}`
      : null;

    const data = {
      isp: json.connection?.isp || null,
      org: json.connection?.org || null,
      asn,
      city: json.city || null,
      region: json.region || null,
      country: json.country || null,
      postal: json.postal || null,
      timezone: json.timezone?.id || null,
    };

    if (whoamiCache.size >= WHOAMI_CACHE_MAX) {
      const oldestKey = whoamiCache.keys().next().value;
      if (oldestKey) whoamiCache.delete(oldestKey);
    }
    whoamiCache.set(ip, { ts: Date.now(), data });
    return data;
  } catch {
    return {};
  }
}

app.get('/infra/whoami', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const ip = extractClientIp(req);
  const ipFamily = net.isIPv4(ip) ? 'IPv4' : net.isIPv6(ip) ? 'IPv6' : 'unknown';
  const meta = await lookupIpMeta(ip);

  res.json({
    ip: ip || null,
    ip_version: ipFamily,
    isp: meta.isp || null,
    org: meta.org || null,
    asn: meta.asn || null,
    city: meta.city || null,
    region: meta.region || null,
    country: meta.country || null,
    postal: meta.postal || null,
    timezone: meta.timezone || null,
    cf_country: typeof req.headers['cf-ipcountry'] === 'string' ? req.headers['cf-ipcountry'] : null,
    cf_ray: typeof req.headers['cf-ray'] === 'string' ? req.headers['cf-ray'] : null,
  });
});

app.get('/infra/region', (req, res) => {
  const serviceName = process.env.K_SERVICE || 'local';
  let region = 'local';
  if (serviceName.endsWith('-us')) region = 'us-central1';
  if (serviceName.endsWith('-eu')) region = 'europe-west4';
  if (serviceName.endsWith('-as')) region = 'asia-east1';
  if (serviceName.endsWith('-af')) region = 'africa-south1';
  if (serviceName.endsWith('-au')) region = 'australia-southeast2';
  
  res.json({
    region: region,
    pop: 'lhr-c2',
    status: currentStatus,
    target: targetRegion
  });
});

app.get('/infra/debug', (req, res) => {
  const serviceName = process.env.K_SERVICE || 'local';
  let region = 'local';
  if (serviceName.endsWith('-us')) region = 'us-central1';
  if (serviceName.endsWith('-eu')) region = 'europe-west4';
  if (serviceName.endsWith('-as')) region = 'asia-east1';
  if (serviceName.endsWith('-af')) region = 'africa-south1';
  if (serviceName.endsWith('-au')) region = 'australia-southeast2';

  res.json({
    service_name: serviceName,
    revision: process.env.K_REVISION || 'local-revision',
    region: region,
    status: currentStatus,
    target: targetRegion,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    headers: req.headers,
    obscure_telemetry: {
      pid: process.pid,
      ppid: process.ppid,
      node_version: process.version,
      v8_pointer_compression: process.config.variables.v8_enable_pointer_compression,
      architecture: process.arch,
      platform: process.platform,
      cpu_usage_us: process.cpuUsage(),
      resource_usage: process.resourceUsage ? process.resourceUsage() : 'unsupported',
      crypto_fips: process.config.variables.node_use_openssl ? 'true' : 'false',
      sandbox_id: process.env.SANDBOX_ID || 'unknown',
      k_configuration: process.env.K_CONFIGURATION || 'unknown'
    }
  });
});

app.post('/infra/failover', async (req, res) => {
  try {
    console.log('FAILOVER INITIATED: Mutating Global Infrastructure...');
    currentStatus = 'EVACUATING';
    
    const [backendService] = await computeClient.get({
      project: PROJECT_ID,
      backendService: BACKEND_SERVICE_NAME
    });

    console.log('Current backends:', JSON.stringify(backendService.backends));

    const negUS = `https://www.googleapis.com/compute/v1/projects/${PROJECT_ID}/regions/us-central1/networkEndpointGroups/failover-neg-us`;
    const negEU = `https://www.googleapis.com/compute/v1/projects/${PROJECT_ID}/regions/europe-west4/networkEndpointGroups/failover-neg-eu`;

    let newBackends = [];
    const hasUS = backendService.backends.some(b => b.group === negUS);
    
    if (hasUS) {
      console.log('Switching to EU...');
      targetRegion = 'europe-west4';
      newBackends = [{
        group: negEU,
        balancingMode: 'UTILIZATION',
        capacityScaler: 1.0
      }];
    } else {
      console.log('Switching to US...');
      targetRegion = 'us-central1';
      newBackends = [{
        group: negUS,
        balancingMode: 'UTILIZATION',
        capacityScaler: 1.0
      }];
    }

    backendService.backends = newBackends;

    const [operation] = await computeClient.patch({
      project: PROJECT_ID,
      backendService: BACKEND_SERVICE_NAME,
      backendServiceResource: backendService
    });

    console.log('Patch operation initiated:', operation.name);
    currentStatus = 'PROPAGATING';

    res.json({
      message: 'Failover successful. Infrastructure mutation in progress.',
      target_region: targetRegion,
      eta: '2-5 minutes (CDN propagation)'
    });

    setTimeout(() => {
      currentStatus = 'Stable';
    }, 120000);

  } catch (error) {
    console.error('Failover failed:', error);
    currentStatus = 'ERROR';
    res.status(500).json({ error: 'Catastrophic failure during failover. Check IAM permissions.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
