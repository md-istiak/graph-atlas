import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSteps } from '../src/graphEngine.js';

const makeNodes = n => Array.from({ length: n }, (_, id) => ({
  id,
  label: String.fromCharCode(65 + id),
  x: 40 + id * 55,
  y: 100
}));
const lastStep = (nodes, edges, directed, mode, source = 0) => {
  const steps = makeSteps(nodes, edges, directed, mode, source);
  assert.ok(steps.length, `${mode} should return execution steps`);
  return steps.at(-1);
};
const sumChosen = (edges, chosen) => edges
  .filter(edge => chosen.includes(edge.id))
  .reduce((total, edge) => total + edge.w, 0);

test('BFS visits reachable vertices and reports minimum hop counts', () => {
  const nodes = makeNodes(5);
  const edges = [
    { id: 0, from: 0, to: 1, w: 8 },
    { id: 1, from: 0, to: 2, w: 1 },
    { id: 2, from: 2, to: 1, w: 1 },
    { id: 3, from: 1, to: 3, w: 1 }
  ];
  const result = lastStep(nodes, edges, false, 'bfs');
  assert.deepEqual(result.dist, [0, 1, 1, 2, null]);
  assert.equal(result.order.length, 4);
});

test('DFS explores only the vertices reachable from its start', () => {
  const nodes = makeNodes(5);
  const edges = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 1, to: 2, w: 1 },
    { id: 2, from: 3, to: 4, w: 1 }
  ];
  const result = lastStep(nodes, edges, false, 'dfs', 0);
  assert.equal(new Set(result.order).size, 3);
  assert.deepEqual([...result.order].sort(), [0, 1, 2]);
});

test('Dijkstra computes shortest costs and rejects negative edges', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 4 },
    { id: 1, from: 0, to: 2, w: 1 },
    { id: 2, from: 2, to: 1, w: 2 },
    { id: 3, from: 1, to: 3, w: 1 },
    { id: 4, from: 2, to: 3, w: 5 }
  ];
  assert.deepEqual(lastStep(nodes, edges, false, 'dijkstra').dist, [0, 3, 1, 4]);
  const invalid = makeSteps(nodes, [{ id: 0, from: 0, to: 1, w: -1 }], false, 'dijkstra');
  assert.match(invalid[0].message, /negative edge/i);
});

test('Bellman–Ford handles negative edges and detects reachable negative cycles', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 4 },
    { id: 1, from: 0, to: 2, w: 5 },
    { id: 2, from: 1, to: 2, w: -3 },
    { id: 3, from: 2, to: 3, w: 2 }
  ];
  assert.deepEqual(lastStep(nodes, edges, true, 'bellman').dist, [0, 4, 1, 3]);

  const cycle = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 1, to: 2, w: -3 },
    { id: 2, from: 2, to: 1, w: 1 }
  ];
  assert.match(lastStep(nodes, cycle, true, 'bellman').message, /reachable negative-weight cycle/i);

  const unreachableCycle = [
    { id: 0, from: 0, to: 1, w: 2 },
    { id: 1, from: 2, to: 3, w: -3 },
    { id: 2, from: 3, to: 2, w: 1 }
  ];
  assert.match(lastStep(nodes, unreachableCycle, true, 'bellman').message, /no reachable negative-weight cycle/i);
});

test('Kruskal and Prim produce a minimum spanning tree of equal weight', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 4 },
    { id: 1, from: 0, to: 2, w: 1 },
    { id: 2, from: 2, to: 1, w: 2 },
    { id: 3, from: 1, to: 3, w: 1 },
    { id: 4, from: 2, to: 3, w: 5 }
  ];
  const kruskal = lastStep(nodes, edges, false, 'kruskal');
  const prim = lastStep(nodes, edges, false, 'prim', 2);
  assert.equal(kruskal.chosenEdges.length, nodes.length - 1);
  assert.equal(prim.chosenEdges.length, nodes.length - 1);
  assert.equal(sumChosen(edges, kruskal.chosenEdges), 4);
  assert.equal(sumChosen(edges, prim.chosenEdges), 4);
  assert.match(kruskal.message, /minimum spanning tree/i);
  assert.match(prim.message, /minimum spanning forest weight: 4/i);
});

test('MST algorithms return a forest on disconnected input and reject directed graphs', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 2 },
    { id: 1, from: 2, to: 3, w: 1 }
  ];
  const result = lastStep(nodes, edges, false, 'kruskal');
  assert.equal(result.chosenEdges.length, 2);
  assert.match(result.message, /minimum spanning forest/i);
  assert.match(makeSteps(nodes, edges, true, 'prim')[0].message, /undirected/i);
});

