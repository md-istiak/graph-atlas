import React, { useEffect, useMemo, useRef, useState } from 'react';
import { algorithms, algorithmGroups, resources } from './data/algorithms';
import { makeSteps } from './graphEngine.js';

const initialNodes = [
  { id: 0, label: 'A', x: 92, y: 115 }, { id: 1, label: 'B', x: 260, y: 65 },
  { id: 2, label: 'C', x: 438, y: 116 }, { id: 3, label: 'D', x: 620, y: 75 },
  { id: 4, label: 'E', x: 170, y: 300 }, { id: 5, label: 'F', x: 390, y: 302 },
  { id: 6, label: 'G', x: 590, y: 285 }
];
const initialEdges = [
  { id: 0, from: 0, to: 1, w: 4 }, { id: 1, from: 0, to: 4, w: 2 },
  { id: 2, from: 1, to: 2, w: 3 }, { id: 3, from: 1, to: 4, w: 1 },
  { id: 4, from: 2, to: 3, w: 2 }, { id: 5, from: 2, to: 5, w: 4 },
  { id: 6, from: 3, to: 6, w: 3 }, { id: 7, from: 4, to: 5, w: 5 },
  { id: 8, from: 5, to: 6, w: 1 }
];

const glossaryTerms = [
  ['Vertex (node)', 'An entity in a graph. A city, person, task, or state can be represented by a vertex.'],
  ['Edge', 'A relationship or connection between two vertices.'],
  ['Degree', 'The number of incident edges in an undirected graph. Directed graphs distinguish in-degree and out-degree.'],
  ['Path', 'A sequence of vertices where consecutive vertices are connected by edges.'],
  ['Cycle', 'A path that returns to its starting vertex, following the conventions of the graph model.'],
  ['Connected component', 'A maximal group of vertices where every pair is joined by a path.'],
  ['DAG', 'A directed acyclic graph: a directed graph containing no directed cycle.'],
  ['Tree', 'A connected, undirected, acyclic graph. A tree with V vertices has exactly V − 1 edges.'],
  ['Forest', 'An undirected acyclic graph; every connected component is a tree.'],
  ['Bipartite graph', 'A graph whose vertices can be divided into two sets so every edge crosses between the sets.'],
  ['Weighted graph', 'A graph whose edges carry values such as cost, distance, time, or capacity.'],
  ['Relaxation', 'An update that improves a tentative distance using a newly considered edge or transition.'],
  ['Priority queue', 'A data structure that returns the item with the smallest or largest priority efficiently.'],
  ['Disjoint Set Union', 'A structure that maintains non-overlapping components while sets are merged.'],
  ['Spanning tree', 'A connected, acyclic subgraph containing every vertex of a connected undirected graph.'],
  ['Minimum spanning tree', 'A spanning tree with the smallest possible total edge weight. It is not generally a shortest-path tree.'],
  ['Negative cycle', 'A cycle whose edge weights sum to a negative value; reachable negative cycles make shortest-path costs undefined.'],
  ['Indegree', 'The number of incoming directed edges at a vertex. Kahn’s algorithm uses zero-indegree vertices as ready tasks.'],
  ['Bridge', 'An edge whose removal increases the number of connected components.'],
  ['Strongly connected component', 'A maximal directed subgraph in which every vertex can reach every other vertex.'],
  ['Residual graph', 'The graph of remaining flow capacity, including reverse edges that can undo earlier flow.'],
  ['Matching', 'A set of edges in which no two edges share an endpoint.'],
  ['Eulerian trail', 'A walk that uses every edge exactly once.'],
  ['Hamiltonian path', 'A path that visits every vertex exactly once.']
];

const corePath = [
  { id: 'graph-model', step: '01', title: 'Think in vertices and edges', short: 'Build the model', summary: 'Turn a real problem into a set of entities and relationships.', stage: 'Foundations', symbol: '◇' },
  { id: 'representations', step: '02', title: 'Choose how to store the graph', short: 'Represent it', summary: 'Understand adjacency lists, matrices, and edge lists.', stage: 'Foundations', symbol: '▤' },
  { id: 'bfs', step: '03', title: 'Explore breadth-first', short: 'BFS traversal', summary: 'Use a queue to explore by layers and find minimum edge-count paths.', stage: 'Traversal', symbol: '↗' },
  { id: 'dfs', step: '04', title: 'Explore depth-first', short: 'DFS traversal', summary: 'Follow a branch, backtrack, and reveal graph structure.', stage: 'Traversal', symbol: '⌁' },
  { id: 'dijkstra', step: '05', title: 'Find the cheapest route', short: 'Dijkstra', summary: 'Use a min-priority queue when edge weights are non-negative.', stage: 'Shortest paths', symbol: '◎' },
  { id: 'bellman-ford', step: '06', title: 'Understand negative edges', short: 'Bellman–Ford', summary: 'Relax edges repeatedly and detect reachable negative cycles.', stage: 'Shortest paths', symbol: '↻' },
  { id: 'kruskal', step: '07', title: 'Connect everything cheaply', short: 'Kruskal + DSU', summary: 'Sort edges and use disjoint sets to build a minimum spanning forest.', stage: 'Spanning trees', symbol: '⌘' },
  { id: 'topological', step: '08', title: 'Order dependent tasks', short: 'Topological sort', summary: 'Use indegrees and a ready queue to order a directed acyclic graph.', stage: 'Directed graphs', symbol: '⇢' }
];

const learningStages = [
  { number: '01', title: 'Build the mental model', subtitle: 'Understand the language before the algorithms.', topics: ['graph-model', 'representations'], note: 'Vertices, edges, direction, weights, and storage.' },
  { number: '02', title: 'Learn to explore', subtitle: 'Master the two traversal patterns.', topics: ['bfs', 'dfs'], note: 'Queues, stacks, visited sets, components, and reachability.' },
  { number: '03', title: 'Solve path problems', subtitle: 'Choose the shortest-path tool from the constraints.', topics: ['dijkstra', 'bellman-ford', 'zero-one-bfs', 'floyd-warshall'], note: 'Unweighted distance, non-negative weights, and negative edges.' },
  { number: '04', title: 'Connect and order', subtitle: 'Build efficient networks and respect dependencies.', topics: ['dsu', 'kruskal', 'prim', 'topological'], note: 'Minimum spanning trees, components, and DAG ordering.' },
  { number: '05', title: 'Explore deeper structure', subtitle: 'Move into advanced graph patterns when problems demand them.', topics: ['scc', 'bridges', 'articulation', 'dinic', 'matching', 'lca'], note: 'Connectivity, cuts, flow, matching, and tree queries.' }
];

const graphPresets = {
  traversal: {
    label: 'Unweighted traversal example', directed: false, weighted: false, mode: 'bfs', source: 0,
    nodes: initialNodes,
    edges: initialEdges.map(edge => ({ ...edge, w: 1 }))
  },
  weighted: {
    label: 'Weighted shortest-path example', directed: false, weighted: true, mode: 'dijkstra', source: 0,
    nodes: initialNodes,
    edges: initialEdges
  },
  negative: {
    label: 'Negative-edge example', directed: true, weighted: true, mode: 'bellman', source: 0,
    nodes: [
      { id: 0, label: 'A', x: 90, y: 200 }, { id: 1, label: 'B', x: 255, y: 80 },
      { id: 2, label: 'C', x: 255, y: 315 }, { id: 3, label: 'D', x: 475, y: 80 },
      { id: 4, label: 'E', x: 475, y: 315 }, { id: 5, label: 'F', x: 640, y: 200 }
    ],
    edges: [
      { id: 0, from: 0, to: 1, w: 6 }, { id: 1, from: 0, to: 2, w: 7 },
      { id: 2, from: 1, to: 2, w: 8 }, { id: 3, from: 1, to: 3, w: 5 },
      { id: 4, from: 1, to: 4, w: -4 }, { id: 5, from: 2, to: 3, w: -3 },
      { id: 6, from: 2, to: 4, w: 9 }, { id: 7, from: 3, to: 1, w: -2 },
      { id: 8, from: 4, to: 3, w: 7 }, { id: 9, from: 3, to: 5, w: 4 }
    ]
  },
  negativeCycle: {
    label: 'Reachable negative-cycle example', directed: true, weighted: true, mode: 'bellman', source: 0,
    nodes: [
      { id: 0, label: 'A', x: 90, y: 200 }, { id: 1, label: 'B', x: 300, y: 85 },
      { id: 2, label: 'C', x: 300, y: 315 }, { id: 3, label: 'D', x: 590, y: 200 }
    ],
    edges: [
      { id: 0, from: 0, to: 1, w: 2 }, { id: 1, from: 1, to: 2, w: -4 },
      { id: 2, from: 2, to: 1, w: 1 }, { id: 3, from: 2, to: 3, w: 2 }
    ]
  },
  dag: {
    label: 'Directed acyclic graph example', directed: true, weighted: false, mode: 'topo', source: 0,
    nodes: [
      { id: 0, label: 'A', x: 90, y: 105 }, { id: 1, label: 'B', x: 90, y: 315 },
      { id: 2, label: 'C', x: 285, y: 105 }, { id: 3, label: 'D', x: 285, y: 315 },
      { id: 4, label: 'E', x: 485, y: 210 }, { id: 5, label: 'F', x: 650, y: 210 }
    ],
    edges: [
      { id: 0, from: 0, to: 2, w: 1 }, { id: 1, from: 1, to: 2, w: 1 },
      { id: 2, from: 1, to: 3, w: 1 }, { id: 3, from: 2, to: 4, w: 1 },
      { id: 4, from: 3, to: 4, w: 1 }, { id: 5, from: 4, to: 5, w: 1 }
    ]
  },
  disconnected: {
    label: 'Disconnected minimum-spanning-forest example', directed: false, weighted: true, mode: 'kruskal', source: 0,
    nodes: [
      { id: 0, label: 'A', x: 90, y: 100 }, { id: 1, label: 'B', x: 255, y: 70 },
      { id: 2, label: 'C', x: 180, y: 260 }, { id: 3, label: 'D', x: 455, y: 110 },
      { id: 4, label: 'E', x: 630, y: 90 }, { id: 5, label: 'F', x: 545, y: 300 }
    ],
    edges: [
      { id: 0, from: 0, to: 1, w: 4 }, { id: 1, from: 0, to: 2, w: 2 },
      { id: 2, from: 1, to: 2, w: 1 }, { id: 3, from: 3, to: 4, w: 3 },
      { id: 4, from: 4, to: 5, w: 2 }, { id: 5, from: 3, to: 5, w: 5 }
    ]
  }
};


