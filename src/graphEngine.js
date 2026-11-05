// Graph Atlas trace engine.
// Each item in the returned array is an immutable teaching snapshot. Algorithm
// implementations use adjacency lists, indexed queues, and binary min-heaps.

function buildAdj(nodes, edges, directed) {
  const adj = Array.from({ length: nodes.length }, () => []);
  for (const edge of edges) {
    adj[edge.from].push({ to: edge.to, w: edge.w, id: edge.id });
    if (!directed) adj[edge.to].push({ to: edge.from, w: edge.w, id: edge.id });
  }
  // Stable neighbor order makes traces repeatable and easier to teach.
  for (const list of adj) list.sort((a, b) => a.to - b.to || a.id - b.id);
  return adj;
}

function heapPush(heap, value, compare) {
  heap.push(value);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (compare(heap[parent], heap[index]) <= 0) break;
    [heap[parent], heap[index]] = [heap[index], heap[parent]];
    index = parent;
  }
}

function heapPop(heap, compare) {
  if (!heap.length) return null;
  const first = heap[0];
  const last = heap.pop();
  if (heap.length) {
    heap[0] = last;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < heap.length && compare(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < heap.length && compare(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }
  return first;
}

const finiteOrNull = values => values.map(value => Number.isFinite(value) ? value : null);
const labelsOf = (indices, nodes) => indices.map(index => nodes[index]?.label ?? String(index));

export function makeSteps(nodes, edges, directed, mode, source = 0) {
  const n = nodes.length;
  if (!n) return [];
  if (!Number.isInteger(source) || source < 0 || source >= n) {
    return [{ message: 'Choose a valid start vertex before running the algorithm.' }];
  }

  const adj = buildAdj(nodes, edges, directed);
  const steps = [];
  const base = {
    visited: [], discovered: [], frontier: [], queue: [], stack: [], priorityQueue: [],
    dist: Array(n).fill(null), parent: Array(n).fill(null), parentEdge: Array(n).fill(null),
    activeEdges: [], chosenEdges: [], rejectedEdges: [], order: [], current: null,
    indegree: [], edgeQueue: [], components: [], relaxationLog: [], operation: null,
    pass: null, totalWeight: 0, negativeCycle: false
  };

  const add = (state, message, operation = null) => {
    const snapshot = {
      ...base,
      ...state,
      visited: [...(state.visited || [])],
      discovered: [...(state.discovered || [])],
      frontier: [...(state.frontier || [])],
      queue: [...(state.queue || [])],
      stack: [...(state.stack || [])],
      priorityQueue: (state.priorityQueue || []).map(item => ({ ...item })),
      dist: [...(state.dist || [])],
      parent: [...(state.parent || [])],
      parentEdge: [...(state.parentEdge || [])],
      activeEdges: [...(state.activeEdges || [])],
      chosenEdges: [...(state.chosenEdges || [])],
      rejectedEdges: [...(state.rejectedEdges || [])],
      order: [...(state.order || [])],
      indegree: [...(state.indegree || [])],
      edgeQueue: (state.edgeQueue || []).map(item => ({ ...item })),
      components: (state.components || []).map(group => [...group]),
      relaxationLog: (state.relaxationLog || []).map(item => ({ ...item })),
      operation: operation ? { ...operation } : state.operation ? { ...state.operation } : null,
      message
    };
    steps.push(snapshot);
  };

  const updateFrontier = (state, type, items) => {
    state.frontier = [...items];
    if (type === 'queue') state.queue = [...items];
    if (type === 'stack') state.stack = [...items];
  };

  if (mode === 'bfs') {
    const seen = Array(n).fill(false);
    const state = { ...base };
    const queue = [source];
    let head = 0;
    seen[source] = true;
    state.discovered = [source];
    state.dist[source] = 0;
    updateFrontier(state, 'queue', queue);
    add(state, `${nodes[source].label} is the start vertex. Add it to the back of the FIFO queue.`, {
      type: 'enqueue', to: source
    });

    while (head < queue.length) {
      const u = queue[head++];
      state.current = u;
      updateFrontier(state, 'queue', queue.slice(head));
      state.visited.push(u);
      state.order.push(u);
      add(state, `Remove ${nodes[u].label} from the front of the queue and process it.`, {
        type: 'dequeue', from: u
      });

      for (const edge of adj[u]) {
        const v = edge.to;
        state.activeEdges = [edge.id];
        if (!seen[v]) {
          seen[v] = true;
          state.discovered.push(v);
          state.parent[v] = u;
          state.parentEdge[v] = edge.id;
          state.dist[v] = state.dist[u] + 1;
          queue.push(v);
          updateFrontier(state, 'queue', queue.slice(head));
          add(state, `${nodes[v].label} is undiscovered. Set its parent to ${nodes[u].label}, record distance ${state.dist[v]}, and enqueue it.`, {
            type: 'enqueue', from: u, to: v, edgeId: edge.id
          });
        } else {
          add(state, `${nodes[v].label} has already been discovered, so do not enqueue it again.`, {
            type: 'skip-discovered', from: u, to: v, edgeId: edge.id
          });
        }
      }
      state.activeEdges = [];
    }
    state.current = null;
    updateFrontier(state, 'queue', []);
    add(state, `BFS is complete. Visit order: ${labelsOf(state.order, nodes).join(' → ')}.`, { type: 'complete' });
    return steps;
  }

  if (mode === 'dfs') {
    // Explicit recursion frames reproduce recursive DFS order and backtracking.
    const seen = Array(n).fill(false);
    const frames = [{ vertex: source, nextNeighbor: 0 }];
    const state = { ...base };
    seen[source] = true;
    state.discovered = [source];
    state.visited = [source];
    state.order = [source];
    updateFrontier(state, 'stack', [source]);
    state.current = source;
    add(state, `Discover ${nodes[source].label}. Push its DFS call frame onto the stack.`, {
      type: 'push', to: source
    });

    while (frames.length) {
      const frame = frames[frames.length - 1];
      const u = frame.vertex;
      state.current = u;
      if (frame.nextNeighbor >= adj[u].length) {
        frames.pop();
        const stackVertices = frames.map(item => item.vertex);
        updateFrontier(state, 'stack', stackVertices);
        state.current = frames.length ? frames[frames.length - 1].vertex : null;
        add(state, `All neighbors of ${nodes[u].label} have been examined. Pop its frame and backtrack${frames.length ? ` to ${nodes[state.current].label}` : ''}.`, {
          type: 'pop', from: u
        });
        continue;
      }

      const edge = adj[u][frame.nextNeighbor++];
      const v = edge.to;
      state.activeEdges = [edge.id];
      if (!seen[v]) {
        seen[v] = true;
        state.discovered.push(v);
        state.visited.push(v);
        state.order.push(v);
        state.parent[v] = u;
        state.parentEdge[v] = edge.id;
        frames.push({ vertex: v, nextNeighbor: 0 });
        updateFrontier(state, 'stack', frames.map(item => item.vertex));
        state.current = v;
        add(state, `${nodes[v].label} is undiscovered. Record ${nodes[u].label} as its parent and descend by pushing ${nodes[v].label} onto the stack.`, {
          type: 'push', from: u, to: v, edgeId: edge.id
        });
      } else {
        add(state, `${nodes[v].label} is already discovered. Keep the current DFS frame and inspect its next neighbor.`, {
          type: 'skip-discovered', from: u, to: v, edgeId: edge.id
        });
      }
    }
    state.activeEdges = [];
    state.current = null;
    updateFrontier(state, 'stack', []);
    add(state, `DFS is complete. Discovery order: ${labelsOf(state.order, nodes).join(' → ')}.`, { type: 'complete' });
    return steps;
  }

  if (mode === 'dijkstra') {
    if (edges.some(edge => edge.w < 0)) {
      return [{ ...base, message: 'Dijkstra cannot run on a graph with a negative edge. Choose Bellman–Ford or edit the edge weights.' }];
    }
    const dist = Array(n).fill(Infinity);
    const parent = Array(n).fill(null);
    const parentEdge = Array(n).fill(null);
    const settled = Array(n).fill(false);
    const pq = [];
    const compareDistance = (a, b) => a.d - b.d || a.u - b.u;
    const queueSnapshot = () => pq
      .filter(item => !settled[item.u] && item.d === dist[item.u])
      .sort(compareDistance)
      .map(item => ({ kind: 'vertex', vertex: item.u, priority: item.d }));
    heapPush(pq, { d: 0, u: source }, compareDistance);
    dist[source] = 0;
    const state = { ...base, dist: finiteOrNull(dist), parent, parentEdge, discovered: [source], priorityQueue: queueSnapshot() };
    add(state, `Initialize d(${nodes[source].label}) = 0. All other tentative distances are ∞. Insert the start vertex into the min-priority queue.`, {
      type: 'insert-priority', to: source, priority: 0
    });

    while (pq.length) {
      const popped = heapPop(pq, compareDistance);
      if (settled[popped.u] || popped.d !== dist[popped.u]) {
        state.priorityQueue = queueSnapshot();
        add(state, `Discard the stale queue entry for ${nodes[popped.u].label}; a better entry already exists.`, {
          type: 'skip-stale', to: popped.u, priority: popped.d
        });
        continue;
      }
      const { d, u } = popped;
      settled[u] = true;
      state.current = u;
      state.visited = settled.map((yes, i) => yes ? i : -1).filter(i => i >= 0);
      state.discovered = [...state.visited];
      state.dist = finiteOrNull(dist);
      state.priorityQueue = queueSnapshot();
      add(state, `Extract ${nodes[u].label} with the smallest tentative distance (${d}). Its distance is now final.`, {
        type: 'extract-min', from: u, priority: d
      });

      for (const edge of adj[u]) {
        const v = edge.to;
        state.activeEdges = [edge.id];
        const old = dist[v];
        const candidate = dist[u] + edge.w;
        if (!settled[v] && candidate < old) {
          dist[v] = candidate;
          parent[v] = u;
          parentEdge[v] = edge.id;
          if (!state.discovered.includes(v)) state.discovered.push(v);
          heapPush(pq, { d: candidate, u: v }, compareDistance);
          state.dist = finiteOrNull(dist);
          state.parent = parent;
          state.parentEdge = parentEdge;
          state.priorityQueue = queueSnapshot();
          state.relaxationLog = [...state.relaxationLog, { from: u, to: v, old: Number.isFinite(old) ? old : null, next: candidate, weight: edge.w, edgeId: edge.id, accepted: true }].slice(-8);
          add(state, `Relax ${nodes[u].label} → ${nodes[v].label}: ${Number.isFinite(old) ? old : '∞'} becomes ${candidate}. Update its parent and insert a new priority entry.`, {
            type: 'relax', from: u, to: v, edgeId: edge.id, weight: edge.w, old: Number.isFinite(old) ? old : null, next: candidate, accepted: true
          });
        } else {
          state.relaxationLog = [...state.relaxationLog, { from: u, to: v, old: Number.isFinite(old) ? old : null, next: Number.isFinite(old) ? old : null, weight: edge.w, edgeId: edge.id, accepted: false }].slice(-8);
          add(state, `No improvement for ${nodes[v].label}: candidate ${candidate} is not smaller than ${Number.isFinite(old) ? old : '∞'}.`, {
            type: 'relax', from: u, to: v, edgeId: edge.id, weight: edge.w, old: Number.isFinite(old) ? old : null, next: Number.isFinite(old) ? old : null, accepted: false
          });
        }
      }
      state.activeEdges = [];
    }
    state.current = null;
    state.dist = finiteOrNull(dist);
    state.parent = parent;
    state.parentEdge = parentEdge;
    state.priorityQueue = [];
    add(state, 'Dijkstra is complete. Settled distances are final; vertices marked ∞ are unreachable from the start.', { type: 'complete' });
    return steps;
  }

  if (mode === 'bellman') {
    const arcs = edges.flatMap(edge => directed
      ? [{ from: edge.from, to: edge.to, w: edge.w, id: edge.id }]
      : [{ from: edge.from, to: edge.to, w: edge.w, id: edge.id }, { from: edge.to, to: edge.from, w: edge.w, id: edge.id }]);
    const dist = Array(n).fill(Infinity);
    const parent = Array(n).fill(null);
    const parentEdge = Array(n).fill(null);
    dist[source] = 0;
    const state = { ...base, dist: finiteOrNull(dist), parent, parentEdge, discovered: [source] };
    add(state, `Initialize d(${nodes[source].label}) = 0. Relax every directed arc for up to V − 1 passes.`, { type: 'initialize', to: source });

    for (let pass = 1; pass < n; pass++) {
      let changed = false;
      state.pass = pass;
      state.current = null;
      add(state, `Pass ${pass} of ${n - 1}: inspect each arc in order.`, { type: 'start-pass', pass });
      for (const arc of arcs) {
        state.current = arc.from;
        state.activeEdges = [arc.id];
        if (Number.isFinite(dist[arc.from]) && dist[arc.from] + arc.w < dist[arc.to]) {
          const old = dist[arc.to];
          const next = dist[arc.from] + arc.w;
          dist[arc.to] = next;
          parent[arc.to] = arc.from;
          parentEdge[arc.to] = arc.id;
          changed = true;
          if (!state.discovered.includes(arc.to)) state.discovered.push(arc.to);
          state.dist = finiteOrNull(dist);
          state.parent = parent;
          state.parentEdge = parentEdge;
          state.relaxationLog = [...state.relaxationLog, { from: arc.from, to: arc.to, old: Number.isFinite(old) ? old : null, next, weight: arc.w, edgeId: arc.id, accepted: true, pass }].slice(-8);
          add(state, `Relax ${nodes[arc.from].label} → ${nodes[arc.to].label}: ${Number.isFinite(old) ? old : '∞'} becomes ${next}.`, {
            type: 'relax', from: arc.from, to: arc.to, edgeId: arc.id, weight: arc.w, old: Number.isFinite(old) ? old : null, next, accepted: true, pass
          });
        } else {
          const old = Number.isFinite(dist[arc.to]) ? dist[arc.to] : null;
          state.relaxationLog = [...state.relaxationLog, { from: arc.from, to: arc.to, old, next: old, weight: arc.w, edgeId: arc.id, accepted: false, pass }].slice(-8);
          add(state, `No improvement through ${nodes[arc.from].label} → ${nodes[arc.to].label}.`, {
            type: 'relax', from: arc.from, to: arc.to, edgeId: arc.id, weight: arc.w, old, next: old, accepted: false, pass
          });
        }
      }
      state.activeEdges = [];
      if (!changed) {
        add(state, 'No distance changed during this pass. Stop early; later passes cannot improve anything.', { type: 'early-stop', pass });
        break;
      }
    }

    const negativeCycleArc = arcs.find(arc => Number.isFinite(dist[arc.from]) && dist[arc.from] + arc.w < dist[arc.to]);
    state.current = null;
    state.activeEdges = negativeCycleArc ? [negativeCycleArc.id] : [];
    state.dist = finiteOrNull(dist);
    state.parent = parent;
    state.parentEdge = parentEdge;
    state.negativeCycle = Boolean(negativeCycleArc);
    if (negativeCycleArc) {
      add(state, `A reachable negative-weight cycle exists (detected on ${nodes[negativeCycleArc.from].label} → ${nodes[negativeCycleArc.to].label}). Shortest paths are undefined for vertices reachable from that cycle.`, {
        type: 'negative-cycle', from: negativeCycleArc.from, to: negativeCycleArc.to, edgeId: negativeCycleArc.id
      });
    } else {
      add(state, 'Bellman–Ford is complete. No reachable negative-weight cycle was found. Unreachable vertices remain at ∞.', { type: 'complete' });
    }
    return steps;
  }

  if (mode === 'prim' || mode === 'kruskal') {
    if (directed) return [{ ...base, message: 'Minimum spanning trees are defined for undirected graphs. Turn off Directed to continue.' }];
    const chosen = [];
    const rejected = [];
    const state = { ...base };

    if (mode === 'kruskal') {
      const sorted = [...edges].sort((a, b) => a.w - b.w || a.id - b.id);
      const parent = Array.from({ length: n }, (_, i) => i);
      const size = Array(n).fill(1);
      const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
      const componentSnapshot = () => {
        const groups = new Map();
        for (let vertex = 0; vertex < n; vertex++) {
          const root = find(vertex);
          if (!groups.has(root)) groups.set(root, []);
          groups.get(root).push(vertex);
        }
        return [...groups.values()];
      };
      state.edgeQueue = sorted.map(edge => ({ id: edge.id, from: edge.from, to: edge.to, weight: edge.w }));
      state.components = componentSnapshot();
      add(state, 'Sort edges from lowest to highest weight. Initially, every vertex is its own disjoint set.', { type: 'sort-edges' });
      for (const edge of sorted) {
        let a = find(edge.from);
        let b = find(edge.to);
        state.activeEdges = [edge.id];
        state.edgeQueue = sorted.filter(candidate => !chosen.includes(candidate.id) && !rejected.includes(candidate.id)).map(candidate => ({ id: candidate.id, from: candidate.from, to: candidate.to, weight: candidate.w }));
        if (a !== b) {
          if (size[a] < size[b]) [a, b] = [b, a];
          parent[b] = a;
          size[a] += size[b];
          chosen.push(edge.id);
          state.chosenEdges = [...chosen];
          state.totalWeight = edges.filter(candidate => chosen.includes(candidate.id)).reduce((sum, candidate) => sum + candidate.w, 0);
          state.edgeQueue = sorted.filter(candidate => !chosen.includes(candidate.id) && !rejected.includes(candidate.id)).map(candidate => ({ id: candidate.id, from: candidate.from, to: candidate.to, weight: candidate.w }));
          state.components = componentSnapshot();
          add(state, `Accept ${nodes[edge.from].label}—${nodes[edge.to].label} (weight ${edge.w}). The edge joins two different components.`, {
            type: 'accept-edge', from: edge.from, to: edge.to, edgeId: edge.id, weight: edge.w
          });
        } else {
          rejected.push(edge.id);
          state.rejectedEdges = [...rejected];
          state.edgeQueue = sorted.filter(candidate => !chosen.includes(candidate.id) && !rejected.includes(candidate.id)).map(candidate => ({ id: candidate.id, from: candidate.from, to: candidate.to, weight: candidate.w }));
          add(state, `Reject ${nodes[edge.from].label}—${nodes[edge.to].label}. Both endpoints are already in the same component, so this edge would create a cycle.`, {
            type: 'reject-edge', from: edge.from, to: edge.to, edgeId: edge.id, weight: edge.w
          });
        }
        if (chosen.length === n - 1) break;
      }
      state.activeEdges = [];
      state.edgeQueue = [];
      const total = edges.filter(edge => chosen.includes(edge.id)).reduce((sum, edge) => sum + edge.w, 0);
      const connected = chosen.length === n - 1;
      state.totalWeight = total;
      state.components = componentSnapshot();
      add(state, `Kruskal finished: ${connected ? 'minimum spanning tree' : 'minimum spanning forest'} with ${chosen.length} selected edge(s), total weight ${total}.`, { type: 'complete' });
    } else {
      const used = Array(n).fill(false);
      const key = Array(n).fill(null);
      const parent = Array(n).fill(null);
      let total = 0;
      const rootOrder = [source, ...Array.from({ length: n }, (_, index) => index).filter(index => index !== source)];
      const compareEdge = (a, b) => a.w - b.w || a.id - b.id || a.u - b.u;
      const pq = [];
      const queueSnapshot = () => [...pq]
        .sort(compareEdge)
        .map(edge => ({ kind: 'edge', from: edge.from, vertex: edge.u, priority: edge.w, id: edge.id }));

      for (const root of rootOrder) {
        if (used[root]) continue;
        if (state.visited.length) {
          state.current = root;
          add(state, `No edge connects the remaining vertices to the current tree. Start a new tree at ${nodes[root].label}.`, { type: 'new-component', to: root });
        }
        used[root] = true;
        state.visited = [...state.visited, root];
        state.order = [...state.order, root];
        key[root] = 0;
        state.dist = [...key];
        state.parent = [...parent];
        const addOutgoing = u => {
          for (const edge of adj[u]) {
            if (!used[edge.to]) heapPush(pq, { w: edge.w, u: edge.to, from: u, id: edge.id }, compareEdge);
          }
        };
        addOutgoing(root);
        state.priorityQueue = queueSnapshot();
        add(state, `Begin Prim's tree at ${nodes[root].label}. Add every edge leaving this tree to the min-priority queue.`, { type: 'start-tree', to: root });

        while (pq.length) {
          const edge = heapPop(pq, compareEdge);
          state.priorityQueue = queueSnapshot();
          if (used[edge.u]) {
            add(state, `Discard ${nodes[edge.from].label}—${nodes[edge.u].label}; its destination is already in the tree.`, {
              type: 'skip-internal-edge', from: edge.from, to: edge.u, edgeId: edge.id, weight: edge.w
            });
            continue;
          }
          used[edge.u] = true;
          key[edge.u] = edge.w;
          parent[edge.u] = edge.from;
          chosen.push(edge.id);
          total += edge.w;
          state.current = edge.u;
          state.visited = [...state.visited, edge.u];
          state.discovered = [...state.visited];
          state.order = [...state.order, edge.u];
          state.chosenEdges = [...chosen];
          state.dist = [...key];
          state.parent = [...parent];
          state.activeEdges = [edge.id];
          addOutgoing(edge.u);
          state.priorityQueue = queueSnapshot();
          state.totalWeight = total;
          add(state, `Accept ${nodes[edge.from].label}—${nodes[edge.u].label} (weight ${edge.w}), the cheapest edge currently leaving the tree.`, {
            type: 'accept-edge', from: edge.from, to: edge.u, edgeId: edge.id, weight: edge.w
          });
        }
        state.priorityQueue = [];
        state.activeEdges = [];
      }
      state.current = null;
      state.totalWeight = total;
      state.parent = parent;
      state.dist = [...key];
      add(state, `Prim finished. Minimum spanning forest weight: ${total}.`, { type: 'complete' });
    }
    return steps;
  }

  if (mode === 'topo') {
    if (!directed) return [{ ...base, message: 'Topological sorting requires a directed graph. Turn on Directed to continue.' }];
    const indegree = Array(n).fill(0);
    for (const edge of edges) indegree[edge.to]++;
    const queue = [];
    let head = 0;
    indegree.forEach((value, index) => { if (value === 0) queue.push(index); });
    const state = { ...base, indegree: [...indegree], queue: [...queue], frontier: [...queue], discovered: [...queue] };
    add(state, 'Calculate all indegrees. Vertices with indegree zero have no unmet prerequisites, so they enter the ready queue.', { type: 'initialize-indegree' });
    while (head < queue.length) {
      const u = queue[head++];
      state.current = u;
      state.order.push(u);
      state.visited.push(u);
      state.queue = queue.slice(head);
      state.frontier = [...state.queue];
      add(state, `${nodes[u].label} has indegree zero. Append it to the topological order.`, { type: 'dequeue-ready', from: u });
      for (const edge of adj[u]) {
        state.activeEdges = [edge.id];
        indegree[edge.to]--;
        state.indegree = [...indegree];
        add(state, `Remove ${nodes[u].label} → ${nodes[edge.to].label}. The indegree of ${nodes[edge.to].label} decreases to ${indegree[edge.to]}.`, {
          type: 'decrement-indegree', from: u, to: edge.to, edgeId: edge.id, indegree: indegree[edge.to]
        });
        if (indegree[edge.to] === 0) {
          queue.push(edge.to);
          state.discovered.push(edge.to);
          state.queue = queue.slice(head);
          state.frontier = [...state.queue];
          add(state, `${nodes[edge.to].label} now has indegree zero, so add it to the ready queue.`, { type: 'enqueue-ready', to: edge.to });
        }
      }
    }
    state.activeEdges = [];
    state.current = null;
    state.queue = [];
    state.frontier = [];
    state.indegree = [...indegree];
    add(state, state.order.length === n
      ? `Valid topological order: ${labelsOf(state.order, nodes).join(' → ')}.`
      : `Only ${state.order.length} of ${n} vertices were processed. A directed cycle exists, so no topological ordering is possible.`,
    { type: state.order.length === n ? 'complete' : 'cycle-detected' });
    return steps;
  }

  return [{ ...base, message: 'Choose an algorithm to begin.' }];
}
