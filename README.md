[`https://jordanlenchitz.xyz`](https://jordanlenchitz.xyz) is designed around the decoupling of edge from origin and logic from logic

# how does it work
### [passive origin clusters](https://cloud.google.com/run)
`*.run.app` docker containers are identical and interchangeable endpoints for the worldwide load balancer pool

### [edge compute](https://developers.cloudflare.com/workers)
client requests are 100% intercepted by a serverless cloudflare worker which determines upstream origin based on global kv state

### [distributed state](https://developers.cloudflare.com/kv)
we rely on a globally distributed eventually consistent kv store for the `active_region` queried by the cloudflare workers at the edge

### the request lifecycle
client request is immediately captured by the edge proxy -> low-latency read against the distributed kv store retrieves `active_region` -> edge proxy determines the physical url of the active origin cluster -> edge proxy forwards the request to the resolved origin url and response is proxied back through the edge to the client

### state mutation aka "the failover button"
failover is a state mutation event like any other! when the "chaos" endpoint is invoked we read the current `active_region` from the distributed store -> determine the subsequent region in the sequence (looping back to the origin iff at the terminus) -> overwrite the `active_region` key in the distributed store with the newly computed region identifier! because the edge proxies dynamically query the kv store for every incoming request, mutating this single central variable instantaneously forces the entire global network to reroute all subsequent traffic to the newly designated origin cluster :)