function App() {
  const [page, setPage] = useState('home');
  const [selectedId, setSelectedId] = useState('graph-model');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('graph-atlas-theme') || 'light'; }
    catch { return 'light'; }
  });
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('graph-atlas-progress') || '[]'); }
    catch { return []; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(true);
  const [mode, setMode] = useState('bfs');
  const [source, setSource] = useState(0);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(850);
  const [connectMode, setConnectMode] = useState(false);
  const [removeEdgeMode, setRemoveEdgeMode] = useState(false);
  const [edgePick, setEdgePick] = useState([]);
  const [edgeWeight, setEdgeWeight] = useState(3);
  const [notice, setNotice] = useState('');
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const searchInputRef = useRef(null);
  const timerRef = useRef(null);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('graph-atlas-progress', JSON.stringify(completed)); }
    catch { /* Progress remains available for this session. */ }
  }, [completed]);
  useEffect(() => {
    try { localStorage.setItem('graph-atlas-theme', theme); }
    catch { /* Theme remains available for this session. */ }
  }, [theme]);
  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(noticeTimerRef.current);
  }, []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        if (document.activeElement === searchInputRef.current && search) setSearch('');
        else {
          setMobileOpen(false);
          if (connectMode) { setConnectMode(false); setEdgePick([]); }
          if (removeEdgeMode) setRemoveEdgeMode(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [search, connectMode, removeEdgeMode]);

  const filteredAlgorithms = useMemo(() => algorithms.filter(item => {
    const query = search.trim().toLowerCase();
    const searchable = [item.name, item.summary, item.tag, item.group, item.idea, item.level, ...(item.how || []), ...(item.applications || [])].join(' ').toLowerCase();
    return (!query || searchable.includes(query)) && (activeGroup === 'all' || item.group === activeGroup);
  }), [search, activeGroup]);
  const selected = algorithms.find(item => item.id === selectedId) || algorithms[0];
  const progress = Math.round((completed.length / algorithms.length) * 100);
  const step = steps[stepIndex] || { visited: [], frontier: [], dist: [], activeEdges: [], chosenEdges: [], current: null, message: 'Choose an algorithm and press Run.' };

  const navigate = (nextPage, groupId) => {
    setPage(nextPage);
    if (nextPage === 'library') {
      if (groupId !== undefined) setActiveGroup(groupId || 'all');
      if (groupId) setSearch('');
    }
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openLesson = (id) => {
    if (!algorithms.some(item => item.id === id)) return;
    setSelectedId(id);
    setPage('lesson');
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openSearchResults = value => {
    setSearch(value);
    setActiveGroup('all');
    setPage('library');
    setMobileOpen(false);
  };
  const toggleComplete = id => setCompleted(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const showNotice = message => {
    setNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 3200);
  };
  const pause = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };
  const clearExecution = () => {
    pause();
    setSteps([]);
    setStepIndex(0);
  };
  const run = () => {
    pause();
    if (!nodes.length) { showNotice('Add at least one vertex before running an algorithm.'); return; }
    const result = makeSteps(nodes, edges, directed, mode, Math.max(0, Math.min(source, nodes.length - 1)));
    setSteps(result);
    setStepIndex(0);
    if (result[0]?.message?.includes('requires') || result[0]?.message?.includes('defined') || result[0]?.message?.includes('applies')) showNotice(result[0].message);
  };
  const play = () => {
    if (!steps.length) { run(); return; }
    pause();
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    timerRef.current = window.setInterval(() => {
      setStepIndex(index => {
        if (index >= steps.length - 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return index;
        }
        return index + 1;
      });
    }, Math.max(140, Number(playSpeed) || 850));
  };
  const resetGraph = () => {
    pause(); setNodes(initialNodes); setEdges(initialEdges); setDirected(false); setWeighted(true);
    setSource(0); setSteps([]); setStepIndex(0); setConnectMode(false); setRemoveEdgeMode(false); setEdgePick([]); setEdgeWeight(3);
  };
  const loadPreset = key => {
    const preset = graphPresets[key];
    if (!preset) return;
    pause();
    setNodes(preset.nodes.map(node => ({ ...node })));
    setEdges(preset.edges.map(edge => ({ ...edge })));
    setDirected(preset.directed);
    setWeighted(preset.weighted);
    setMode(preset.mode);
    setSource(preset.source ?? 0);
    setSteps([]); setStepIndex(0); setConnectMode(false); setRemoveEdgeMode(false); setEdgePick([]);
    showNotice(`${preset.label} loaded. Press Run to start the trace.`);
  };
  const nextNodeLabel = list => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(label => !list.some(node => node.label === label)) || `V${list.length + 1}`;
  const findOpenPosition = list => {
    let best = { x: 360, y: 210, distance: -1 };
    for (let x = 46; x <= 674; x += 28) {
      for (let y = 46; y <= 374; y += 28) {
        const distance = list.length ? Math.min(...list.map(node => Math.hypot(node.x - x, node.y - y))) : 999;
        if (distance > best.distance) best = { x, y, distance };
      }
    }
    return best;
  };
  const addNode = () => {
    setConnectMode(false); setRemoveEdgeMode(false); setEdgePick([]);
    if (nodes.length >= 20) { showNotice('The graph lab supports up to 20 vertices.'); return; }
    const id = nodes.length;
    const position = findOpenPosition(nodes);
    if (position.distance < 52) { showNotice('There is no clear space left. Remove or move vertices before adding another.'); return; }
    setNodes(current => [...current, { id, label: nextNodeLabel(current), x: position.x, y: position.y }]);
    clearExecution();
  };
  const onNodeClick = id => {
    if (removeEdgeMode) return;
    if (connectMode) {
      if (edgePick.includes(id)) { setEdgePick(edgePick.filter(value => value !== id)); return; }
      const next = [...edgePick, id];
      setEdgePick(next);
      if (next.length === 2) {
        const [from, to] = next;
        const duplicate = edges.some(edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from && !directed));
        if (from === to) showNotice('Self-loops are not supported in this visualizer.');
        else if (duplicate) showNotice('That connection already exists.');
        else if (String(edgeWeight).trim() === '' || !Number.isSafeInteger(Number(edgeWeight)) || Math.abs(Number(edgeWeight)) > 1000000) showNotice('Enter a whole-number edge weight between −1,000,000 and 1,000,000.');
        else {
          const weight = Number(edgeWeight);
          setEdges(current => [...current, { id: Math.max(-1, ...current.map(edge => edge.id)) + 1, from, to, w: weight }]);
          clearExecution();
        }
        setEdgePick([]); setConnectMode(false);
      }
    } else {
      setSource(id);
      if (steps.length) clearExecution();
    }
  };
  const onCanvasClick = event => {
    if (!svgRef.current || connectMode || removeEdgeMode) return;
    if (nodes.length >= 20) { showNotice('The graph lab supports up to 20 vertices.'); return; }
    const rect = svgRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 720;
    const y = (event.clientY - rect.top) / rect.height * 420;
    if (x > 24 && x < 696 && y > 24 && y < 396) {
      if (nodes.some(node => Math.hypot(node.x - x, node.y - y) < 52)) { showNotice('Choose a spot at least 52 units away from existing vertices.'); return; }
      const id = nodes.length;
      setNodes(current => [...current, { id, label: nextNodeLabel(current), x, y }]);
      clearExecution();
    }
  };
  const onNodePointerDown = (id, event) => {
    if (connectMode || removeEdgeMode || event.button !== 0) return;
    event.stopPropagation();
    clearExecution();
    dragRef.current = { id, pointerId: event.pointerId };
    try { event.currentTarget.setPointerCapture(event.pointerId); }
    catch { /* Pointer capture is an enhancement, not a requirement. */ }
  };
  const onCanvasPointerMove = event => {
    const drag = dragRef.current;
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(30, Math.min(690, (event.clientX - rect.left) / rect.width * 720));
    const y = Math.max(30, Math.min(390, (event.clientY - rect.top) / rect.height * 420));
    setNodes(current => {
      const moving = current.find(node => node.id === drag.id);
      if (!moving || current.some(node => node.id !== drag.id && Math.hypot(node.x - x, node.y - y) < 52)) return current;
      return current.map(node => node.id === drag.id ? { ...node, x, y } : node);
    });
  };
  const onCanvasPointerUp = event => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };
  const removeSelectedNode = () => {
    const id = source;
    if (nodes.length <= 1) { showNotice('Keep at least one vertex in the graph.'); return; }
    const remap = {};
    let nextId = 0;
    nodes.forEach(node => { if (node.id !== id) remap[node.id] = nextId++; });
    setNodes(nodes.filter(node => node.id !== id).map(node => ({ ...node, id: remap[node.id] })));
    setEdges(edges.filter(edge => edge.from !== id && edge.to !== id).map((edge, index) => ({ ...edge, id: index, from: remap[edge.from], to: remap[edge.to] })));
    setSource(0); clearExecution(); setEdgePick([]); setConnectMode(false); setRemoveEdgeMode(false);
  };
  const onEdgeClick = id => {
    if (!removeEdgeMode) return;
    setEdges(current => current.filter(edge => edge.id !== id));
    setRemoveEdgeMode(false); clearExecution(); showNotice('Connection removed.');
  };

  const lessonToLabMode = id => ({ bfs: 'bfs', dfs: 'dfs', dijkstra: 'dijkstra', 'bellman-ford': 'bellman', prim: 'prim', kruskal: 'kruskal', topological: 'topo' }[id] || 'bfs');
  const openLessonInLab = id => {
    setMode(lessonToLabMode(id));
    navigate('visualizer');
  };

  return <div className={`app ${theme}`}>
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <button className="brand" onClick={() => navigate('home')} aria-label="Graph Atlas home">
        <span className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 27 17 10 31 16 27 31 8 27M17 10l10 21M8 27l23-11"/><circle cx="8" cy="27" r="3"/><circle cx="17" cy="10" r="3"/><circle cx="31" cy="16" r="3"/><circle cx="27" cy="31" r="3"/></svg></span>
        <span className="brand-copy"><strong>graph<span>atlas</span></strong><small>GRAPH THEORY FIELD GUIDE</small></span>
      </button>
      <div className="side-label">LEARN</div>
      <nav className="side-nav" aria-label="Main navigation">
        <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}><span className="nav-icon">⌂</span><span>Overview</span><kbd>01</kbd></button>
        <button className={page === 'roadmap' ? 'active' : ''} onClick={() => navigate('roadmap')}><span className="nav-icon">⌁</span><span>Guided pathway</span><kbd>02</kbd></button>
        <button className={page === 'library' || page === 'lesson' ? 'active' : ''} onClick={() => navigate('library')}><span className="nav-icon">▤</span><span>Topic explorer</span><i>{algorithms.length}</i></button>
        <button className={page === 'visualizer' ? 'active' : ''} onClick={() => navigate('visualizer')}><span className="nav-icon">◎</span><span>Interactive graph lab</span><b className="nav-live">LIVE</b></button>
      </nav>
      <div className="side-label side-label-spaced">REFERENCE DESK</div>
      <nav className="side-nav secondary-nav" aria-label="Reference navigation">
        <button className={page === 'glossary' ? 'active' : ''} onClick={() => navigate('glossary')}><span className="nav-icon">Aa</span><span>Graph glossary</span></button>
        <button className={page === 'resources' ? 'active' : ''} onClick={() => navigate('resources')}><span className="nav-icon">↗</span><span>Further reading</span></button>
      </nav>
      <div className="sidebar-progress">
        <div className="sidebar-progress-top"><span>YOUR PROGRESS</span><b>{progress}%</b></div>
        <div className="sidebar-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <p>{completed.length} of {algorithms.length} topics completed</p>
        <button onClick={() => navigate('roadmap')}>View learning path <span>→</span></button>
      </div>
      <div className="sidebar-bottom">
        <div className="offline-indicator"><span/> LOCAL · NO ACCOUNT REQUIRED</div>
        <div className="version-line">GRAPH ATLAS <span>v1.4 / VISUAL EDITION</span></div>
      </div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileOpen(value => !value)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>☰</button>
        <div className="breadcrumbs"><span>GRAPH ATLAS</span><b>/</b><strong>{page === 'home' ? 'OVERVIEW' : page === 'lesson' ? 'LESSON' : page === 'visualizer' ? 'GRAPH LAB' : page.toUpperCase()}</strong></div>
        <div className="top-actions">
          <label className="global-search"><span className="search-glyph">⌕</span><input ref={searchInputRef} aria-label="Search graph topics" placeholder="Find a concept or algorithm…" value={search} onChange={event => openSearchResults(event.target.value)} /><kbd>Ctrl K</kbd>{search && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}</label>
          <button className="icon-button theme-toggle" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} title="Toggle theme" aria-label="Toggle color theme">{theme === 'dark' ? '☼' : '☾'}</button>
        </div>
      </header>

      {page === 'home' && <Home algorithms={algorithms} completed={completed} progress={progress} onNavigate={navigate} onOpen={openLesson} onSearch={openSearchResults} />}
      {page === 'library' && <Library search={search} setSearch={setSearch} activeGroup={activeGroup} setActiveGroup={setActiveGroup} items={filteredAlgorithms} completed={completed} onOpen={openLesson} />}
      {page === 'lesson' && <Lesson item={selected} completed={completed.includes(selected.id)} onToggle={() => toggleComplete(selected.id)} onBack={() => navigate('library')} onVisualize={() => openLessonInLab(selected.id)} />}
      {page === 'visualizer' && <Visualizer nodes={nodes} edges={edges} directed={directed} setDirected={value => { setDirected(value); clearExecution(); }} weighted={weighted} setWeighted={setWeighted} mode={mode} setMode={value => { setMode(value); clearExecution(); }} source={source} setSource={value => { setSource(value); clearExecution(); }} steps={steps} stepIndex={stepIndex} step={step} run={run} play={play} pause={pause} setStepIndex={setStepIndex} playSpeed={playSpeed} setPlaySpeed={setPlaySpeed} addNode={addNode} resetGraph={resetGraph} loadPreset={loadPreset} connectMode={connectMode} setConnectMode={setConnectMode} removeEdgeMode={removeEdgeMode} setRemoveEdgeMode={setRemoveEdgeMode} edgePick={edgePick} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} onCanvasClick={onCanvasClick} svgRef={svgRef} edgeWeight={edgeWeight} setEdgeWeight={setEdgeWeight} removeSelectedNode={removeSelectedNode} showNotice={showNotice} onOpenLesson={id => openLesson(id)} onNodePointerDown={onNodePointerDown} onCanvasPointerMove={onCanvasPointerMove} onCanvasPointerUp={onCanvasPointerUp} />}
      {page === 'roadmap' && <Roadmap completed={completed} onOpen={openLesson} />}
      {page === 'glossary' && <Glossary />}
      {page === 'resources' && <Resources />}
      <footer className="footer"><span>GRAPH ATLAS</span><span>Model the graph. Trace the logic. Understand the result.</span><span>Built for curious problem solvers.</span></footer>
      {notice && <div className="toast" role="status"><span>✦</span>{notice}</div>}
    </main>
  </div>;
}

