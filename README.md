# kevlar

Synthetic load generation.

## Installation

```bash
npm install kevlar
```

## Running

`kevlar` reads a list of _paths_ from `STDIN` and resolves them against
a target URL (`--target`) before making `HEAD` requests.

This means that you can use a static list of paths as a source of load:

```bash
cat paths.txt | kevlar -t http://example.com
```

Or, you can use a dynamic list of paths, in this case processed from a remote
syslog stream:

```bash
curl -s http://source.example.com | \
grep path | \
perl -pe 's/^.+GET (\/[^\/]+\/[\w\/\.]+).+$/\1/' \
kevlar -t http://example.com
```

If you see `EMFILE` errors, `kevlar`'s intended concurrency is being limited by
the number of available file descriptors (often 256 by default). To increase
the limit, use:

```bash
ulimit -n 1024
```

## Notes

`kevlar` currently makes `HEAD` requests in order to reduce bandwidth
utilization (with the knowledge that in this case the target will perform all
necessary work in response).