test('Kahn topological sort respects edges and identifies cycles', () => {
  const nodes = makeNodes(4);
  const dag = [
    { id: 0, from: 0, to: 2, w: 1 },
    { id: 1, from: 1, to: 2, w: 1 },
    { id: 2, from: 2, to: 3, w: 1 }
  ];
  const order = lastStep(nodes, dag, true, 'topo').order;
  assert.equal(order.length, 4);
  assert.ok(order.indexOf(0) < order.indexOf(2));
  assert.ok(order.indexOf(1) < order.indexOf(2));
  assert.ok(order.indexOf(2) < order.indexOf(3));
  const cycle = [...dag, { id: 3, from: 3, to: 1, w: 1 }];
  assert.match(lastStep(nodes, cycle, true, 'topo').message, /directed cycle/i);
  assert.match(makeSteps(nodes, dag, false, 'topo')[0].message, /directed graph/i);
});

test('randomized Dijkstra and MST results match independent reference checks', () => {
  let seed = 92341;
  const random = max => { seed = (seed * 48271) % 2147483647; return seed % max; };
  for (let trial = 0; trial < 40; trial++) {
    const n = 2 + random(8);
    const nodes = makeNodes(n);
    const edges = [];
    let id = 0;
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (random(4) !== 0) edges.push({ id: id++, from: u, to: v, w: random(16) });
      }
    }
    const source = random(n);
    const actual = lastStep(nodes, edges, false, 'dijkstra', source).dist;
    const expected = Array(n).fill(Infinity);
    const used = Array(n).fill(false);
    expected[source] = 0;
    for (let count = 0; count < n; count++) {
      let u = -1;
      for (let v = 0; v < n; v++) if (!used[v] && (u < 0 || expected[v] < expected[u])) u = v;
      if (u < 0 || !Number.isFinite(expected[u])) break;
      used[u] = true;
      for (const edge of edges) {
        if (edge.from === u) expected[edge.to] = Math.min(expected[edge.to], expected[u] + edge.w);
        if (edge.to === u) expected[edge.from] = Math.min(expected[edge.from], expected[u] + edge.w);
      }
    }
    assert.deepEqual(actual, expected.map(value => Number.isFinite(value) ? value : null));

    const kruskal = lastStep(nodes, edges, false, 'kruskal', source);
    const prim = lastStep(nodes, edges, false, 'prim', source);
    assert.equal(sumChosen(edges, kruskal.chosenEdges), sumChosen(edges, prim.chosenEdges));
    assert.equal(kruskal.chosenEdges.length, prim.chosenEdges.length);
  }
});

test('randomized Bellman–Ford matches dynamic relaxation on DAGs with negative edges', () => {
  let seed = 18973;
  const random = max => { seed = (seed * 48271) % 2147483647; return seed % max; };
  for (let trial = 0; trial < 40; trial++) {
    const n = 2 + random(7);
    const nodes = makeNodes(n);
    const edges = [];
    let id = 0;
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (random(3) !== 0) edges.push({ id: id++, from: u, to: v, w: random(17) - 8 });
      }
    }
    const source = random(n);
    const actual = lastStep(nodes, edges, true, 'bellman', source).dist;
    const expected = Array(n).fill(Infinity);
    expected[source] = 0;
    for (let pass = 0; pass < n - 1; pass++) {
      for (const edge of edges) {
        if (Number.isFinite(expected[edge.from])) expected[edge.to] = Math.min(expected[edge.to], expected[edge.from] + edge.w);
      }
    }
    assert.deepEqual(actual, expected.map(value => Number.isFinite(value) ? value : null));
  }
});

test('BFS and DFS traces expose their real FIFO queue and LIFO stack states', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 0, to: 2, w: 1 },
    { id: 2, from: 1, to: 3, w: 1 }
  ];
  const bfs = makeSteps(nodes, edges, false, 'bfs', 0);
  const enqueue = bfs.find(step => step.operation?.type === 'enqueue' && step.operation.to === 1);
  assert.deepEqual(enqueue.queue, [1]);
  assert.deepEqual(enqueue.parent.slice(0, 2), [null, 0]);
  assert.ok(enqueue.discovered.includes(1));
  assert.ok(bfs.some(step => step.operation?.type === 'dequeue'));

  const dfs = makeSteps(nodes, edges, false, 'dfs', 0);
  const pushed = dfs.find(step => step.operation?.type === 'push' && step.operation.to === 2);
  assert.ok(pushed.stack.includes(2));
  assert.ok(dfs.some(step => step.operation?.type === 'pop'));
});

test('Dijkstra trace exposes priority entries, parent links, and accepted/rejected relaxations', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 7 },
    { id: 1, from: 0, to: 2, w: 2 },
    { id: 2, from: 2, to: 1, w: 1 },
    { id: 3, from: 1, to: 3, w: 2 }
  ];
  const steps = makeSteps(nodes, edges, false, 'dijkstra', 0);
  const improved = steps.find(step => step.operation?.type === 'relax' && step.operation.from === 2 && step.operation.to === 1);
  assert.equal(improved.dist[1], 3);
  assert.equal(improved.parent[1], 2);
  assert.equal(improved.parentEdge[1], 2);
  assert.ok(improved.priorityQueue.some(item => item.vertex === 1 && item.priority === 3));
  assert.equal(improved.operation.accepted, true);
  assert.ok(steps.some(step => step.relaxationLog.some(entry => entry.accepted === false)));
});

