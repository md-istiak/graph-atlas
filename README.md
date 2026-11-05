# Graph Atlas — Graph Theory Learning Lab (v1.3)

A React + Vite learning website dedicated to graph theory and graph algorithms. Version 1.3 is the final learning-lab release: seven core algorithms now expose their live internal data structures and important decisions, with prepared examples, path reconstruction, and controllable playback speed. It brings together a structured topic library, C++17 learning snippets, practical examples, complexity notes, a glossary, a learning roadmap, references, and an interactive graph editor.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ (recommended) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Run the graph-engine checks with Node's built-in test runner:

```bash
npm test
# or
npm run test:graph
```

To create a production build:

```bash
npm run build
npm run preview
```

The production website is generated in `dist/`.

## Deploy free with Vercel

1. Create a GitHub repository and push this project.
2. Import the repository into Vercel.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. No environment variables or backend are required.

## Features

- 40 lesson entries organized into 10 graph-learning categories.
- Lesson pages with intuition, walkthroughs, complexity, real-world examples, applications, pitfalls, and C++17 snippets or implementation outlines.
- Search across lesson titles, summaries, tags, and categories, with category filtering.
- A five-stage learning roadmap linked directly to its corresponding lessons.
- Progress tracking and the selected color theme saved in browser `localStorage`.
- Light theme by default, optional dark theme, larger type, and responsive layouts.
- Keyboard shortcut `Ctrl + K` / `Cmd + K` to focus global search; `Escape` clears the search or closes the mobile navigation.
- Interactive SVG graph canvas: add up to 20 vertices, drag to reposition, connect vertices, remove edges or the focused vertex, set integer edge weights (including negative weights), and toggle directed graphs.
- Step-by-step visual execution for BFS, DFS, Dijkstra, Bellman–Ford, Prim, Kruskal, and Kahn topological sort.
- Live FIFO queue and LIFO stack snapshots for BFS/DFS; live ready queue and indegrees for Kahn.
- Min-priority queue snapshots for Dijkstra and Prim, plus a sorted pending-edge list and Disjoint Set Union component groups for Kruskal.
- Visited / discovered sets, tentative distances, parent pointers, selected tree edges, current edge operations, and recent accepted/rejected relaxations.
- Shortest-path reconstruction from the chosen source to a selectable destination for BFS, Dijkstra, and Bellman–Ford.
- Prepared examples for unweighted traversal, weighted shortest paths, negative-edge Bellman–Ford, reachable negative-cycle detection, DAG topological sorting, and disconnected minimum spanning forests.
- Playback speed controls, step slider, first/previous/next/play/pause/replay controls, and a direct link to the relevant lesson and C++ reference.
- Algorithm-specific requirements are explained in the lab; incompatible graph settings disable Run and explain how to correct the graph.
- Glossary and curated further-reading links.

## Graph lab behavior and integrity

- Data-structure panels are snapshots of the engine state at the selected step; queue/stack order is shown explicitly, and priority queues are displayed in priority order for readability.

- The lab supports seven common algorithms: BFS, DFS, Dijkstra, Bellman–Ford, Prim, Kruskal, and Kahn topological sort. Advanced algorithms remain in the lesson library, but are not all animated in the lab.
- The canvas is limited to 20 vertices. The editor supports adding vertices, dragging vertices without overlapping existing nodes, connecting vertices, deleting an edge, and removing the focused vertex. Self-loops and duplicate connections are not supported.
- Edge weights must be whole numbers in the range −1,000,000 to 1,000,000. Negative values are useful for Bellman–Ford; Dijkstra is disabled while any negative edge exists.
- “Show weights” changes only the visual labels. BFS and DFS ignore weights and count edges; Dijkstra and Bellman–Ford calculate path costs.
- Prim and Kruskal require an undirected graph. A disconnected graph produces a minimum spanning forest. Prim starts from the selected root.
- Kahn topological sorting requires a directed graph and reports when a directed cycle prevents a complete ordering.
- Bellman–Ford reports a negative cycle only when it is reachable from the selected start vertex. An undirected negative-weight edge creates a reachable negative cycle when its endpoint is reachable.
- Reciprocal directed edges are allowed. Before switching such a graph to undirected, remove one direction of each reciprocal pair using Remove edge.
- Graph edits and changes to the algorithm, direction, or start/root vertex reset the current trace. Theme and lesson progress are saved locally in the browser.
- The lab is designed for small educational examples, not large-graph performance testing. The algorithm engine is separated into `src/graphEngine.js` and has automated tests in `tests/graphEngine.test.js` (run with `npm run test:graph`).

## Topic coverage

Foundations; adjacency list/matrix/edge list; BFS, DFS, multi-source and grid BFS; connected components and cycle detection; bridges, articulation points, Kosaraju and Tarjan SCC; Dijkstra, Bellman–Ford, Floyd–Warshall, 0–1 BFS, DAG shortest paths, Johnson and A*; DSU, Kruskal, Prim and Borůvka; topological sorting; bipartite graphs, matching, Eulerian and Hamiltonian problems; LCA, tree diameter and tree DP; Ford–Fulkerson, Edmonds–Karp, Dinic and min-cut; 2-SAT, centroid decomposition, HLD, TSP and planarity.

## Learning references

The site’s References page links to:

- CP-Algorithms — https://cp-algorithms.com/graph/
- USACO Guide — https://usaco.guide/adv
- VisuAlgo — https://visualgo.net/en
- William Fiset’s algorithms repository — https://github.com/williamfiset/algorithms
- William Fiset’s Graph Theory course — https://www.youtube.com/watch?v=09_LlHjoEiY
- Boost.Graph algorithm overview — https://www.boost.org/latest/libs/graph/doc/html/graph/algorithms/overview.html
- Competitive Programming 2 / USACO Guide PDF — https://usaco.guide/CP2.pdf

Educational content is rewritten as a learning guide and code samples are templates. Verify constraints, edge cases, integer bounds, and indexing before using any snippet in a contest or production system.
