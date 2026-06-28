import json
import glob

descriptions = {
    'real_latency': 'latency is round trip time from client to server measured via gcp cloud load balancer',
    'real_availability': 'availability is the percentage of uptime measured by gcp cloud run health checks',
    'real_throughput': 'throughput is network data transfer rate measured via gcp cloud run network interface',
    'real_success_rate': 'success rate is percentage of non error responses measured by the gcp edge router',
    'real_compute_load': 'compute load is cpu average load over one minute measured via node.js os module on gcp cloud run',
    'real_memory_load': 'memory load is percentage of docker container image ram consumed measured via node.js os module on gcp cloud run',
    'real_io_wait': 'io wait is disk read write delay measured via gcp persistent disk telemetry',
    'real_sessions': 'sessions is count of active tcp connections tracked by the gcp cloud load balancer',
    'real_packet_loss': 'packet loss is percentage of dropped packets measured by the gcp vpc network interface',
    'real_cache_hit': 'cache hit is percentage of requests served from in memory cache on gcp memorystore',
    'real_handshake': 'handshake is tls negotiation time measured by the gcp cloud armor edge proxy'
}

for fp in glob.glob('grafana/dashboards/*.json'):
    with open(fp, 'r') as f:
        data = json.load(f)
    
    updated = False
    if 'panels' in data:
        for panel in data['panels']:
            if 'targets' in panel:
                for target in panel['targets']:
                    expr = target.get('expr')
                    if expr in descriptions:
                        panel['description'] = descriptions[expr]
                        updated = True
                        break # only need to set it once per panel

    if updated:
        with open(fp, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {fp}")
