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

// Regions for failover
const REGIONS = {
  'us-central1': 'us-central1-neg',
  'europe-west4': 'europe-west4-neg',
  'asia-east1': 'asia-east1-neg'
};

const PROJECT_ID = process.env.PROJECT_ID || 'project-117f1e92-119b-47be-a05';
const BACKEND_SERVICE_NAME = process.env.BACKEND_SERVICE_NAME || 'jordan-xyz-backend';

app.get('/api/region', (req, res) => {
  res.json({
    region: process.env.K_SERVICE ? process.env.K_SERVICE.split('--')[1] || 'us-central1' : 'local',
    pop: 'lhr-c2', // Hardcoded for absurdity or retrieved from metadata
    status: 'Stable'
  });
});

app.post('/api/failover', async (req, res) => {
  try {
    console.log('FAILOVER INITIATED: Evacuating current region...');
    
    // In a real implementation, this would involve updating the Backend Service's backends
    // This is a simplified "Chaos" simulation that would actually trigger a GCP update.
    
    /* 
    const [backendService] = await computeClient.get({
      project: PROJECT_ID,
      backendService: BACKEND_SERVICE_NAME
    });

    // Toggle logic would go here:
    // 1. Identify current region NEG
    // 2. Identify target region NEG
    // 3. Update backendService.backends
    // 4. await computeClient.patch(...)
    */

    // Simulate delay for absurdity
    await new Promise(resolve => setTimeout(resolve, 3000));

    res.json({
      message: 'Failover successful. Traffic routing to new region...',
      target_region: 'europe-west4',
      eta: '2-5 minutes (CDN propagation)'
    });
  } catch (error) {
    console.error('Failover failed:', error);
    res.status(500).json({ error: 'Catastrophic failure during failover. Good luck.' });
  }
});

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