function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}

function GraphIllustration() {
  return <div className="hero-visual" aria-label="Animated connected graph illustration">
    <div className="hero-visual-glow glow-a"/><div className="hero-visual-glow glow-b"/>
    <div className="hero-visual-label label-top"><span className="live-dot"/> NETWORK MODEL / 07 NODES</div>
    <svg className="hero-network" viewBox="0 0 560 390" role="img" aria-label="A connected graph with seven vertices and highlighted edges">
      <defs><linearGradient id="networkLine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#61e4d2"/><stop offset="1" stopColor="#7ca5ff"/></linearGradient><radialGradient id="nodeGlow"><stop offset="0" stopColor="#a4fff0"/><stop offset="1" stopColor="#39b9b0"/></radialGradient></defs>
      <g className="network-lines"><path d="M77 178 166 78 286 112 430 72 487 218 365 310 190 292 77 178M166 78 190 292M286 112 365 310M77 178 286 112M190 292 487 218M286 112 487 218"/><path className="network-dash" d="M166 78 365 310M77 178 430 72M190 292 286 112"/></g>
      <g className="network-nodes"><circle className="node-halo" cx="77" cy="178" r="18"/><circle cx="77" cy="178" r="8"/><circle cx="166" cy="78" r="10"/><circle cx="286" cy="112" r="13"/><circle cx="430" cy="72" r="8"/><circle cx="487" cy="218" r="11"/><circle cx="365" cy="310" r="9"/><circle cx="190" cy="292" r="8"/><circle className="node-core" cx="286" cy="112" r="5"/></g>
      <g className="network-node-labels"><text x="47" y="158">A</text><text x="150" y="52">B</text><text x="282" y="83">C</text><text x="445" y="55">D</text><text x="505" y="218">E</text><text x="375" y="340">F</text><text x="164" y="321">G</text></g>
    </svg>
    <div className="floating-data data-a"><b>O(V + E)</b><span>TRAVERSAL COST</span></div>
    <div className="floating-data data-b"><span className="data-spark">✦</span><b>Connected</b><span>7 VERTICES · 9 EDGES</span></div>
    <div className="hero-visual-label label-bottom"><span className="signal-bars"><i/><i/><i/></span> GRAPH STRUCTURE / LIVE VIEW</div>
  </div>;
}

