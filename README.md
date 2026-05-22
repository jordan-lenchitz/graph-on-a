## core paradigms

[`https://jordanlenchitz.xyz`](https://jordanlenchitz.xyz) is designed around the decoupling of edge from origin and logic from compute

# passive origin clusters = [google cloud run]([url](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run))
google cloud run hosts docker containers around the world which for our purposes are interchangeable endpoints in the global pool

# edge compute interception = [cloudflare workers ]([url](https://developers.cloudflare.com/workers)
client requests are always intercepted by a serverless cloudflare worker which determines upstream origin based on global kv state

# distributed state management = [cloudflare workers kv](https://developers.cloudflare.com/kv/)
we rely on a globally distributed eventually consistent kv store for the `active_region` queried by the cloudflare workers at the edge

# the standard request lifecycle
client request enters the global network and is immediately captured by the edge proxy ->  edge proxy performs a low-latency read against the distributed kv store to retrieve the current `active_region` identifier -> edge proxy maps the retrieved identifier against an internal pre-defined topology map to determine the physical url of the active origin cluster -> edge proxy forwards the request to the resolved origin url and a response is proxied back through the edge to the client

# state mutation aka "the failover button"
failover is a state mutation event like any other! the edge logic is programmed with an internal topological array representing the sequence of available geographic regions so when the "chaos" endpoint is invoked we read the current `active_region` from the distributed store -> determine the subsequent region in the sequence (looping back to the origin iff at the terminus) -> overwrite the `active_region` key in the distributed store with the newly computed region identifier.

because the edge proxies dynamically query the kv store for every incoming request, mutating this single central variable instantaneously forces the entire global network to reroute all subsequent traffic to the newly designated origin cluster! :)
