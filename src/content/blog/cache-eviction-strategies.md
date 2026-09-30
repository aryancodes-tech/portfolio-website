---
title: "Cache Eviction Strategies Explained: LRU, LFU, FIFO and Beyond"
description: "Cache eviction strategies for production: LRU, LFU, FIFO, TTL, ARC, and all 8 Redis policies. Algorithms, dry runs, and frameworks to protect your cache hit ratio."
excerpt: "A production guide to cache eviction — LRU, LFU, FIFO, TTL, ARC, and Redis maxmemory policies with algorithms, dry runs, and hit-ratio frameworks."
slug: cache-eviction-strategies
publishedAt: "2026-06-04"
updatedAt: "2026-06-04"
author: "Aryan Gupta"
tags: [caching, redis, distributed-systems, backend, performance]
category: caching
coverImage: ""
featured: true
draft: false
---

<!-- Meta: Cache eviction strategies for production: LRU, LFU, FIFO, TTL, ARC, and all 8 Redis policies. Algorithms, dry runs, and frameworks to protect your cache hit ratio. -->

<!-- # Cache Eviction Strategies Explained: LRU, LFU, FIFO and Beyond -->

> **TL;DR**
>
> - When an in-memory store hits its memory limit, something must leave - **cache eviction** is the policy that decides *what* leaves.
> - **LRU (Least Recently Used)** wins when recent data is reused (session stores, CDN hot assets).
> - **LFU (Least Frequently Used)** wins when popularity is skewed (product catalogs, recommendation vectors).
> - **TTL (Time to Live)** is required when data must expire on a schedule (DNS, sessions, rate limits).
> - **Redis** offers eight eviction policies - for most caches use `allkeys-lru` or `allkeys-lfu`; use `volatile-lru` when only keys with TTL should be evicted; use `noeviction` if losing keys is worse than running out of memory.
> - Wrong policy → cache thrashing, hit ratio collapse, and DB meltdown - measure hit ratio, eviction rate, and p99 latency before you tune.

## Introduction: The Night the Cache Ran Out of Space

It is 2 a.m. and PagerDuty is going off. Checkout is slow. Redis is full, evictions are through the roof, and Postgres is struggling to keep up. The hit ratio dropped from 97% to 81% - at large traffic, that means **thousands of extra database queries per second** because the cache ran out of space and started deleting the wrong keys.

**Cache eviction** is the process of removing entries from a cache when memory is full or when entries expire, so new data can be stored. It is distinct from **cache invalidation** (actively marking data stale because the source of truth changed), though both reduce what the cache serves. Eviction answers: *given limited memory, which keys survive?*

Why it matters:

- **Finite memory.** Every in-memory store like Redis, Memcached, etc. has a ceiling. Without eviction (or without rejecting writes), you get OOM (Out of Memory) kills or write failures.
- **Hits are cheap, misses are expensive.** Every **cache miss** hits the database; at scale, even a small drop in hit ratio adds up fast.
- **Policy matters.** The wrong eviction rule can wipe your hot keys, a batch scan under LRU, or a traffic spike under LFU, so pick policy as per how your app actually reads data.

**Analogy:** Think of a food truck fridge with twelve slots. Every new dish needs a slot. Eviction policy is how you decide which dish hits the dustbin, the one you have not opened lately (LRU), the one customers rarely order (LFU), the oldest batch by expiry date (TTL), or whatever is in front because you never reorganise (FIFO). The truck does not get bigger. Your cache memory does not either.

---

## Why Cache Eviction Matters in Production

Eviction policy is invisible until it is catastrophic. Three failure modes dominate here:

### 1. Cache Thrashing

Imagine a desk with space for 5 folders. You're working on a project that needs 10 folders constantly. So you grab folder 1, use it, put it back. Grab folder 2... eventually folder 1 gets pushed off the desk. Then you need folder 1 again, so something else gets pushed off. You spend all your time shuffling folders instead of actually working.

Under **memory pressure**, an aggressive eviction policy combined with a working set larger than cache capacity (needing more data than the cache can hold) causes constant insert-evict-insert cycles. CPU wastes cycles managing what's in/out of cache instead of actually processing data. Latency spikes because cache misses are expensive. 

The fix is usually one of: increase cache size, reduce your working set, or use a smarter eviction policy that's aware of your data access patterns.

### 2. Latency Spikes and Database Load

When hot keys are evicted, the next request becomes a **cache miss**.

**Assumptions:** user-profile service; 50,000 requests/sec; hit ratio drops from 95% → 90%; 8 ms DB time per miss; 1 cache-miss = 1 DB call

**Step 1: Extra cache misses per second**

```text
Traffic:              50,000 requests/sec

Misses at 95% hit:    50,000 × (1 − 0.95) = 2,500 misses/sec
Misses at 90% hit:    50,000 × (1 − 0.90) = 5,000 misses/sec

Extra DB Calls:       5,000 − 2,500       = 2,500 DB Calls/sec
```