function Home({ algorithms, completed, progress, onNavigate, onOpen, onSearch }) {
  const [topicQuery, setTopicQuery] = useState('');
  const nextItem = corePath.find(item => !completed.includes(item.id)) || corePath[corePath.length - 1];
  const featured = ['bfs', 'dijkstra', 'kruskal', 'topological'].map(id => algorithms.find(item => item.id === id)).filter(Boolean);
  const countDone = corePath.filter(item => completed.includes(item.id)).length;
  return <div className="content-wrap home-wrap">
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="hero-kicker"><span className="pulse-dot"/> A VISUAL FIELD GUIDE TO GRAPH THEORY</div>
        <h1>See the structure<br/>behind <em>every connection.</em></h1>
        <p>Build intuition, watch algorithms make decisions, and learn when to use each technique. One clear path from the basics to confident problem solving.</p>
        <div className="hero-actions">
          <button className="primary-btn hero-primary" onClick={() => onOpen(nextItem.id)}>{completed.length ? 'Continue learning' : 'Start the journey'} <span>↗</span></button>
          <button className="hero-secondary" onClick={() => onNavigate('visualizer')}><span className="play-symbol">▶</span> Enter graph lab</button>
        </div>
        <div className="hero-proof"><span><i/> No account</span><span><i/> Works locally</span><span><i/> C++17 examples</span></div>
      </div>
      <GraphIllustration />
      <div className="hero-watermark">G</div>
    </section>

    <div className="stats-strip">
      <div className="stat-cell"><b>{algorithms.length}</b><span>LESSON TOPICS</span></div>
      <div className="stat-cell"><b>07</b><span>LIVE ALGORITHMS</span></div>
      <div className="stat-cell"><b>05</b><span>LEARNING STAGES</span></div>
      <div className="stat-cell"><b>C++17</b><span>CODE EXAMPLES</span></div>
      <div className="stat-progress"><div className="progress-ring" style={{ '--progress': `${progress}%` }}><span>{progress}%</span></div><div><b>Your progress</b><small>{completed.length} of {algorithms.length} topics explored</small></div></div>
    </div>

    <section className="journey-section">
      <div className="section-heading-row">
        <div><div className="eyebrow"><span className="section-star">✦</span> THE RECOMMENDED ROUTE</div><h2>One path. Strong foundations.</h2><p>Follow the sequence in order. Each idea prepares you for the next, but nothing is locked.</p></div>
        <button className="quiet-link" onClick={() => onNavigate('roadmap')}>View full pathway <span>↗</span></button>
      </div>
      <div className="journey-layout">
        <div className="journey-list">
          {corePath.map((item, index) => {
            const isDone = completed.includes(item.id);
            const isNext = !isDone && nextItem.id === item.id;
            return <button className={`journey-step ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`} key={item.id} onClick={() => onOpen(item.id)}>
              <span className="journey-step-number">{isDone ? '✓' : item.step}</span>
              <span className="journey-step-icon">{item.symbol}</span>
              <span className="journey-step-copy"><small>{item.stage}</small><b>{item.title}</b><span>{item.summary}</span></span>
              <span className="journey-step-state">{isDone ? 'COMPLETE' : isNext ? 'START HERE' : 'EXPLORE'} <i>↗</i></span>
            </button>;
          })}
        </div>
        <aside className="journey-aside">
          <div className="next-card-orbit orbit-a"/><div className="next-card-orbit orbit-b"/>
          <div className="next-card-tag"><span className="pulse-dot"/> YOUR NEXT STEP</div>
          <div className="next-card-number">{nextItem.step}</div>
          <h3>{nextItem.short}</h3>
          <p>{nextItem.summary}</p>
          <div className="next-card-progress"><div><span>CORE PATHWAY</span><b>{countDone}/{corePath.length}</b></div><div className="next-track"><i style={{ width: `${(countDone / corePath.length) * 100}%` }}/></div></div>
          <button onClick={() => onOpen(nextItem.id)}>Continue this step <span>→</span></button>
        </aside>
      </div>
    </section>

    <section className="explore-banner">
      <div className="explore-icon">⌕</div>
      <div className="explore-copy"><div className="eyebrow">LOOKING FOR SOMETHING SPECIFIC?</div><h2>Jump straight to a topic.</h2><p>Search all {algorithms.length} lessons by name, concept, application, or keyword.</p></div>
      <form className="explore-search" role="search" onSubmit={event => { event.preventDefault(); onSearch(topicQuery); }}><span aria-hidden="true">⌕</span><input aria-label="Search all topics" placeholder="Try ‘cycle detection’ or ‘Dijkstra’…" value={topicQuery} onChange={event => setTopicQuery(event.target.value)} /><button type="submit" aria-label="Search topics">→</button></form>
      <button className="explore-all" onClick={() => onNavigate('library')}>Browse all topics <span>↗</span></button>
    </section>

    <section className="featured-section">
      <div className="section-heading-row"><div><div className="eyebrow">LEARN BY WATCHING</div><h2>Algorithms you can bring to life.</h2><p>Seven algorithms in the graph lab expose their internal decisions, one step at a time.</p></div><button className="quiet-link" onClick={() => onNavigate('visualizer')}>Open the lab <span>↗</span></button></div>
      <div className="featured-grid">{featured.map((item, index) => <button className={`featured-card feature-${index + 1}`} key={item.id} onClick={() => onOpen(item.id)}>
        <div className="featured-card-top"><span className="feature-index">0{index + 1}</span><span className="feature-level">{item.level}</span></div>
        <div className="featured-visual"><MiniGraph variant={index}/></div>
        <h3>{item.name}</h3><p>{item.summary}</p>
        <div className="feature-bottom"><span>{item.complexity}</span><b>Explore lesson ↗</b></div>
      </button>)}</div>
    </section>

    <section className="lab-spotlight">
      <div className="spotlight-copy"><div className="eyebrow"><span className="pulse-dot"/> EXPERIMENT, DON'T JUST READ</div><h2>Make a graph.<br/><em>Watch it think.</em></h2><p>Add vertices, draw edges, change weights, then step through BFS, DFS, shortest paths, spanning trees, and topological sorting. Inspect the queue, stack, priority queue, distances, and every important decision.</p><button className="primary-btn" onClick={() => onNavigate('visualizer')}>Launch interactive lab <span>↗</span></button></div>
      <div className="spotlight-art"><MiniGraph variant={4}/><div className="spotlight-chip chip-left">QUEUE <b>A · B · C</b></div><div className="spotlight-chip chip-right">VISITED <b>04 / 07</b></div><div className="spotlight-grid"/></div>
    </section>
  </div>;
}

function MiniGraph({ variant = 0 }) {
  const points = [[32, 45], [104, 16], [158, 64], [88, 108], [190, 118], [234, 45]];
  const links = [[0,1],[1,2],[0,3],[3,2],[2,4],[2,5],[4,5],[1,3]];
  return <svg viewBox="0 0 260 140" aria-hidden="true" className={`mini-graph mini-graph-${variant}`}>
    <g>{links.map(([a,b], index) => <line key={index} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} className={index === variant + 1 ? 'mini-edge active' : 'mini-edge'}/>)}</g>
    <g>{points.map(([x,y], index) => <g key={index} className={`mini-node n-${index}`}><circle cx={x} cy={y} r={index === variant ? 8 : 5.5}/><circle cx={x} cy={y} r={index === variant ? 14 : 9} className="mini-node-halo"/></g>)}</g>
  </svg>;
}

function Library({ search, setSearch, activeGroup, setActiveGroup, items, completed, onOpen }) {
  return <div className="content-wrap library-wrap">
    <PageHeading eyebrow="THE TOPIC EXPLORER" title="Find the right graph idea." description="Search the complete topic collection. Lessons connect intuition, a reliable procedure, complexity, practical use, common pitfalls, and C++17 examples."><span className="heading-count">{items.length} / {algorithms.length} TOPICS</span></PageHeading>
    <div className="library-discovery"><div className="library-search"><span>⌕</span><input aria-label="Search graph lessons" placeholder="Search by algorithm, concept, or application…" value={search} onChange={event => setSearch(event.target.value)}/>{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}</div><div className="library-hint"><kbd>CTRL K</kbd> TO SEARCH FROM ANYWHERE</div></div>
    <div className="category-filter" aria-label="Filter by category"><button className={activeGroup === 'all' ? 'selected' : ''} onClick={() => setActiveGroup('all')}>All topics <span>{algorithms.length}</span></button>{algorithmGroups.map(group => <button className={activeGroup === group.id ? 'selected' : ''} key={group.id} onClick={() => setActiveGroup(group.id)}>{group.title}<span>{algorithms.filter(item => item.group === group.id).length}</span></button>)}</div>
    {algorithmGroups.filter(group => activeGroup === 'all' || group.id === activeGroup).map(group => {
      const groupItems = items.filter(item => item.group === group.id);
      if (!groupItems.length) return null;
      return <section className="library-section" key={group.id}>
        <div className="library-group-heading"><div><span className="eyebrow">{group.title.toUpperCase()}</span><p>{group.desc}</p></div><span className="group-count">{String(groupItems.length).padStart(2, '0')} TOPICS</span></div>
        <div className="algorithm-grid">{groupItems.map((item, index) => <button className={`algorithm-card card-tone-${index % 4}`} key={item.id} onClick={() => onOpen(item.id)}>
          <div className="algorithm-card-top"><span className="algorithm-symbol">{String(index + 1).padStart(2, '0')}</span><span className="level-pill">{item.level}</span></div>
          <h3>{item.name}</h3><p>{item.summary}</p>
          <div className="algorithm-card-bottom"><span>{item.complexity}</span><b className={completed.includes(item.id) ? 'is-complete' : ''}>{completed.includes(item.id) ? '✓ COMPLETE' : 'OPEN LESSON ↗'}</b></div>
        </button>)}</div>
      </section>;
    })}
    {!items.length && <div className="empty-state"><span>⌕</span><h3>No matching topics</h3><p>Try a broader keyword or remove the category filter.</p><button className="subtle-btn" onClick={() => { setSearch(''); setActiveGroup('all'); }}>Clear filters</button></div>}
  </div>;
}

