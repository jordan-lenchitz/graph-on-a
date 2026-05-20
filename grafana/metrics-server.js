const http = require('http');

let slop = 42;
let cowardice = 99;
let jitter = 0.5;
let interaction_count = 0;

// Nominal states for simulated metrics
let dread = 20;
let horse_sense = 85;
let recursion_pressure = 10;

// Auto-decay and random walk
setInterval(() => {
    slop = Math.max(42, slop - 5);
    cowardice = Math.min(99, cowardice + 2);
    jitter = Math.max(0.5, jitter - 0.1);
    
    // Random walks
    dread = Math.max(0, Math.min(100, dread + (Math.random() - 0.5) * 5));
    horse_sense = Math.max(0, Math.min(100, horse_sense + (Math.random() - 0.5) * 2));
    recursion_pressure = Math.max(0, Math.min(100, recursion_pressure + (Math.random() - 0.5) * 3));
}, 1000);

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/metrics') {
        const mem = process.memoryUsage();
        const uptime = process.uptime();
        
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`
# HELP slop_throughput_bytes Real-time slop throughput
# TYPE slop_throughput_bytes gauge
slop_throughput_bytes ${slop.toFixed(2)}

# HELP cowardice_index_percent Cowardice of the button
# TYPE cowardice_index_percent gauge
cowardice_index_percent ${cowardice.toFixed(2)}

# HELP quantum_jitter_ms Jitter measurements
# TYPE quantum_jitter_ms gauge
quantum_jitter_ms ${jitter.toFixed(2)}

# HELP process_uptime_seconds Uptime of the metrics server
# TYPE process_uptime_seconds counter
process_uptime_seconds ${uptime.toFixed(0)}

# HELP process_memory_heap_used_bytes Heap memory used
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${mem.heapUsed}

# HELP process_memory_rss_bytes RSS memory usage
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${mem.rss}

# HELP interaction_total_count Total interactions with the metrics server
# TYPE interaction_total_count counter
interaction_total_count ${interaction_count}

# HELP existential_dread_index Normalized dread levels
# TYPE existential_dread_index gauge
existential_dread_index ${dread.toFixed(2)}

# HELP horse_sense_index Equine intelligence metric
# TYPE horse_sense_index gauge
horse_sense_index ${horse_sense.toFixed(2)}

# HELP recursion_depth_pressure_psi Simulated depth pressure
# TYPE recursion_depth_pressure_psi gauge
recursion_depth_pressure_psi ${recursion_pressure.toFixed(2)}

# HELP ydb_simulated_throughput_ops Simulated Yottadb throughput
# TYPE ydb_simulated_throughput_ops gauge
ydb_simulated_throughput_ops ${(Math.random() * 1000).toFixed(2)}
        `.trim() + '\n');
    } else if (req.url === '/interact') {
        interaction_count++;
        slop = Math.floor(Math.random() * 500) + 800;
        cowardice = Math.floor(Math.random() * 30) + 10;
        jitter = Math.floor(Math.random() * 8) + 5;
        
        res.writeHead(200);
        res.end('metrics_spiked');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8081, () => console.log('Absurdist metrics exporter running on port 8081'));