test('Bellman–Ford trace exposes pass numbers and relaxation history', () => {
  const nodes = makeNodes(3);
  const edges = [
    { id: 0, from: 0, to: 1, w: 4 },
    { id: 1, from: 1, to: 2, w: -6 }
  ];
  const steps = makeSteps(nodes, edges, true, 'bellman', 0);
  const relax = steps.find(step => step.operation?.type === 'relax' && step.operation.accepted);
  assert.ok(relax.pass >= 1);
  assert.ok(relax.relaxationLog.length > 0);
  assert.deepEqual(lastStep(nodes, edges, true, 'bellman').dist, [0, 4, -2]);
});

test('Prim and Kruskal traces expose priority edges and disjoint-set components', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 1, to: 2, w: 2 },
    { id: 2, from: 0, to: 2, w: 3 },
    { id: 3, from: 2, to: 3, w: 4 },
    { id: 4, from: 0, to: 3, w: 5 }
  ];
  const prim = makeSteps(nodes, edges, false, 'prim', 0);
  assert.ok(prim.some(step => step.priorityQueue.some(item => item.kind === 'edge')));
  assert.ok(prim.some(step => step.operation?.type === 'accept-edge'));

  const kruskal = makeSteps(nodes, edges, false, 'kruskal', 0);
  const initial = kruskal[0];
  assert.equal(initial.components.length, 4);
  assert.equal(initial.edgeQueue.length, edges.length);
  assert.ok(kruskal.some(step => step.components.length < 4));
  assert.ok(kruskal.some(step => step.operation?.type === 'reject-edge'));
  assert.ok(kruskal.some(step => step.rejectedEdges.length > 0));
});

test('Kahn trace exposes ready queue and indegree changes', () => {
  const nodes = makeNodes(3);
  const edges = [
    { id: 0, from: 0, to: 2, w: 1 },
    { id: 1, from: 1, to: 2, w: 1 }
  ];
  const steps = makeSteps(nodes, edges, true, 'topo', 0);
  assert.deepEqual(steps[0].queue, [0, 1]);
  const decrement = steps.find(step => step.operation?.type === 'decrement-indegree');
  assert.equal(decrement.indegree[2], 1);
  assert.ok(steps.some(step => step.operation?.type === 'enqueue-ready' && step.operation.to === 2));
});

test('Bellman–Ford recognizes an undirected negative edge as a reachable negative cycle', () => {
  const nodes = makeNodes(2);
  const edges = [{ id: 0, from: 0, to: 1, w: -2 }];
  assert.equal(lastStep(nodes, edges, false, 'bellman').negativeCycle, true);
});

test('invalid start vertices return a helpful trace instead of crashing', () => {
  const nodes = makeNodes(2);
  const result = makeSteps(nodes, [], false, 'bfs', 99);
  assert.match(result[0].message, /valid start vertex/i);
});


test('trace snapshots are independent and do not mutate earlier steps', () => {
  const nodes = makeNodes(3);
  const edges = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 1, to: 2, w: 1 }
  ];
  const steps = makeSteps(nodes, edges, false, 'bfs', 0);
  const first = steps[0];
  const firstQueue = [...first.queue];
  const firstDiscovered = [...first.discovered];
  assert.deepEqual(first.queue, firstQueue);
  assert.deepEqual(first.discovered, firstDiscovered);
  assert.notEqual(steps[0].queue, steps[1].queue);
  assert.notEqual(steps[0].parent, steps[1].parent);
});

test('reachable negative-cycle trace preserves the detected edge operation', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 2 },
    { id: 1, from: 1, to: 2, w: -4 },
    { id: 2, from: 2, to: 1, w: 1 },
    { id: 3, from: 2, to: 3, w: 2 }
  ];
  const final = lastStep(nodes, edges, true, 'bellman');
  assert.equal(final.negativeCycle, true);
  assert.equal(final.operation.type, 'negative-cycle');
  assert.ok(final.activeEdges.includes(final.operation.edgeId));
});

test('iterative DFS preserves recursive neighbor order and parent relationships', () => {
  const nodes = makeNodes(4);
  const edges = [
    { id: 0, from: 0, to: 1, w: 1 },
    { id: 1, from: 0, to: 2, w: 1 },
    { id: 2, from: 1, to: 2, w: 1 },
    { id: 3, from: 2, to: 3, w: 1 }
  ];
  const steps = makeSteps(nodes, edges, false, 'dfs', 0);
  const completed = steps.at(-1);
  assert.deepEqual(completed.order, [0, 1, 2, 3]);
  assert.deepEqual(completed.parent, [null, 0, 1, 2]);
  const descendToTwo = steps.find(step => step.operation?.type === 'push' && step.operation.to === 2);
  assert.deepEqual(descendToTwo.stack, [0, 1, 2]);
  const backtrack = steps.find(step => step.operation?.type === 'pop' && step.operation.from === 3);
  assert.deepEqual(backtrack.stack, [0, 1, 2]);
});