function Lesson({ item, completed, onToggle, onBack, onVisualize }) {
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const group = algorithmGroups.find(value => value.id === item.group);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.code || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return <div className="content-wrap lesson-wrap">
    <button className="back-link" onClick={onBack}>← ALL TOPICS</button>
    <section className="lesson-hero">
      <div className="lesson-hero-copy"><div className="eyebrow">{group?.title.toUpperCase()} <span>/</span> {item.tag.toUpperCase()}</div><h1>{item.name}</h1><p>{item.summary}</p><div className="lesson-meta"><span className="level-pill">{item.level}</span><span className="complexity-pill">◷ {item.complexity}</span></div></div>
      <div className="lesson-hero-visual"><div className="lesson-orbit orbit-one"/><div className="lesson-orbit orbit-two"/><MiniGraph variant={2}/><span>GRAPH THEORY / LESSON</span></div>
    </section>
    <div className="lesson-action-row"><div className="lesson-tabs" role="tablist" aria-label="Lesson sections"><button role="tab" aria-selected={tab === 'overview'} className={tab === 'overview' ? 'selected' : ''} onClick={() => setTab('overview')}>01 <span>Understand</span></button><button role="tab" aria-selected={tab === 'code'} className={tab === 'code' ? 'selected' : ''} onClick={() => setTab('code')}>02 <span>Implement</span></button><button role="tab" aria-selected={tab === 'practice'} className={tab === 'practice' ? 'selected' : ''} onClick={() => setTab('practice')}>03 <span>Apply & avoid errors</span></button></div><div className="lesson-header-actions"><button className="outline-btn" onClick={onVisualize}>◎ Try in graph lab</button><button className={completed ? 'complete-btn done' : 'complete-btn'} onClick={onToggle}>{completed ? '✓ Completed' : '＋ Mark complete'}</button></div></div>
    {tab === 'overview' && <div className="lesson-layout"><div className="lesson-main">
      <section className="lesson-section"><div className="section-kicker"><span>01</span> THE CORE IDEA</div><h2>What is happening?</h2><p>{item.idea}</p></section>
      <section className="lesson-section"><div className="section-kicker"><span>02</span> ALGORITHM WALKTHROUGH</div><h2>Follow the logic.</h2><ol className="walkthrough-list">{item.how.map((line, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><p>{line}</p></li>)}</ol></section>
      <section className="lesson-section"><div className="section-kicker"><span>03</span> BUILD THE INTUITION</div><h2>Think of it in the real world.</h2><div className="real-example"><div className="example-icon">↗</div><div><span>REAL-LIFE MODEL</span><p>{item.example}</p></div></div></section>
      <section className="lesson-section"><div className="section-kicker"><span>04</span> WHERE IT APPEARS</div><h2>Applications.</h2><div className="application-grid">{item.applications.map(value => <div key={value}><span>↗</span>{value}</div>)}</div></section>
    </div><LessonAside item={item} group={group} onVisualize={onVisualize}/></div>}
    {tab === 'code' && <div className="code-page"><div className="code-intro"><div><div className="eyebrow">IMPLEMENTATION REFERENCE</div><h2>C++17 template</h2><p>Use this as a starting point, then adapt input parsing, indexing, limits, and return values to the exact problem statement.</p></div><button className="copy-btn" onClick={copy}>{copied ? '✓ Copied' : '▣ Copy code'}</button></div><div className="code-window"><div className="code-window-top"><span><i/> C++ / GRAPH ALGORITHM</span><span>STANDARD C++17</span></div><pre><code>{item.code || '// Implementation outline coming soon.'}</code></pre></div><div className="code-tip"><b>Before you submit</b><span>Check indexing, integer overflow, graph direction, disconnected components, and whether the constraints fit the complexity.</span></div></div>}
    {tab === 'practice' && <div className="lesson-layout"><div className="lesson-main"><section className="lesson-section"><div className="section-kicker"><span>01</span> RECOGNIZE THE PATTERN</div><h2>When should you reach for it?</h2><p>{item.example}</p><div className="application-grid">{item.applications.map(value => <div key={value}><span>✳</span>{value}</div>)}</div></section><section className="lesson-section"><div className="section-kicker"><span>02</span> COMMON PITFALLS</div><h2>Protect your solution from mistakes.</h2><ul className="pitfall-list">{item.pitfalls.map(value => <li key={value}>{value}</li>)}</ul></section><section className="lesson-section"><div className="section-kicker"><span>03</span> COMPLEXITY</div><h2>Read the bound in context.</h2><p><strong>{item.complexity}.</strong> Practical performance also depends on the graph representation, chosen data structures, and input limits. Estimate both time and memory before implementation.</p></section></div><aside className="lesson-aside"><div className="quick-facts"><div className="eyebrow">PROBLEM CHECKLIST</div><p>Before coding, ask:</p><ul className="check-list"><li>Is the graph directed?</li><li>Are edge weights present?</li><li>Can a weight be negative?</li><li>Can the graph be disconnected?</li><li>Do I need one source or all pairs?</li></ul></div><div className="aside-note"><div className="eyebrow">SOURCE NOTE</div><p>{item.source || 'This lesson is an original educational synthesis. See Further Reading for deeper proofs and alternate implementations.'}</p></div></aside></div>}
    <div className="lesson-footer-nav"><button className="text-btn" onClick={onBack}>← Back to topic explorer</button><button className="primary-btn" onClick={onVisualize}>Open visual trace <span>↗</span></button></div>
  </div>;
}

function LessonAside({ item, group, onVisualize }) {
  const model = item.id === 'dijkstra' ? 'Always expand the currently cheapest unsettled vertex. Non-negative weights make that distance final.' : item.id === 'bfs' ? 'The queue preserves layer order: every vertex at distance d is processed before distance d + 1.' : item.id === 'dfs' ? 'The call stack is the current path. Finishing a call is just as important as entering one.' : item.id === 'kruskal' ? 'An edge is safe only when it joins two different components. DSU makes that check efficient.' : 'State the invariant: what does the algorithm guarantee after each step?';
  return <aside className="lesson-aside"><div className="quick-facts"><div className="eyebrow">AT A GLANCE</div><div className="fact-row"><span>Difficulty</span><b>{item.level}</b></div><div className="fact-row"><span>Category</span><b>{group?.title}</b></div><div className="fact-row"><span>Complexity</span><b>{item.complexity}</b></div><div className="fact-row"><span>Code standard</span><b>C++17</b></div></div><div className="aside-note"><div className="eyebrow">THE MENTAL MODEL</div><p>{model}</p></div><button className="aside-visual-btn" onClick={onVisualize}>See it in the graph lab <span>↗</span></button></aside>;
}

function buildDisplayedPath(parent, start, target, nodeCount) {
  if (start === target) return [start];
  const path = [];
  const seen = new Set();
  let current = target;
  while (current !== null && current !== undefined && current !== start && !seen.has(current) && path.length <= nodeCount) {
    seen.add(current);
    path.push(current);
    current = parent?.[current];
  }
  if (current !== start) return [];
  path.push(start);
  return path.reverse();
}

function Visualizer(props) {
  const {
    nodes, edges, directed, setDirected, weighted, setWeighted, mode, setMode,
    source, setSource, steps, stepIndex, step, run, play, pause, setStepIndex,
    playSpeed, setPlaySpeed, addNode, resetGraph, loadPreset, connectMode, setConnectMode,
    removeEdgeMode, setRemoveEdgeMode, edgePick, onNodeClick, onEdgeClick,
    onCanvasClick, svgRef, edgeWeight, setEdgeWeight, removeSelectedNode, showNotice,
    onOpenLesson, onNodePointerDown, onCanvasPointerMove, onCanvasPointerUp
  } = props;
  const [target, setTarget] = useState(nodes.at(-1)?.id ?? 0);
  useEffect(() => { setTarget(nodes.at(-1)?.id ?? 0); }, [nodes.length]);
  const safeTarget = nodes.some(node => node.id === target) ? target : (nodes[0]?.id ?? 0);

  const modes = [
    { group: 'Traversal', items: [['bfs', 'Breadth-first search'], ['dfs', 'Depth-first search']] },
    { group: 'Shortest paths', items: [['dijkstra', 'Dijkstra'], ['bellman', 'Bellman–Ford']] },
    { group: 'Spanning trees', items: [['prim', 'Prim'], ['kruskal', 'Kruskal']] },
    { group: 'Ordering', items: [['topo', 'Topological sort (Kahn)']] }
  ];
  const descriptions = {
    bfs: { title: 'Explore by layers', description: 'A FIFO queue explores all vertices one edge farther away before moving to the next layer.', detail: 'Finds minimum edge-count paths; edge weights are ignored.', complexity: 'O(V + E)', structure: 'Queue', rule: 'First in, first out' },
    dfs: { title: 'Explore deeply, then backtrack', description: 'A LIFO stack follows one branch as far as possible before returning to an earlier choice.', detail: 'Useful for reachability, components, cycle detection, and graph structure.', complexity: 'O(V + E)', structure: 'Stack', rule: 'Last in, first out' },
    dijkstra: { title: 'Find minimum path costs', description: 'A min-priority queue always extracts the unsettled vertex with the smallest tentative distance.', detail: 'All edge weights must be non-negative. Works on directed and undirected graphs.', complexity: 'O((V + E) log V)', structure: 'Min-priority queue', rule: 'Smallest tentative distance first' },
    bellman: { title: 'Handle negative edge weights', description: 'Repeated edge relaxation improves distances; a final extra scan checks for a reachable negative cycle.', detail: 'Supports directed and undirected graphs. An undirected negative edge creates a negative cycle.', complexity: 'O(VE)', structure: 'Edge relaxation passes', rule: 'Inspect every arc on each pass' },
    prim: { title: 'Grow a minimum spanning forest', description: 'A min-heap selects the cheapest edge that expands the current tree.', detail: 'Requires an undirected graph. Disconnected input produces a minimum spanning forest.', complexity: 'O(E log E) here', structure: 'Min-priority edge heap', rule: 'Cheapest edge leaving the tree' },
    kruskal: { title: 'Build a minimum spanning forest', description: 'Process edges from lowest to highest weight; Disjoint Set Union checks whether an edge would make a cycle.', detail: 'Requires an undirected graph. Disconnected input produces a minimum spanning forest.', complexity: 'O(E log E)', structure: 'Sorted edge list + DSU', rule: 'Accept only edges joining different sets' },
    topo: { title: 'Order prerequisite dependencies', description: 'Kahn’s algorithm repeatedly removes a zero-indegree vertex from a FIFO ready queue.', detail: 'Requires a directed acyclic graph. A cycle prevents a complete ordering.', complexity: 'O(V + E)', structure: 'Ready queue', rule: 'Only zero-indegree vertices are eligible' }
  };
  const info = descriptions[mode] || descriptions.bfs;
  const lessonIdByMode = { bfs: 'bfs', dfs: 'dfs', dijkstra: 'dijkstra', bellman: 'bellman-ford', prim: 'prim', kruskal: 'kruskal', topo: 'topological' };
  const needsSource = ['bfs', 'dfs', 'dijkstra', 'bellman', 'prim'].includes(mode);
  const distanceMode = ['bfs', 'dijkstra', 'bellman'].includes(mode);
  const orderMode = ['bfs', 'dfs', 'topo'].includes(mode);
  const mstMode = ['prim', 'kruskal'].includes(mode);
  const hasNegativeEdge = edges.some(edge => edge.w < 0);
  const validationMessage = mode === 'dijkstra' && hasNegativeEdge
    ? 'Dijkstra cannot run with negative edge weights. Choose Bellman–Ford or edit the negative edges.'
    : mstMode && directed
      ? 'Prim and Kruskal require an undirected graph. Turn off Directed.'
      : mode === 'topo' && !directed
        ? 'Topological sorting requires a directed graph. Turn on Directed.'
        : '';
  const totalChosenWeight = edges.filter(edge => step.chosenEdges.includes(edge.id)).reduce((sum, edge) => sum + edge.w, 0);
  const coord = id => nodes.find(node => node.id === id);
  const label = id => coord(id)?.label ?? '—';
  const isVisited = id => step.visited.includes(id);
  const path = steps.length && distanceMode && !step.negativeCycle
    ? buildDisplayedPath(step.parent, source, safeTarget, nodes.length)
    : [];
  const showTrace = steps.length > 0;
  const queueValues = mode === 'bfs' ? step.queue : mode === 'dfs' ? step.stack : mode === 'topo' ? step.queue : [];
  const operation = step.operation;
  const shortNumber = value => value === null || value === undefined ? '∞' : String(value);

  const renderVertexTokens = (items, type = '') => items?.length
    ? <div className="trace-tokens">{items.map((id, index) => <span className={`trace-token ${type} ${index === items.length - 1 && type === 'stack' ? 'token-top' : ''}`} key={`${id}-${index}`}>{label(id)}{type === 'stack' && index === items.length - 1 ? <small>TOP</small> : null}</span>)}</div>
    : <span className="trace-empty">Empty</span>;

  return <div className="content-wrap visualizer-wrap">
    <PageHeading
      eyebrow="INTERACTIVE GRAPH LAB"
      title="Explore graph algorithms."
      description="Build a graph, choose an algorithm, and inspect the exact data structures and decisions behind every step."
    >
      <span className="lab-status"><i/> RUNS LOCALLY</span>
    </PageHeading>

    <section className="lab-toolbar" aria-label="Graph editing tools">
      <div className="tool-group">
        <span className="toolbar-label">EDIT GRAPH</span>
        <button onClick={addNode}>＋ Add vertex</button>
        <button className={connectMode ? 'tool-active' : ''} onClick={() => { setConnectMode(value => !value); setRemoveEdgeMode(false); }}>
          {connectMode ? '× Cancel connection' : '＋ Connect vertices'}
        </button>
        <button className={removeEdgeMode ? 'tool-active' : ''} onClick={() => { setRemoveEdgeMode(value => !value); setConnectMode(false); }}>
          {removeEdgeMode ? '× Cancel removal' : '− Remove edge'}
        </button>
        <button onClick={removeSelectedNode} disabled={nodes.length <= 1}>− Remove focused vertex</button>
        <button onClick={resetGraph}>↺ Restore sample</button>
      </div>
      <div className="tool-group graph-options">
        <label className="switch-label"><input type="checkbox" checked={directed} onChange={event => {
          const nextDirected = event.target.checked;
          if (!nextDirected) {
            const seen = new Set();
            const hasReciprocal = edges.some(edge => {
              const key = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)].join(':');
              if (seen.has(key)) return true;
              seen.add(key);
              return false;
            });
            if (hasReciprocal) { showNotice('This directed graph has reciprocal edges. Remove one direction of each pair before switching to undirected.'); return; }
          }
          setDirected(nextDirected);
        }}/> Directed</label>
        <label className="switch-label"><input type="checkbox" checked={weighted} onChange={event => setWeighted(event.target.checked)}/> Show weights</label>
        <label className="edge-weight-control" htmlFor="edge-weight">New edge weight
          <input id="edge-weight" type="number" min="-1000000" max="1000000" step="1" value={edgeWeight} onChange={event => setEdgeWeight(event.target.value)} />
        </label>
      </div>
      <div className="preset-row">
        <label htmlFor="graph-preset">LOAD EXAMPLE</label>
        <select id="graph-preset" value="" onChange={event => { if (event.target.value) loadPreset(event.target.value); }}>
          <option value="">Choose a prepared graph…</option>
          <option value="traversal">Unweighted traversal</option>
          <option value="weighted">Weighted shortest paths</option>
          <option value="negative">Negative edges (Bellman–Ford)</option>
          <option value="negativeCycle">Reachable negative cycle</option>
          <option value="dag">Directed acyclic graph</option>
          <option value="disconnected">Disconnected components (MST)</option>
        </select>
        <span>Prepared examples reset the graph and select a suitable algorithm.</span>
      </div>
    </section>

    <div className="lab-grid">
      <section className="graph-workspace" aria-label="Editable graph canvas">
        <div className="workspace-head">
          <div>
            <b>GRAPH CANVAS</b>
            <span>{nodes.length} vertices · {edges.length} edges · {directed ? 'directed' : 'undirected'}{hasNegativeEdge ? ' · negative weights' : ''}</span>
          </div>
          <div className={`canvas-hint ${connectMode || removeEdgeMode ? 'is-active' : ''}`}>
            {connectMode ? (edgePick.length ? `Choose a destination from ${coord(edgePick[0])?.label || 'selected'}` : 'Choose two vertices to connect (first → second)') : removeEdgeMode ? 'Choose an edge to remove' : 'Drag vertices · Click empty space to add · Click a vertex to focus'}
          </div>
        </div>
        <svg ref={svgRef} className="graph-canvas" viewBox="0 0 720 420" onClick={onCanvasClick} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerCancel={onCanvasPointerUp} role="group" aria-label="Interactive graph. Click empty space to add a vertex or select vertices to edit connections.">
          <defs>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="var(--edge)"/>
            </marker>
          </defs>
          <g className="canvas-grid">
            {Array.from({length: 15}, (_, i) => <line key={`v${i}`} x1={i * 50 + 10} y1="0" x2={i * 50 + 10} y2="420"/>)}
            {Array.from({length: 9}, (_, i) => <line key={`h${i}`} x1="0" y1={i * 50 + 10} x2="720" y2={i * 50 + 10}/>)}
          </g>
          {edges.map(edge => {
            const a = coord(edge.from), b = coord(edge.to);
            if (!a || !b) return null;
            const dx = b.x - a.x, dy = b.y - a.y;
            const length = Math.max(1, Math.hypot(dx, dy));
            const nx = dx / length, ny = dy / length;
            const x1 = a.x + nx * 22, y1 = a.y + ny * 22;
            const x2 = b.x - nx * 25, y2 = b.y - ny * 25;
            const reverseArc = directed && edges.some(other => other.id !== edge.id && other.from === edge.to && other.to === edge.from);
            const middleX = (a.x + b.x) / 2, middleY = (a.y + b.y) / 2;
            const perpendicularX = -ny, perpendicularY = nx;
            const controlX = middleX + perpendicularX * 30;
            const controlY = middleY + perpendicularY * 30;
            const weightOffset = reverseArc ? 13 : 0;
            const weightX = middleX + perpendicularX * weightOffset;
            const weightY = middleY + perpendicularY * weightOffset;
            const chosen = step.chosenEdges.includes(edge.id);
            const rejected = step.rejectedEdges?.includes(edge.id);
            const parentEdge = distanceMode && step.parentEdge?.includes(edge.id);
            const active = step.activeEdges.includes(edge.id);
            return <g key={edge.id} className={`graph-edge ${chosen ? 'chosen' : ''} ${rejected ? 'rejected-edge' : ''} ${parentEdge ? 'parent-edge' : ''} ${active ? 'active' : ''} ${removeEdgeMode ? 'removable' : ''}`} onClick={event => { event.stopPropagation(); onEdgeClick(edge.id); }}>
              {reverseArc
                ? <path d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`} markerEnd={directed ? 'url(#arrowHead)' : undefined}/>
                : <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={directed ? 'url(#arrowHead)' : undefined}/>}
              {weighted && <g className="edge-weight-label">
                <rect x={weightX - 14} y={weightY - 11} width="28" height="22" rx="7"/>
                <text x={weightX} y={weightY + 4} textAnchor="middle">{edge.w}</text>
              </g>}
            </g>;
          })}
          {nodes.map(node => {
            const visited = isVisited(node.id);
            const current = step.current === node.id;
            const picked = edgePick.includes(node.id);
            return <g
              key={node.id}
              className={`graph-node ${visited ? 'visited' : ''} ${current ? 'current' : ''} ${picked ? 'selected' : ''} ${source === node.id ? 'source' : ''}`}
              transform={`translate(${node.x},${node.y})`}
              role="button"
              tabIndex="0"
              aria-label={`Vertex ${node.label}${source === node.id ? ', focused vertex' : ''}`}
              onPointerDown={event => onNodePointerDown(node.id, event)}
              onClick={event => { event.stopPropagation(); onNodeClick(node.id); }}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onNodeClick(node.id); } }}
            >
              <circle r="23"/>
              <text y="5" textAnchor="middle">{node.label}</text>
              {distanceMode && showTrace && step.dist[node.id] !== undefined && step.dist[node.id] !== null && <text className="node-distance" y="40" textAnchor="middle">{step.dist[node.id]}</text>}
            </g>;
          })}
        </svg>
        <div className="canvas-legend">
          <span><i className="legend-node"/> Unvisited</span>
          <span><i className="legend-node visited"/> Visited / settled</span>
          <span><i className="legend-node current"/> Current vertex</span>
          <span><i className="legend-line chosen"/> Selected tree edge</span>
          {distanceMode && <span><i className="legend-line parent"/> Current parent edge</span>}
          {mode === 'kruskal' && <span><i className="legend-line rejected"/> Rejected cycle edge</span>}
          <span className="legend-note">Orange marks the edge currently being examined.</span>
        </div>
      </section>

      <aside className="lab-side">
        <section className="lab-panel algorithm-panel">
          <div className="panel-heading"><span className="panel-step">01</span><div><h2>Choose an algorithm</h2><p>Pick the graph question you want to answer.</p></div></div>
          <label className="field-label" htmlFor="algorithm-select">Algorithm</label>
          <select id="algorithm-select" className="lab-select" value={mode} onChange={event => setMode(event.target.value)}>
            {modes.map(group => <optgroup label={group.group} key={group.group}>
              {group.items.map(([value, text]) => <option value={value} key={value}>{text}</option>)}
            </optgroup>)}
          </select>
          <div className="algorithm-explainer">
            <b>{info.title}</b>
            <p>{info.description}</p>
            <div className="algorithm-meta"><span>{info.complexity}</span><span>{info.detail}</span></div>
          </div>
          {needsSource && <>
            <label className="field-label" htmlFor="source-select">{mode === 'prim' ? 'Starting tree root' : 'Start vertex'}</label>
            <select id="source-select" className="lab-select" value={source} onChange={event => setSource(Number(event.target.value))}>
              {nodes.map(node => <option value={node.id} key={node.id}>{node.label}</option>)}
            </select>
          </>}
          {validationMessage && <div className="lab-warning" role="status"><b>Graph setting required</b><span>{validationMessage}</span></div>}
          <button className="primary-btn run-btn" onClick={run} disabled={Boolean(validationMessage)}>▶ Run algorithm</button>
          <button className="lab-lesson-link" onClick={() => onOpenLesson(lessonIdByMode[mode])}>Open full lesson & C++ code <span>↗</span></button>
        </section>

        <section className="lab-panel step-panel">
          <div className="panel-heading"><span className="panel-step">02</span><div><h2>Execution controls</h2><p>Play automatically or inspect one operation at a time.</p></div></div>
          <div className="step-counter"><b>{showTrace ? stepIndex + 1 : 0}</b><span>of {steps.length || '—'} steps</span><small>{showTrace && stepIndex === steps.length - 1 ? 'COMPLETE' : ''}</small></div>
          <div className="step-progress-track"><span style={{ width: `${showTrace ? ((stepIndex + 1) / steps.length) * 100 : 0}%` }}/></div>
          <p className="step-message" aria-live="polite">{showTrace ? step.message : 'Choose an algorithm and press Run. Every step shows a meaningful change to the graph or an internal data structure.'}</p>
          <div className="step-controls">
            <button aria-label="Go to first step" title="First step" onClick={() => { pause(); setStepIndex(0); }} disabled={!showTrace || stepIndex === 0}>|◀</button>
            <button aria-label="Previous step" title="Previous step" onClick={() => { pause(); setStepIndex(index => Math.max(0, index - 1)); }} disabled={!showTrace || stepIndex === 0}>←</button>
            <button className="play-btn" aria-label="Play or replay" title="Play or replay" onClick={play} disabled={Boolean(validationMessage) || !showTrace}>{showTrace && stepIndex === steps.length - 1 ? '↻' : '▶'}</button>
            <button aria-label="Next step" title="Next step" onClick={() => { pause(); setStepIndex(index => Math.min(steps.length - 1, index + 1)); }} disabled={!showTrace || stepIndex >= steps.length - 1}>→</button>
            <button aria-label="Pause playback" title="Pause" onClick={pause}>Ⅱ</button>
          </div>
          <div className="playback-speed"><label htmlFor="play-speed">Playback speed</label><select id="play-speed" value={playSpeed} onChange={event => { pause(); setPlaySpeed(Number(event.target.value)); }}><option value="1400">0.6×</option><option value="850">1×</option><option value="450">1.8×</option><option value="220">3.9×</option></select></div>
          <input className="step-slider" aria-label="Execution step" type="range" min="0" max={Math.max(steps.length - 1, 0)} value={Math.min(stepIndex, Math.max(steps.length - 1, 0))} disabled={!showTrace} onChange={event => { pause(); setStepIndex(Number(event.target.value)); }}/>
        </section>

        <section className="lab-panel trace-panel">
          <div className="panel-heading"><span className="panel-step">03</span><div><h2>Live data structures</h2><p>Inspect the data structure that drives this algorithm.</p></div></div>
          {showTrace && step.current !== null && step.current !== undefined && <div className="current-vertex-strip"><span>CURRENT VERTEX</span><b>{label(step.current)}</b></div>}
          <div className="structure-card">
            <div className="trace-section-head"><b>{info.structure}</b><span>{info.rule}</span></div>
            {['bfs', 'dfs', 'topo'].includes(mode) && <>
              <div className="structure-direction">{mode === 'bfs' ? 'FRONT → BACK' : mode === 'dfs' ? 'BOTTOM → TOP' : 'NEXT ELIGIBLE'}</div>
              {renderVertexTokens(queueValues, mode === 'dfs' ? 'stack' : 'queue')}
            </>}
            {['dijkstra', 'prim'].includes(mode) && <>
              <div className="structure-direction">{mode === 'dijkstra' ? 'VERTEX · TENTATIVE DISTANCE' : 'EDGE · WEIGHT'}</div>
              {step.priorityQueue?.length ? <div className="priority-list">{step.priorityQueue.map((item, index) => <div className="priority-item" key={`${item.id ?? item.vertex}-${index}`}><span>{item.kind === 'edge' ? `${label(item.from)} → ${label(item.vertex)}` : label(item.vertex)}</span><b>{item.priority}</b></div>)}</div> : <span className="trace-empty">Priority queue is empty</span>}
            </>}
            {mode === 'kruskal' && <>
              <div className="structure-direction">LOWEST WEIGHT FIRST · PENDING EDGES</div>
              {step.edgeQueue?.length ? <div className="priority-list">{step.edgeQueue.slice(0, 7).map(item => <div className="priority-item" key={item.id}><span>{label(item.from)} — {label(item.to)}</span><b>{item.weight}</b></div>)}{step.edgeQueue.length > 7 && <small className="trace-more">+ {step.edgeQueue.length - 7} more edges</small>}</div> : <span className="trace-empty">No pending edges</span>}
            </>}
            {mode === 'bellman' && <>
              <div className="structure-direction">REPEATED EDGE RELAXATION {step.pass ? `· PASS ${step.pass}` : ''}</div>
              <div className="relax-focus">{operation?.type === 'relax' ? <><span>{label(operation.from)} → {label(operation.to)}</span><b className={operation.accepted ? 'accepted' : 'rejected'}>{operation.accepted ? 'IMPROVED' : 'NO CHANGE'}</b></> : <span>{showTrace ? operation?.type?.replaceAll('-', ' ') : 'Waiting to run'}</span>}</div>
            </>}
          </div>

          {mode !== 'kruskal' && <div className="trace-subsection">
            <div className="trace-section-head"><b>{mode === 'bellman' ? 'Reachable / discovered set' : mode === 'topo' ? 'Processed set' : mode === 'bfs' ? 'Processed / dequeued set' : mode === 'dfs' ? 'Discovered / visited set' : mode === 'prim' ? 'Included in forest' : 'Settled set'}</b><span>{(mode === 'bellman' ? step.discovered : step.visited)?.length || 0} / {nodes.length}</span></div>
            {renderVertexTokens(mode === 'bellman' ? step.discovered : step.visited, 'visited-token')}
          </div>}

          {distanceMode && <div className="trace-subsection">
            <div className="trace-section-head"><b>{mode === 'bfs' ? 'Hop distance & parent' : 'Tentative cost & parent'}</b><span>START: {label(source)}</span></div>
            <div className="trace-table">
              <div className="trace-table-row trace-table-header"><span>VERTEX</span><span>DISTANCE</span><span>PARENT</span></div>
              {nodes.map(node => <div className="trace-table-row" key={node.id}><b>{node.label}</b><span>{showTrace ? shortNumber(step.dist[node.id]) : '—'}</span><span>{showTrace ? label(step.parent[node.id]) : '—'}</span></div>)}
            </div>
            <div className="path-builder">
              <label htmlFor="target-select">Reconstruct path to</label>
              <select id="target-select" value={safeTarget} onChange={event => setTarget(Number(event.target.value))}>{nodes.map(node => <option value={node.id} key={node.id}>{node.label}</option>)}</select>
              <div className="path-result">{!showTrace ? 'Run the algorithm to calculate a path.' : step.negativeCycle ? 'A reachable negative cycle was detected; path costs may be undefined.' : path.length ? path.map(id => label(id)).join(' → ') : 'No path from the selected start to this vertex.'}</div>
            </div>
          </div>}

          {['dijkstra', 'bellman'].includes(mode) && <div className="trace-subsection">
            <div className="trace-section-head"><b>Recent relaxations</b><span>LAST {step.relaxationLog?.length || 0}</span></div>
            {step.relaxationLog?.length ? <div className="relax-log">{step.relaxationLog.slice(-5).reverse().map((entry, index) => <div className="relax-log-row" key={`${entry.edgeId}-${entry.from}-${entry.to}-${index}`}><span>{label(entry.from)} → {label(entry.to)}</span><b className={entry.accepted ? 'accepted' : 'rejected'}>{shortNumber(entry.old)} → {shortNumber(entry.next)}</b></div>)}</div> : <p className="trace-empty">No edge has been relaxed yet.</p>}
          </div>}

          {mode === 'topo' && <div className="trace-subsection">
            <div className="trace-section-head"><b>Current indegrees</b><span>ZERO = READY</span></div>
            <div className="indegree-grid">{nodes.map(node => <div key={node.id} className={showTrace && step.indegree[node.id] === 0 ? 'is-ready' : ''}><b>{node.label}</b><span>{showTrace ? step.indegree[node.id] : '—'}</span></div>)}</div>
            <div className="state-row"><span>Topological order</span><b>{labelsOfSafe(step.order, nodes) || '—'}</b></div>
          </div>}

          {mstMode && <div className="trace-subsection">
            <div className="trace-section-head"><b>{mode === 'kruskal' ? 'Disjoint sets (DSU)' : 'Growing forest'}</b><span>{mode === 'kruskal' ? `${step.components?.length ?? nodes.length} COMPONENTS` : `${step.chosenEdges?.length || 0} EDGES`}</span></div>
            {mode === 'kruskal' && step.components?.length ? <div className="component-groups">{step.components.map((group, index) => <div key={index}><small>SET {index + 1}</small><b>{labelsOfSafe(group, nodes)}</b></div>)}</div> : <p className="trace-empty">{showTrace ? 'The selected edges form the current forest.' : 'Run the algorithm to build the forest.'}</p>}
            {mode === 'kruskal' && (step.chosenEdges?.length || step.rejectedEdges?.length) > 0 && <div className="edge-decisions"><div className="trace-section-head"><b>Edge decisions</b><span>{step.chosenEdges.length} ACCEPTED · {step.rejectedEdges.length} REJECTED</span></div>{edges.filter(edge => step.chosenEdges.includes(edge.id) || step.rejectedEdges.includes(edge.id)).sort((a, b) => a.w - b.w || a.id - b.id).slice(0, 8).map(edge => <div className="edge-decision-row" key={edge.id}><span>{label(edge.from)} — {label(edge.to)} <small>({edge.w})</small></span><b className={step.chosenEdges.includes(edge.id) ? 'accepted' : 'rejected'}>{step.chosenEdges.includes(edge.id) ? 'ACCEPTED' : 'CYCLE'}</b></div>)}</div>}
            <div className="mst-summary"><span>Selected edges</span><b>{step.chosenEdges?.length || 0}</b><span>Total weight</span><b>{showTrace ? step.totalWeight : '—'}</b></div>
          </div>}

          {showTrace && operation && <div className="operation-card"><div className="trace-section-head"><b>Current operation</b><span>{operation.type?.replaceAll('-', ' ').toUpperCase()}</span></div><p>{operation.from !== undefined && operation.to !== undefined ? `${label(operation.from)} → ${label(operation.to)}` : operation.to !== undefined ? label(operation.to) : operation.from !== undefined ? label(operation.from) : 'Algorithm control step'}</p><div className="operation-metrics">{operation.weight !== undefined && <span>Weight <b>{operation.weight}</b></span>}{operation.priority !== undefined && <span>Priority <b>{operation.priority}</b></span>}{operation.old !== undefined && <span>Previous <b>{shortNumber(operation.old)}</b></span>}{operation.next !== undefined && <span>Updated <b>{shortNumber(operation.next)}</b></span>}{operation.indegree !== undefined && <span>New indegree <b>{operation.indegree}</b></span>}</div></div>}
        </section>
      </aside>
    </div>

    <div className="lab-footnote">
      <b>Model & limits</b>
      <span>Up to 20 vertices; no parallel edges or self-loops. Drag vertices to reposition; the selected start/root is shown with a green ring. Edge weights are whole numbers from −1,000,000 to 1,000,000. BFS and DFS ignore weights. Dijkstra requires non-negative weights; Bellman–Ford detects reachable negative cycles. Prim and Kruskal require undirected graphs; topological sort requires a directed graph. Prepared examples help you compare the algorithms on suitable inputs.</span>
    </div>
  </div>;
}

function labelsOfSafe(indices, nodes) {
  return indices.map(index => nodes.find(node => node.id === index)?.label ?? String(index)).join(' · ');
}

function Roadmap({ completed, onOpen }) {
  return <div className="content-wrap roadmap-wrap">
    <PageHeading eyebrow="THE GUIDED ROUTE" title="A path through graph theory." description="A sequence designed to build intuition in layers. Learn the foundations, practice the core algorithms, then branch into advanced techniques when you need them."><span className="heading-count">5 STAGES · FLEXIBLE ORDER</span></PageHeading>
    <div className="roadmap-banner"><div className="roadmap-banner-mark">⌁</div><div><span className="eyebrow">HOW TO USE THIS PATH</span><h2>Understand → recognize → implement.</h2><p>Every stage adds a new problem-solving tool. The full library stays open, so you can jump to any concept at any time.</p></div><div className="roadmap-banner-score"><b>{corePath.filter(item => completed.includes(item.id)).length}/{corePath.length}</b><span>CORE TOPICS</span></div></div>
    <div className="roadmap-stages">{learningStages.map((stage, stageIndex) => {
      const stageItems = stage.topics.map(id => algorithms.find(item => item.id === id)).filter(Boolean);
      const done = stageItems.filter(item => completed.includes(item.id)).length;
      return <section className="roadmap-stage" key={stage.number}>
        <div className="stage-marker">{stage.number}</div>
        <div className="stage-content"><div className="stage-heading"><div><span className="eyebrow">STAGE {stage.number}</span><h2>{stage.title}</h2><p>{stage.subtitle}</p></div><span className="stage-completion">{done}/{stageItems.length} COMPLETE</span></div>
          <div className="stage-note">{stage.note}</div>
          <div className="stage-items">{stage.topics.map((id, index) => {
            const item = algorithms.find(value => value.id === id);
            if (!item) return null;
            const isDone = completed.includes(item.id);
            return <button key={id} className={`roadmap-item ${isDone ? 'is-done' : ''}`} onClick={() => onOpen(id)}><span className="road-check">{isDone ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="roadmap-item-copy"><b>{item.name}</b><small>{item.complexity}</small></span><span className="road-open">{isDone ? 'REVISIT' : 'OPEN'} ↗</span></button>;
          })}</div>
        </div>
      </section>;
    })}</div>
    <div className="roadmap-next"><div><div className="eyebrow">WHEN YOU ARE READY</div><h2>Go beyond the core path.</h2><p>Explore strongly connected components, bridges, flow networks, matching, tree queries, and advanced contest techniques.</p></div><button className="primary-btn" onClick={() => onOpen('scc')}>Explore an advanced topic <span>↗</span></button></div>
  </div>;
}

function Glossary() {
  const [query, setQuery] = useState('');
  const entries = glossaryTerms.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="content-wrap glossary-wrap"><PageHeading eyebrow="THE LANGUAGE OF GRAPHS" title="Make the terminology familiar." description="A searchable reference for the words and ideas that appear in graph problems."/><label className="library-search glossary-search"><span>⌕</span><input placeholder="Search a graph term…" value={query} onChange={event => setQuery(event.target.value)}/></label><div className="glossary-count">{entries.length} TERMS FOUND</div><div className="glossary-grid">{entries.map(([term, definition], index) => <article className="glossary-card" key={term}><div className="glossary-letter">{String(index + 1).padStart(2, '0')}</div><div><h3>{term}</h3><p>{definition}</p></div></article>)}</div>{!entries.length && <div className="empty-state"><span>⌕</span><h3>No matching terms</h3><p>Try another keyword.</p></div>}</div>;
}

function Resources() {
  return <div className="content-wrap resources-wrap"><PageHeading eyebrow="FURTHER READING" title="Go deeper than the atlas." description="Carefully selected references for proofs, implementation detail, guided practice, and interactive visual intuition."/><div className="resource-callout"><span>✦</span><p><b>How to use this collection.</b> Start with the lesson for intuition, then use these resources to study proofs, variants, constraints, and alternative implementations. Graph Atlas explanations are written as an original learning guide; code samples are educational templates.</p></div><div className="resource-list">{resources.map((resource, index) => <a className="resource-card" href={resource.url} target="_blank" rel="noreferrer" key={resource.name}><span className="resource-index">{String(index + 1).padStart(2, '0')}</span><div><span className="resource-type">{resource.type}</span><h3>{resource.name}</h3><p>{resource.description}</p><span className="resource-url">{resource.url.replace('https://', '')} ↗</span></div><span className="resource-arrow">↗</span></a>)}</div><div className="citation-note"><div className="eyebrow">A SUGGESTED STUDY LOOP</div><p><b>Understand the invariant.</b> Then inspect an implementation, test edge cases, and solve a problem without looking at the code. Return to the references when you need a proof or a more advanced variant.</p></div></div>;
}

export default App;