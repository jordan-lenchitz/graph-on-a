const http = require('http');

let slop = 42;
let cowardice = 99;
let jitter = 0.5;

// Auto-decay back to nominal states
setInterval(() => {
    slop = Math.max(42, slop - 20);
    cowardice = Math.min(99, cowardice + 5);
    jitter = Math.max(0.5, jitter - 0.5);
}, 1000);

const server = http.createServer((req, res) => {
    // CORS to allow the React app to hit this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/metrics') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`
# HELP slop_throughput_bytes Real-time slop throughput
# TYPE slop_throughput_bytes gauge
slop_throughput_bytes ${slop}
# HELP cowardice_index_percent Cowardice of the button
# TYPE cowardice_index_percent gauge
cowardice_index_percent ${cowardice}
# HELP quantum_jitter_ms Jitter measurements
# TYPE quantum_jitter_ms gauge
quantum_jitter_ms ${jitter}
        `.trim() + '\n');
    } else if (req.url === '/interact') {
        // SPIKE THE METRICS to force state changes!
        slop = Math.floor(Math.random() * 500) + 800; // Triggers Critical High
        cowardice = Math.floor(Math.random() * 30) + 10; // Triggers Critical Low
        jitter = Math.floor(Math.random() * 8) + 5; // Triggers Critical High
        
        res.writeHead(200);
        res.end('metrics_spiked');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8081, () => console.log('Absurdist metrics exporter running on port 8081'));