**Step 2 - Total DB time those extra misses consume**

```text
Extra misses:         2,500/sec
Cost per miss:        8 ms each

Total DB time:        2,500 × 8 ms = 20,000 ms = 20 seconds of query time
```

**Result:** A 5% hit-ratio drop (95% → 90%) adds **2,500 extra database reads per second** and **~20 seconds of combined DB query time every second**. This is the work that cache used to absorb before eviction flushed the hot keys.

### 3. Cascading Failures

Caches exist partly to **absorb spikes**. If eviction clears the shock absorber during a traffic burst (or a misconfigured `KEYS *` scan), the database becomes the burst absorber. Connection pools saturate. Timeouts propagate. The cache was supposed to fail soft; instead the origin fails hard.

Monitor:

- **Cache hit ratio** - [`keyspace_hits`](https://redis.io/docs/latest/commands/info/#keyspace_hits) ÷ ([`keyspace_hits`](https://redis.io/docs/latest/commands/info/#keyspace_hits) + [`keyspace_misses`](https://redis.io/docs/latest/commands/info/#keyspace_misses))
- **Eviction rate** - [`evicted_keys`](https://redis.io/docs/latest/commands/info/#evicted_keys) (keys removed when memory hits [`maxmemory`](https://redis.io/docs/latest/commands/info/#maxmemory))
- **Memory headroom** - used memory vs [`maxmemory`](https://redis.io/docs/latest/commands/info/#maxmemory) (from `INFO memory`)
- **p99 latency** - correlate APM (Application Performance Monitoring) latency with miss and eviction spikes

---
<!-- 
## Where Cache Eviction is Used in the Real World

### Social media feeds (Instagram, X timelines)

Most users only scroll the top of their feed, the recent posts. They rarely dig deep into older posts. So there's no point keeping all of that in cache.
With a simple rule like "drop what hasn't been used recently" (LRU) or "drop anything older than X minutes" (TTL), the cache automatically stays focused on recent posts.

Feeds are naturally a recency workload. People scroll new content, not old. So the cache and the user's behavior are perfectly aligned, keep the fresh stuff, let the old stuff go.

### CDN edge caches (CloudFront, Cloudflare)

CDN servers have limited storage, so they constantly decide what to keep and what to delete, A viral asset stays; a one-off A/B test image goes.

Think of it like a convenience store with limited shelf space. They keep stocking the popular items (viral video, trending image) because people keep grabbing them. A product that sold once and never again? It gets pulled off the shelf to make room.


### Database query caches (MySQL query cache, Redis in front of read replicas)

Cache stores the results of database queries so you don't have to run them again.. Under memory pressure, evicting cold query keys protects hot aggregates (dashboards, leaderboards). *Aha:* the cache is a read replica's best friend until eviction evicts the wrong friends.

### DNS resolvers

Resolvers cache RRsets with **TTL-based eviction** mandated by the record. When TTL expires, the entry is gone regardless of LRU. *Aha:* DNS proves eviction is not always "pick a victim"-sometimes time decides.

### Session stores (Redis session backends)

Inactive sessions should disappear. **TTL eviction** (session timeout) plus **LRU under memory pressure** prevents zombie sessions from filling RAM. *Aha:* sessions are TTL-first, LRU-second-security and memory in one policy stack.

### Recommendation engines

Pre-computed user vectors or candidate lists are expensive. For dormant users, evicting their vectors under **LFU** or **TTL** frees space for active shoppers. *Aha:* frequency and activity correlate-LFU matches "still shopping" vs "churned."

### Rate limiters (sliding window counters in Redis)

Counters keyed by `user_id:window_bucket` expire when the window passes. **TTL-based eviction** is the policy; the key simply vanishes. *Aha:* rate limiting is eviction by clock, not by popularity.

--- -->

## Cache Eviction Strategies

<!-- Each subsection follows: Theory → Dry Run → Pseudocode → Aha Moment → Tradeoffs.

--- -->

## LRU Cache Eviction (Least Recently Used)

### Theory

**LRU** evicts the entry that has not been accessed for the longest time. Assumption: [`Temporal Locality`](https://www.geeksforgeeks.org/computer-organization-architecture/difference-between-spatial-locality-and-temporal-locality/#:~:text=not%20useful%20anymore.-,Temporal%20Locality,-Temporal%20Locality%20means) - if you used it recently, you will use it again.

Classic implementation: **hash map + doubly linked list**. Map gives O(1) lookup; list orders by recency. On `get`/`put`, move node to head; evict tail when over capacity.

- **Get:** O(1)
- **Put:** O(1)
- **Space:** O(n) for pointers

Redis uses an approximated LRU algorithm based on sampling. Pick random keys, evict the oldest among them. Cheaper, slightly less accurate.

### Dry Run Example

Cache capacity = **3**.

| Step | Operation | Cache state (MRU → LRU) | Evicted |
|------|-----------|-------------------------|---------|
| 1 | `put(A)` | A | - |
| 2 | `put(B)` | B, A | - |
| 3 | `put(C)` | C, B, A | - |
| 4 | `put(D)` | D, C, B | **A** |
| 5 | `get(B)` | B, D, C | - |
| 6 | `put(E)` | E, B, D | **C** |

After step 4, A is LRU tail. Step 5 accesses B, promoting it. Step 6 evicts C, not B.

### Pseudocode

```text
struct LRUCache:
    capacity: int
    map: hash<Key, Node>
    head, tail: doubly_linked_list

function get(key):
    if key not in map:
        return MISS
    node = map[key]
    move_to_front(node)
    return node.value

function put(key, value):
    if key in map:
        node = map[key]
        node.value = value
        move_to_front(node)
    else:
        if size == capacity:
            evict tail node from map and list
        insert new node at head
        map[key] = node
```

### Where to Use This

- **Session caches** with sliding activity (recent users stay hot).
- **CDN / HTTP reverse proxies** (Nginx `proxy_cache`) for assets with bursty reuse.
- **ORM second-level caches** where the same entities are re-read in a request window.

### Tradeoffs and When NOT to Use This

- **Scan workloads destroy LRU.** A full-table scan touches every key once, making the entire working set look "recent," evicting genuinely hot keys-**one-hit wonders** problem.
- **Frequency-blind:** a key accessed once yesterday but critical every Monday loses to a key hammered once per second unless accessed again.
- **Not ideal for skewed popularity** where old but ultra-hot keys (global config) coexist with fresh cold keys-consider LFU or priority.

---

## LFU Cache Eviction (Least Frequently Used)

### Theory

**LFU** evicts the entry with the lowest access **frequency**. Assumption: **frequency locality**-popular keys stay popular.

Naive: counters per key; min-heap for eviction → O(log n) puts. Practical: **LFU with aging** (decay counters over time) to avoid stale frequency dominance.

Redis 4.0+ implements **allkeys-lfu** / **volatile-lfu** with logarithmic counter increments and probabilistic decay.

- **Get:** O(1) with counter bump
- **Put:** O(1) amortised with approximate structures
- **Space:** O(n) for counters

### Dry Run Example

Capacity = **3**. Track access counts.

| Step | Operation | Cache (key: count) | Evicted |
|------|-----------|-------------------|---------|
| 1 | `put(A)` | A:1 | - |
| 2 | `put(B)` | A:1, B:1 | - |
| 3 | `put(C)` | A:1, B:1, C:1 | - |
| 4 | `get(A)` ×3 | A:4, B:1, C:1 | - |
| 5 | `put(D)` | D:1, A:4, B:1 | **C** (lowest freq) |

C had count 1; B also 1-tie-break by insertion time or LRU among ties.

### Pseudocode

```text
struct LFUCache:
    capacity: int
    map: hash<Key, {value, freq, last_used}>
    freq_buckets: map<freq, doubly_linked_list<Key>>

function get(key):
    if key not in map: return MISS
    increment_freq(key)
    return map[key].value

function put(key, value):
    if key in map:
        map[key].value = value
        increment_freq(key)
    else:
        if size == capacity:
            evict key with min freq (LRU tie-break)
        insert with freq = 1

function increment_freq(key):
    move key from freq bucket f to f+1
```

### Where to Use This

- **Product catalog caches** (hero SKUs accessed constantly).
- **Recommendation pre-compute** where popular users dominate traffic.
- **API gateway caching** of top endpoints (`/health` excluded, `/v1/trending` hot).

### Tradeoffs and When NOT to Use This

- **New keys starve:** freshly inserted keys have freq=1 and get evicted before warming up-needs **admission policies** or **window LFU**.
- **Historical popularity poisons:** a flash sale yesterday can keep dead keys hot without aging.
- **Higher metadata cost** than LRU (counters, buckets).

---

## MRU Cache Eviction (Most Recently Used)

### Theory

**MRU** evicts the **most recently used** entry-the opposite of LRU. Counter-intuitive until the access pattern is **sequential scan**: the newest item in a sliding window is least likely to be revisited.

Implementation mirrors LRU but evict from **head** instead of tail.

- **Get/Put:** O(1) with list + map

### Dry Run Example

Capacity = **3**. MRU evicts most recent.

| Step | Operation | Cache (insertion order) | Evicted |
|------|-----------|------------------------|---------|
| 1 | `put(A)` | A | - |
| 2 | `put(B)` | A, B | - |
| 3 | `put(C)` | A, B, C | - |
| 4 | `get(A)` | B, C, A (A now MRU) | - |
| 5 | `put(D)` | B, C, D | **A** (most recent before insert) |

Exact tie semantics vary; MRU targets "just touched" entries.

### Pseudocode

```text
function put(key, value):
    if full:
        evict head_of_list  // most recently used
    insert/move key to head
```

### Where to Use This

- **Sequential scans** in buffer pools (some DB page caches).
- **Looping over arrays** larger than cache-recent page will not be re-read soon.
- **Compiler / CPU** micro-architectures in niche prefetch patterns.

### Tradeoffs and When NOT to Use This

- **Terrible for typical web caches** where recency implies reuse.
- Rare in production key-value stores; Redis does not offer pure MRU.
- Misapplying MRU to API caches annihilates hit ratio.

---

## FIFO Cache Eviction (First In, First Out)

### Theory

**FIFO** evicts the **oldest inserted** entry, regardless of access. Queue order only. No recency or frequency metadata beyond enqueue time.

- **Put:** O(1) enqueue
- **Get:** O(1), does not change order
- **Evict:** O(1) dequeue

### Dry Run Example

Capacity = **3**.

| Step | Operation | Queue (front → back) | Evicted |
|------|-----------|---------------------|---------|
| 1 | `put(A)` | A | - |
| 2 | `put(B)` | A, B | - |
| 3 | `put(C)` | A, B, C | - |
| 4 | `get(A)` | A, B, C (unchanged) | - |
| 5 | `put(D)` | B, C, D | **A** |

A was still hot (step 4) but left anyway-FIFO ignores access.

### Pseudocode

```text
struct FIFOCache:
    queue: linked_list<Key>
    map: hash<Key, Value>

function put(key, value):
    if key in map:
        map[key] = value  // optional: no reorder
    else:
        if size == capacity:
            old = queue.pop_front()
            delete map[old]
        queue.push_back(key)
        map[key] = value
```

### Where to Use This

- **Streaming ingestion buffers** where order matters and replay is forward-only.
- **Simple embedded caches** where implementation simplicity beats hit ratio.
- **Batch pipelines** with strict generation ordering.

### Tradeoffs and When NOT to Use This

- **Ignores all locality**-hot keys die if they were early.
- **Belady's anomaly** possible in some paging contexts (FIFO can perform worse with larger cache).
- Poor choice for general **Redis** / **Memcached** workloads.

---

## LIFO Cache Eviction (Last In, First Out)

### Theory

**LIFO** evicts the **most recently inserted** entry (stack). Rare as a global cache policy; behaves like a stack under overflow.

- **Put:** O(1) push
- **Evict:** O(1) pop from top

### Dry Run Example

Capacity = **3** (stack bottom → top).

| Step | Operation | Stack | Evicted |
|------|-----------|-------|---------|
| 1 | `put(A)` | A | - |
| 2 | `put(B)` | A, B | - |
| 3 | `put(C)` | A, B, C | - |
| 4 | `put(D)` | A, B, D | **C** |

### Pseudocode

```text
function put(key, value):
    if full:
        evict stack.top()
    stack.push(key)
    map[key] = value
```

### Where to Use This

- **Depth-first traversal caches** (niche).
- **Undo stacks** / nested transaction scopes-not quite a distributed cache, but stack eviction semantics.
- **Specialised hardware simulators** with stack-like reference patterns.

### Tradeoffs and When NOT to Use This

- Almost never the right **distributed cache** policy.
- Destroys hit ratio for any shared hot set.
- Use when stack semantics are domain-required, not for HTTP/API caching.

---

## Random Replacement Cache Eviction

### Theory

On eviction, pick a **uniformly random** key. Zero access metadata. Surprisingly competitive when access is **uniform random** (no locality).

- **Get:** O(1)
- **Put:** O(1) + O(1) random pick
- **Space:** O(1) extra metadata

### Dry Run Example

Capacity = **3**. Keys {A,B,C}. `put(D)` triggers random eviction-suppose **B** selected.

| Step | Operation | Cache | Evicted |
|------|-----------|-------|---------|
| 1–3 | fill A,B,C | A,B,C | - |
| 4 | `put(D)` | A,C,D | **B** (random) |

### Pseudocode

```text
function evict():
    key = random_choice(map.keys())
    delete map[key]

function put(key, value):
    if full and key not in map:
        evict()
    map[key] = value
```

### Where to Use This

- **Memcached** default in some deployments when no smarter policy configured.
- **Redis `allkeys-random` / `volatile-random`**-low CPU, acceptable for homogeneous keys.
- **Simplicity under unknown workloads** before profiling.

### Tradeoffs and When NOT to Use This

- **Ignores locality** when locality exists-you leave performance on the table.
- **Variance:** unlucky streaks evict hot keys by chance.
- Not ideal when SLA depends on predictable tail latency.

---

## TTL-Based Eviction (Time-To-Live)

### Theory

Each key carries an **expiration timestamp**. Eviction is **lazy** (on access) or **active** (background expiry thread). When TTL elapses, the key is invalid-**cache invalidation by time**.

Not mutually exclusive with LRU/LFU: Redis combines TTL with `volatile-*` policies.

- **Put:** O(1) + schedule expiry
- **Get:** O(1) check expiry
- **Active expiry:** amortised O(n) scans (Redis samples keys per tick)

### Dry Run Example

| Time | Operation | Cache | Notes |
|------|-----------|-------|-------|
| t=0 | `put(session1, TTL=60s)` | session1 (expires t=60) | - |
| t=30 | `get(session1)` | hit | - |
| t=61 | `get(session1)` | miss | expired → evicted logically |
| t=61 | background | - | key removed from store |

### Pseudocode

```text
struct Entry:
    value
    expires_at: timestamp

function get(key):
    e = map[key]
    if now() > e.expires_at:
        delete map[key]
        return MISS
    return e.value

function put(key, value, ttl):
    map[key] = Entry(value, now() + ttl)

function active_expire_sample():
    // pick random keys, delete if expired (Redis-style)
```

### Where to Use This

- **DNS caches**, **OTP codes**, **password reset tokens**.
- **Rate limiter buckets**, **OAuth state**, **CSRF nonces**.
- **Compliance-driven data expiry** (GDPR session limits).

### Tradeoffs and When NOT to Use This

- **TTL alone does not bound memory** if keys arrive faster than they expire-need `maxmemory` + eviction policy.
- **Thundering herd on mass expiry** if many keys share TTL-jitter expiries.
- Wrong TTL = stale reads (correctness) not just misses (performance).

---

## LRU-K Cache Eviction (Generalised LRU)

### Theory

**LRU-K** tracks the **K-th most recent access time** (commonly K=2). A key with only one access is evicted before a key with two spaced accesses-solving LRU's **one-hit wonder** scan problem.

New keys start with K=1 history; promotion requires K references.

- **Get/Put:** O(log n) or O(1) with careful structures
- **Space:** O(n × K) access history per key (optimised in practice)

### Dry Run Example

Capacity = **3**, K=2. Evict key with oldest K-th access.

| Step | Operation | Notes |
|------|-----------|-------|
| 1 | scan keys X,Y,Z once | each has 1 access-candidates for eviction |
| 2 | hot key H accessed repeatedly | H gets 2nd access-protected |
| 3 | insert new W | evict among {X,Y,Z} with oldest 2nd access (or -∞ if only one access) |

### Pseudocode

```text
struct Entry:
    value
    access_history: queue<timestamp, max_size=K>

function on_access(key):
    push now() to access_history
    eviction_rank = access_history[K-th] or -INF

function evict_candidate():
    return key with minimum eviction_rank
```

### Where to Use This

- **Database buffer pools** (IBM DB2 popularised LRU-K).
- **Mixed OLTP + reporting** where scans should not flush hot pages.
- **CDN caches** with crawler noise.

### Tradeoffs and When NOT to Use This

- **More complex** than LRU; fewer off-the-shelf libraries.
- **Cold start** still vulnerable until K accesses accumulate.
- Tuning K is workload-specific.

---

## ARC Cache Eviction (Adaptive Replacement Cache)

### Theory

**ARC** maintains **four lists**: T1 (recent one-time), T2 (recent repeated), B1 (ghost entries evicted from T1), B2 (ghost from T2). **Ghost entries** store keys without values-metadata only-to learn if evicted keys return.

Adaptation: if a miss hits B1, increase target size for T1; B2 hit increases T2. Self-tunes between recency and frequency without manual knobs.

- **Amortised O(1)** per operation (claimed)
- **Space:** ~2× key metadata for ghosts

### Dry Run Example (simplified)

1. New key → T1.
2. Re-accessed key → promote to T2.
3. Evict from T1 tail → move key to B1 ghost.
4. Miss on key in B1 → adapt: favour recency list size.
5. Repeated pattern → T2 protects frequency.

### Pseudocode

```text
// T1, T2: real cache partitions
// B1, B2: ghost histories (keys only)
// p: adaptive target size for T1

function on_miss(key):
    if key in B1:
        p = min(p + delta, max_p)
        adapt_partition_sizes()
    else if key in B2:
        p = max(p - delta, 0)
        adapt_partition_sizes()
    // fetch and place in appropriate list

function evict():
    if T1.size > p:
        move T1.tail to B1
    else:
        move T2.tail to B2
```

### Where to Use This

- **Storage appliance caches** (ZFS ARC is the famous namesake-different algorithm family but same philosophy).
- **Unknown or shifting workloads** (dev → prod traffic shape changes).
- **Filesystem page caches** where scan + hot set coexist.

### Tradeoffs and When NOT to Use This

- **Implementation complexity**-not exposed in Redis core.
- **Memory overhead** for ghost lists.
- Harder to reason about than LRU for on-call engineers.

---

## CLOCK Cache Eviction (Second Chance Algorithm)

### Theory

**CLOCK** (second-chance) approximates LRU with a **circular buffer** and **reference bits**. On access, set bit=1. On eviction, sweep hand: if bit=0, evict; if bit=1, set 0 and advance-second chance.

Reduces LRU list churn; used in OS page replacement.

- **Get:** O(1) set reference bit
- **Evict:** O(n) worst case sweep, O(1) amortised typical
- **Space:** O(1) bit per entry

### Dry Run Example

Capacity = **4**, circular slots with reference bit (r).

| Step | Event | Slots (key,r) hand→ | Action |
|------|-------|---------------------|--------|
| 1 | load A,B,C,D | all r=0 | - |
| 2 | access A | A r=1 | - |
| 3 | insert E (full) | sweep from hand: first r=0 evicted | evict first without bit among B,C,D |

### Pseudocode

```text
slots: array[{key, value, referenced: bool}]
hand: int = 0

function get(key):
    slots[i].referenced = true

function put(key, value):
    while true:
        if slots[hand].referenced == false:
            evict slots[hand]
            slots[hand] = new entry
            hand = (hand + 1) % capacity
            return
        else:
            slots[hand].referenced = false
            hand = (hand + 1) % capacity
```

### Where to Use This

- **Linux kernel page cache** variants.
- **Database buffer managers** needing cheap LRU approximation.
- **Embedded systems** avoiding pointer-heavy DLL.

### Tradeoffs and When NOT to Use This

- **Approximate**-can evict recently used if bit cleared during sweep.
- Full cache scan under pressure adds latency jitter.
- Less precise than true LRU under adversarial patterns.

---

## Size-Based Cache Eviction

### Theory

Evict by **total bytes**, not key count. Large objects (video thumbnails, JSON blobs) dominate RAM. Track `current_bytes` and `max_bytes`; on insert, evict until `freed >= incoming_size`.

Eviction order often combined with LRU/LFU: **among keys, evict LRU until space**.

- **Put large object:** may trigger multiple evictions
- **Space accounting:** per-entry `size` metadata required

### Dry Run Example

`max_bytes = 100`. A=40B, B=40B, C=30B → total 110, over limit.

| Step | Operation | Bytes used | Evicted |
|------|-----------|------------|---------|
| 1 | put A(40) | 40 | - |
| 2 | put B(40) | 80 | - |
| 3 | put C(30) | 110 → evict LRU A | **A**, now 70 |
| 4 | C fits | 70+30=100 | - |

### Pseudocode

```text
function put(key, value, size):
    if key exists:
        current_bytes -= old_size(key)
    while current_bytes + size > max_bytes:
        victim = select_by_policy()  // LRU, LFU, etc.
        current_bytes -= size(victim)
        delete victim
    store(key, value, size)
    current_bytes += size
```

### Where to Use This

- **CDN caches** storing heterogeneous assets (1 KB JSON vs 2 MB image).
- **In-process object caches** (parsed protobufs, image decode buffers).
- **Memcached** with `-I` item size limits (slab allocation is size-class based).

### Tradeoffs and When NOT to Use This

- **Small-key overhead:** tracking sizes for tiny keys may not be worth it-use count-based cache.
- **Eviction storms** when one huge object arrives.
- Policy coupling: size-based *what to free* still needs LRU/LFU *whom to pick*.

---

## Priority-Based Cache Eviction

### Theory

Each key carries a **priority score** (business value, SLA tier, cost to recompute). Evict lowest priority first. **Redis** expresses this via:

- `volatile-lru` vs `allkeys-lru` (only keys with TTL participate vs all keys)
- **Manual:** `maxmemory-policy` + application-side key naming and selective TTL
- **Redis 7+:** hash-field TTL, custom modules

General pattern: `evict argmin(priority)`, ties broken by LRU.

### Dry Run Example

Capacity = **3**. Priorities: config=10, user:99=5, user:42=1, analytics=2.

| Step | Operation | Cache | Evicted |
|------|-----------|-------|---------|
| 1 | load all four | over capacity | evict **user:42** (prio 1) |
| 2 | memory pressure | - | then **analytics** (2) |

### Pseudocode

```text
function evict():
    victim = min_by(map, key => (priority(key), last_used(key)))
    delete victim

function priority(key):
    if key.starts_with("config:"): return 10
    if has_ttl(key): return 5
    return 1
```

### Where to Use This

- **Multi-tenant SaaS** (paying tier keys survive longer).
- **Config vs user data** in same Redis (`volatile-lru` on session keys only).
- **Precomputed aggregates** with different recompute costs.

### Tradeoffs and When NOT to Use This

- **Priority misconfiguration** evicts revenue-critical keys.
- **Operational complexity**-priorities drift across services.
- Requires discipline: key naming conventions, TTL hygiene, documentation.

---

## Comparison Table: Cache Eviction Strategies

| Strategy | Get | Put | Space overhead | Best access pattern | Worst case | Real-world implementations |
|----------|-----|-----|----------------|---------------------|------------|---------------------------|
| **LRU** | O(1) | O(1) | pointers / list | temporal locality, hot sets | full scan / one-hit wonders | Redis `allkeys-lru`, Nginx, CPU caches |
| **LFU** | O(1)* | O(1)* | frequency counters | skewed popularity | new key starvation | Redis `allkeys-lfu`, some CDNs |
| **MRU** | O(1) | O(1) | list | sequential scan | normal web traffic | DB buffer pools (niche) |
| **FIFO** | O(1) | O(1) | queue | streaming, insert order | any hot early key | simple embedded caches |
| **LIFO** | O(1) | O(1) | stack | stack-like depth | almost everything shared | rare |
| **Random** | O(1) | O(1) | none | uniform random access | strong locality workloads | Redis `allkeys-random`, Memcached |
| **TTL** | O(1) | O(1) | expiry metadata | time-bound correctness | unbounded insert rate | DNS, sessions, rate limits |
| **LRU-K** | O(1)–O(log n) | similar | access history | scan + hot set mixed | tuning K | DB2 buffer pool |
| **ARC** | O(1) amortised | O(1) amortised | ghost metadata | adaptive mixed | complexity / memory | ZFS-inspired designs |
| **CLOCK** | O(1) | O(1) amortised | ref bit | OS page caches | approximate LRU gaps | Linux page cache |
| **Size-based** | O(1) | O(n) evictions | size field | heterogeneous object sizes | large blob insertion | CDN, Memcached slabs |
| **Priority** | O(1) | O(1) | priority meta | tiered SLA data | wrong priority map | Redis `volatile-*`, custom apps |

\*LFU with aging approximations as in Redis.

---

## How to Choose the Right Eviction Strategy

### Access pattern → policy

| Pattern | Winning strategy | Why |
|---------|------------------|-----|
| **Strong recency** (sessions, feeds) | LRU or TTL+LRU | recent = reused |
| **Heavy frequency skew** (top products) | LFU + aging | protect genuinely popular |
| **Sequential scan** | MRU or LRU-K | prevent scan from flushing hot set |
| **Uniform random** | Random or FIFO | metadata not worth it |
| **Time-bounded correctness** | TTL first | correctness gate |
| **Unknown / mixed** | ARC or sampled LRU/LFU | adapt without perfect model |
| **Heterogeneous sizes** | Size-weighted LRU | bytes matter, not key count |
| **Business tiers** | Priority + LRU tie-break | revenue-aware retention |

### Decision tree (text)

```text
Start
│
├─ Must data expire for correctness (legal/session/security)?
│   YES → Set TTL. Memory still tight?
│         YES → add volatile-lru / volatile-lfu on Redis
│         NO  → TTL alone may suffice
│
├─ Is working set >> cache (constant churn)?
│   YES → fix capacity or shard; policy alone won't save you
│
├─ Access mostly recency-driven?
│   YES → LRU (or Redis allkeys-lru)
│
├─ Access mostly popularity-driven (power law)?
│   YES → LFU (or Redis allkeys-lfu)
│
├─ Scan + hot set coexist?
│   YES → LRU-K or ARC
│
├─ Object sizes vary 1000×?
│   YES → size-based eviction + LRU among victims
│
├─ SLA tiers differ?
│   YES → priority-based + explicit TTL on low tiers
│
└─ Unknown workload, need ship now?
    → Redis allkeys-lru + measure; iterate with LFU if skewed
```

**Process:** instrument hit ratio and evictions → classify access pattern with traces → load test with production-shaped traffic → re-evaluate quarterly as features shift.

---

## Redis Eviction Policies Deep Dive

Redis enforces `maxmemory` and `maxmemory-policy`. When memory is full, policies decide behaviour.

| Redis policy | Maps to | Behaviour |
|--------------|---------|-----------|
| **noeviction** | none | Reject writes; reads OK. OOM risk if misconfigured. Use when cache loss = outage (locks, job queues without persistence). |
| **allkeys-lru** | approximate LRU | Evict any key; sampled LRU. Default recommendation for pure cache. |
| **volatile-lru** | LRU among TTL keys | Only keys with `EXPIRE` set compete. Non-TTL keys never evicted-can OOM if all keys lack TTL. |
| **allkeys-lfu** | approximate LFU | Evict any key by lowest frequency. Great for skewed hot sets. |
| **volatile-lfu** | LFU among TTL keys | Same as above but TTL-gated pool. |
| **allkeys-random** | random | Evict random key. Low CPU. |
| **volatile-random** | random among TTL | Random from expiring subset. |
| **volatile-ttl** | TTL order | Evict key with **nearest** expire time. Not LRU-purest time-first among volatile keys. |

### Configuration notes

```text
maxmemory 4gb
maxmemory-policy allkeys-lfu
```

- **`noeviction`:** use with **cache aside** only if origin can absorb misses; pairing with durable structures requires monitoring memory.
- **`volatile-lru`:** classic pattern: set TTL on cache entries; keep config keys without TTL small and bounded.
- **`allkeys-lfu`:** Redis counts accesses with logarithmic increment + decay-tune `lfu-log-factor` and `lfu-decay-time` for workloads.
- **Eviction vs expiration:** expired keys are removed lazily and actively; eviction is separate pressure when memory full before TTL fires.

### Memcached contrast

Memcached uses **slab allocation** + **LRU per slab class** (size bucket). Large items do not evict small ones and vice versa. No built-in LFU; TTL is per-item. **Cache miss** on full slab evicts LRU tail in that class-closer to **size-based + LRU**.

---

## FAQ: Cache Eviction

**Q: What happens when cache is full?**

A: Depends on policy and engine. Redis with `allkeys-lru`/`lfu` evicts existing keys to admit new writes. `noeviction` returns errors on writes. Memcached evicts LRU tail in the item's slab class. CDNs may evict or reject depending on configuration. The common theme: **something leaves or something fails**.

**Q: LRU vs LFU-which is better?**

A: Neither is universal. **LRU** wins when **recent** access predicts future use (sessions, timelines). **LFU** wins when **popularity** is stable and skewed (catalog heroes). Many production Redis clusters moved to **allkeys-lfu** for skewed web workloads; LRU remains the default mental model. Measure your hit ratio under both.

**Q: How does Redis choose which keys to evict?**

A: For LRU/LFU policies, Redis uses **approximate eviction**: sample `maxmemory-samples` keys (default 5), evict the best candidate among them (oldest idle time for LRU, lowest frequency for LFU). This avoids maintaining a global LRU list on millions of keys.

**Q: Is cache eviction the same as cache invalidation?**

A: No. **Eviction** removes entries because of **space** or **TTL expiry**. **Invalidation** removes or marks entries stale because **data changed** (write-through, pub/sub, version bump). You need both designs in production systems.

**Q: Can TTL alone prevent out-of-memory errors?**

A: Not if ingress rate × key size × lifetime exceeds `maxmemory`. TTL bounds **lifetime**, not **peak volume**. Combine TTL with `maxmemory` and an eviction policy, or shard horizontally.

**Q: Why did my hit ratio drop after deploying a batch job?**

A: Classic **cache pollution**: scan touches many cold keys once, LRU marks them recent, evicting the real hot set. Mitigations: **dedicated read replicas**, **cache aside with separate scan cache**, **LRU-K/ARC**, **CLIENT PAUSE** isolation, or **prevent scans** from sharing the hot cache pool.

**Q: Which Redis policy should I use for a session store?**

A: Set **TTL per session** (security). Use **`volatile-lru`** or **`volatile-lfu`** so only expiring session keys compete, and keep non-session data out of that DB-or use a separate Redis instance. Ensure every session key has TTL to avoid `volatile-*` policies ignoring non-expiring keys while memory climbs.

---

## Conclusion

**Cache eviction** is the governance layer for finite RAM in distributed systems. The strategies-**LRU**, **LFU**, **FIFO**, **TTL**, **ARC**, **CLOCK**, size and priority variants-are not interchangeable labels; they encode assumptions about how your data is accessed. Violate those assumptions and you pay in **cache misses**, database load, and tail latency.

Practical takeaways:

1. **Measure** hit ratio, evictions, and memory before tuning policy.
2. **Match policy to pattern:** recency → LRU; popularity → LFU; correctness → TTL; mixed → ARC or careful pool separation.
3. **Redis:** start with `allkeys-lru` or `allkeys-lfu`; use `volatile-*` when only some keys should compete; avoid `noeviction` unless you mean it.
4. **Separate pools** for batch scans vs interactive traffic when politics allow-it is often cheaper than the perfect algorithm.

Forward-looking: modern stacks stack caches-browser, CDN, edge worker, regional Redis, application local cache-each tier evicts differently. **Multi-tier** designs need consistent TTL and invalidation stories, not just hit ratio per node. **ML-driven admission** (whether to cache at all) and **adaptive policies** like ARC point at caches that tune themselves as workloads drift. Eviction will stay central; the sophistication is moving from *which key* to *whether caching this key is worth any RAM at all*.

Pick a policy. Ship. Watch `evicted_keys`. Adjust. That loop is production caching.
