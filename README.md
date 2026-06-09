[`https://jordanlenchitz.xyz`](https://jordanlenchitz.xyz) embraces the decoupling of edge from origin 

# how does it work
### [passive origin clusters](https://cloud.google.com/run)
`*.run.app` docker containers are identical and interchangeable endpoints for the worldwide load balancer pool

### [edge compute](https://developers.cloudflare.com/workers)
client requests go to a serverless cloudflare worker which determines upstream origin based on global kv state

### [distributed state](https://developers.cloudflare.com/kv)
a globally distributed eventually consistent kv store for `active_region` is queried by the edge compute every time

# the request lifecycle
- client request is immediately captured by the cloudclare worker
- low-latency read against the distributed kv store retrieves `active_region`
- cloudflare worker determines the physical url of the active origin cluster
- cloudflare worker forwards the request to the resolved origin url
- response is proxied back to the client

# state mutation aka "the failover button"
0-downtime failover is a state mutation event like any other! when the "chaos" endpoint is invoked we 
- read the current `active_region` from the distributed store
- determine the subsequent region in the sequence (looping back to the origin iff at the terminus)
- overwrite the `active_region` key in the distributed store with the newly computed region identifier

because the cloudflare workies dynamically query kv for every incoming request mutating this single central variable forces the entire global network to reroute all new traffic to the newly designated origin cluster :)
