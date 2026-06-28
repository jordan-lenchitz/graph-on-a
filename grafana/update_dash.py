import json
import os
import glob

def update_dashboard(filepath):
    with open(filepath, 'r') as f:
        data = json.load(f)
        
    updated = False
    
    # Update panels
    if 'panels' in data:
        for panel in data['panels']:
            title = panel.get('title', '').lower()
            
            if 'sondheim' in title:
                print(f"Skipping SONDHEIM DENSITY in {filepath}")
                continue
                
            if 'datasource' in panel:
                if isinstance(panel['datasource'], dict) and panel['datasource'].get('type') == 'testdata':
                    panel['datasource']['type'] = 'prometheus'
                    panel['datasource']['uid'] = 'prometheus'
                    updated = True
                elif panel['datasource'] == 'testdata':
                    panel['datasource'] = 'prometheus'
                    updated = True
            
            # map metric based on title
            # map metric based on title
            expr = 'real_latency'
            if 'availability' in title or 'cowardice' in title: expr = 'real_availability'
            elif 'throughput' in title or 'slop thru' in title: expr = 'real_throughput'
            elif 'success rate' in title or 'ydb ops' in title: expr = 'real_success_rate'
            elif 'compute load' in title or 'existential dread' in title: expr = 'real_compute_load'
            elif 'memory load' in title or 'entropy drift' in title: expr = 'real_memory_load'
            elif 'i/o wait' in title or 'io wait' in title or 'recursion pressure' in title: expr = 'real_io_wait'
            elif 'sessions' in title or 'horse sense' in title: expr = 'real_sessions'
            elif 'packet loss' in title or 'jitter' in title: expr = 'real_packet_loss'
            elif 'cache hit' in title: expr = 'real_cache_hit'
            elif 'handshake' in title or 'neuro-sync' in title: expr = 'real_handshake'
            elif 'latency' in title or 'avian latency' in title: expr = 'real_latency'

            # Always set expr for prometheus targets
            if 'targets' in panel:
                for target in panel['targets']:
                    if target.get('datasource', {}).get('type') == 'testdata':
                        target['datasource']['type'] = 'prometheus'
                        target['datasource']['uid'] = 'prometheus'
                        updated = True
                    # for prometheus, expr is the query
                    target['expr'] = expr
                    # remove testdata specific fields if any
                    target.pop('scenarioId', None)
                    target.pop('alias', None)
                    updated = True

    if updated:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {filepath}")

for fp in glob.glob('grafana/dashboards/*.json'):
    update_dashboard(fp)
