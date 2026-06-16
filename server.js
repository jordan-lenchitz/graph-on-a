import express from 'express';
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

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

const computeClient = new BackendServicesClient();

const PROJECT_ID = process.env.PROJECT_ID || 'project-117f1e92-119b-47be-a05';
const BACKEND_SERVICE_NAME = process.env.BACKEND_SERVICE_NAME || 'jordan-xyz-run-backend';

// Status tracking
let currentStatus = 'Stable';
let targetRegion = 'n/a';

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
    
    // 1. Get the current Backend Service
    const [backendService] = await computeClient.get({
      project: PROJECT_ID,
      backendService: BACKEND_SERVICE_NAME
    });

    console.log('Current backends:', JSON.stringify(backendService.backends));

    // 2. Logic: Toggle between US and EU
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

    // 3. Update the Backend Service
    backendService.backends = newBackends;

    // 4. Patch (Update) the Backend Service
    const [operation] = await computeClient.patch({
      project: PROJECT_ID,
      backendService: BACKEND_SERVICE_NAME,
      backendServiceResource: backendService
    });

    console.log('Patch operation initiated:', operation.name);
    currentStatus = 'PROPAGATING';

    // Note: We don't wait for completion here to respond to the frontend quickly.
    // The CDN will propagate the change in 2-5 minutes.

    res.json({
      message: 'Failover successful. Infrastructure mutation in progress.',
      target_region: targetRegion,
      eta: '2-5 minutes (CDN propagation)'
    });

    // Reset status after a delay (simulating propagation end)
    setTimeout(() => {
      currentStatus = 'Stable';
    }, 120000); // 2 minutes

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
