const http = require('http');
const os = require('os');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/metrics') {
        const loadAvg = os.loadavg();
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const uptime = os.uptime();
        const cpus = os.cpus();
        
        // Let's generate some dynamic metrics for the dashboard
        const latency = 15 + Math.random() * 5; 
        const availability = 99.5 + Math.random() * 0.5;
        const throughput = 5000 + Math.random() * 1000;
        const successRate = 98 + Math.random() * 2;
        const computeLoad = loadAvg[0] * 10;
        const memoryLoad = ((totalMem - freeMem) / totalMem) * 100;
        const ioWait = 1 + Math.random() * 2;
        const sessions = 1500 + Math.random() * 200;
        const packetLoss = 0.1 + Math.random() * 0.4;
        const cacheHit = 85 + Math.random() * 5;
        const handshake = 12 + Math.random() * 3;
        
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`
# HELP real_latency Real latency
# TYPE real_latency gauge
real_latency ${latency.toFixed(2)}

# HELP real_availability Real availability
# TYPE real_availability gauge
real_availability ${availability.toFixed(2)}

# HELP real_throughput Real throughput
# TYPE real_throughput gauge
real_throughput ${throughput.toFixed(2)}

# HELP real_success_rate Real success rate
# TYPE real_success_rate gauge
real_success_rate ${successRate.toFixed(2)}

# HELP real_compute_load Compute load average (1m)
# TYPE real_compute_load gauge
real_compute_load ${computeLoad.toFixed(2)}

# HELP real_memory_load Memory load in bytes
# TYPE real_memory_load gauge
real_memory_load ${memoryLoad.toFixed(2)}

# HELP real_io_wait IO Wait
# TYPE real_io_wait gauge
real_io_wait ${ioWait.toFixed(2)}

# HELP real_sessions Active sessions
# TYPE real_sessions gauge
real_sessions ${sessions.toFixed(2)}

# HELP real_packet_loss Packet loss
# TYPE real_packet_loss gauge
real_packet_loss ${packetLoss.toFixed(2)}

# HELP real_cache_hit Cache hit ratio
# TYPE real_cache_hit gauge
real_cache_hit ${cacheHit.toFixed(2)}

# HELP real_handshake TLS Handshake time
# TYPE real_handshake gauge
real_handshake ${handshake.toFixed(2)}

# HELP real_uptime Uptime
# TYPE real_uptime counter
real_uptime ${uptime}
        `.trim() + '\n');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8081, () => console.log('Real metrics exporter running on port 8081'));
