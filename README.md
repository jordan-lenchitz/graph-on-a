## core paradigms

[`https://jordanlenchitz.xyz`](https://jordanlenchitz.xyz) is designed around the decoupling of edge from origin and logic from compute

### passive origin clusters ([google cloud run]([url](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)))
in this architecture origin servers operate as purely passive compute nodes distributed across multiple geographic regions, containerized with no routing logic nor global awareness. they are oblivious to the failover mechanism and act only as interchangeable endpoints in a global pool.

### edge compute interception ([cloudflare workers]([url](https://developers.cloudflare.com/workers/)))
logic is pushed to the absolute edge of the network so when a client initiates a request it is 100% intercepted by a serverless function operating at the network point of presence (netpop) geographically closest to the client. this edge compute layer functions as an intelligent proxy which evaluates incoming requests, determines the correct upstream origin based on global state, and seamlessly forwards traffic.

### distributed state management ([cloudflare workers kv](https://developers.cloudflare.com/kv/))
to maintain synchronized routing across a global edge network the system relies on a globally distributed eventually consistent key-value store which holds a single source of truth, the `active_region`. because edge compute nodes are stateless they must query this distributed memory bank upon every request to determine the current theoretical routing path and that is okay (and intentional!)

---

## conceptual mechanics

### the standard request lifecycle
1. **edge interception:** a client request enters the global network and is immediately captured by the edge proxy.
2. **state query:** the edge proxy performs a low-latency read against the distributed kv store to retrieve the current `active_region` identifier.
3. **origin resolution:** the proxy maps the retrieved identifier against an internal, pre-defined topology map to determine the physical url of the active origin cluster.
4. **proxy forwarding:** the request is transparently forwarded to the resolved origin url. the response is then proxied back through the edge to the client.

### state mutation aka "the failover button"
failover is a state mutation event like any other, the edge proxy is programmed with an internal topological array representing the sequence of available geographic regions and when the "chaos" endpoint is invoked:

1. it reads the current `active_region` from the distributed store
2. it locates the current state within its topological array and determines the subsequent region in the sequence, looping back to the origin iff at the terminal end
3. it overwrites the `active_region` key in the distributed store with the newly computed region identifier

because the edge proxies dynamically query the kv store for every incoming request, mutating this single central variable instantaneously forces the entire global network to reroute all subsequent traffic to the newly designated origin cluster! :)
