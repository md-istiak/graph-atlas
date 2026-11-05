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

const glossary = [
  ['Vertex (node)', 'An entity in the graph. A city, person, task, or state can be represented by a vertex.'],
  ['Edge', 'A relationship or connection between two vertices.'],
  ['Degree', 'In an undirected graph, the number of edges incident to a vertex. In directed graphs, distinguish in-degree and out-degree.'],
  ['Path', 'A sequence of vertices where consecutive vertices are connected by edges.'],
  ['Cycle', 'A closed path that returns to its starting vertex, subject to the graph model’s conventions.'],
  ['Connected graph', 'An undirected graph in which every pair of vertices is joined by some path.'],
  ['Strongly connected', 'A directed graph (or component) in which every vertex can reach every other vertex.'],
  ['DAG', 'A directed acyclic graph: a directed graph containing no directed cycle.'],
  ['Tree', 'A connected, undirected, acyclic graph. A tree with V vertices has exactly V−1 edges.'],
  ['Forest', 'An undirected acyclic graph; each connected component is a tree.'],
  ['Bipartite graph', 'A graph whose vertices can be divided into two sets so every edge crosses between the sets.'],
  ['Weighted graph', 'A graph whose edges carry values such as cost, distance, time, or capacity.'],
  ['Sparse / dense', 'Sparse graphs have relatively few edges; dense graphs have edge counts closer to the maximum possible.'],
  ['Relaxation', 'An update that improves a tentative distance or DP value using a newly considered transition.'],
  ['Residual graph', 'The graph of remaining capacity in a flow network, including reverse edges that can undo flow.'],
  ['Spanning tree', 'A connected, acyclic subgraph that includes every vertex of a connected undirected graph.'],
  ['Minimum spanning tree', 'A spanning tree with minimum total edge weight. It does not necessarily give shortest paths from a root.'],
  ['Bridge', 'An edge whose removal increases the number of connected components.'],
  ['Articulation point', 'A vertex whose removal (and incident edges) increases the number of connected components.'],
  ['Matching', 'A set of edges no two of which share an endpoint.'],
  ['Eulerian trail', 'A trail that uses every edge exactly once.'],
  ['Hamiltonian path', 'A path that visits every vertex exactly once.'],
  ['Low-link value', 'A DFS-derived value describing how far upward in discovery order a subtree can reach under a defined edge rule.'],
  ['Condensation graph', 'The DAG obtained by contracting every strongly connected component into one vertex.'],
  ['Cut', 'A partition of vertices into two sets; for an s–t cut, source and sink must be on opposite sides.']
];

const roadmap = [
  { stage: '01', title: 'Learn the model', subtitle: 'Get comfortable reading and storing graphs.', items: ['Graph fundamentals', 'Graph representations', 'BFS', 'DFS', 'Connected components', 'Cycle detection'] },
  { stage: '02', title: 'Solve paths and ordering', subtitle: 'Recognize which graph property a problem is asking for.', items: ['Grid BFS', 'Multi-source BFS', 'Topological sorting (Kahn)', 'Shortest paths in a DAG', 'Dijkstra shortest paths', '0–1 BFS', 'Bellman–Ford'] },
  { stage: '03', title: 'Connect efficiently', subtitle: 'Build trees, merge components, and detect critical links.', items: ['Disjoint Set Union (Union–Find)', 'Kruskal minimum spanning tree', 'Prim minimum spanning tree', 'Bridges (cut edges)', 'Articulation points', 'Bipartite graph checking'] },
  { stage: '04', title: 'Understand directed structure', subtitle: 'Move into components, graph constraints, and advanced paths.', items: ['Strongly connected components (Kosaraju)', 'Tarjan SCC algorithm', 'Floyd–Warshall', 'Johnson’s all-pairs algorithm', 'Lowest common ancestor (binary lifting)', 'Tree diameter and center'] },
  { stage: '05', title: 'Advanced problem solving', subtitle: 'Learn the tools behind harder contest and optimization problems.', items: ['Bipartite matching (augmenting paths)', 'Eulerian path and circuit', 'Dinic maximum flow', 'Minimum cut and max-flow min-cut theorem', '2-SAT (implication graph)', 'Tree dynamic programming', 'Centroid decomposition', 'Heavy-light decomposition', 'Traveling Salesperson Problem (bitmask DP)'] }
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
  const [selectedId, setSelectedId] = useState('bfs');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('graph-atlas-theme') || 'light'; } catch { return 'light'; } });
  const [completed, setCompleted] = useState(() => { try { return JSON.parse(localStorage.getItem('graph-atlas-progress') || '[]'); } catch { return []; } });
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

  useEffect(() => { try { localStorage.setItem('graph-atlas-progress', JSON.stringify(completed)); } catch { /* Progress remains available for this session. */ } }, [completed]);
  useEffect(() => { try { localStorage.setItem('graph-atlas-theme', theme); } catch { /* Theme remains available for this session. */ } }, [theme]);
  useEffect(() => () => { clearInterval(timerRef.current); clearTimeout(noticeTimerRef.current); }, []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        if (document.activeElement === searchInputRef.current && search) setSearch('');
        else { setMobileOpen(false); if (connectMode) { setConnectMode(false); setEdgePick([]); } if (removeEdgeMode) setRemoveEdgeMode(false); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [search, connectMode, removeEdgeMode]);

  const filteredAlgorithms = useMemo(() => algorithms.filter(a => {
    const q=search.trim().toLowerCase();
    return (!q || `${a.name} ${a.summary} ${a.tag} ${a.group}`.toLowerCase().includes(q)) && (activeGroup==='all' || a.group===activeGroup);
  }), [search, activeGroup]);
  const selected = algorithms.find(a => a.id === selectedId) || algorithms[0];
  const progress = Math.round(completed.length / algorithms.length * 100);
  const step = steps[stepIndex] || {visited:[],frontier:[],dist:[],activeEdges:[],chosenEdges:[],current:null,message:'Choose an algorithm and press Run.'};

  const navigate = (p, groupId) => {
    setPage(p);
    if (p === 'library') { setActiveGroup(groupId || 'all'); if (groupId) setSearch(''); }
    setMobileOpen(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const openLesson = (id) => { setSelectedId(id); setPage('lesson'); setMobileOpen(false); window.scrollTo({top:0,behavior:'smooth'}); };
  const toggleComplete = (id) => setCompleted(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const showNotice = (text) => {
    setNotice(text);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 3200);
  };
  const pause = () => { clearInterval(timerRef.current); timerRef.current = null; };
  const clearExecution = () => { pause(); setSteps([]); setStepIndex(0); };
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
  const loadPreset = (key) => {
    const preset = graphPresets[key];
    if (!preset) return;
    pause();
    setNodes(preset.nodes.map(node => ({ ...node })));
    setEdges(preset.edges.map(edge => ({ ...edge })));
    setDirected(preset.directed);
    setWeighted(preset.weighted);
    setMode(preset.mode);
    setSource(preset.source ?? 0);
    setSteps([]);
    setStepIndex(0);
    setConnectMode(false);
    setRemoveEdgeMode(false);
    setEdgePick([]);
    setNotice(`${preset.label} loaded. Press Run to start the trace.`);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 3200);
  };
  const nextNodeLabel = (list) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(label => !list.some(node => node.label === label)) || `V${list.length + 1}`;
  const findOpenPosition = (list) => {
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
    setConnectMode(false);
    setRemoveEdgeMode(false);
    setEdgePick([]);
    if (nodes.length >= 20) { showNotice('The graph lab supports up to 20 vertices.'); return; }
    const id = nodes.length;
    const position = findOpenPosition(nodes);
    if (position.distance < 52) { showNotice('There is no clear space left. Remove or move vertices before adding another.'); return; }
    setNodes(prev => [...prev, { id, label: nextNodeLabel(prev), x: position.x, y: position.y }]);
    clearExecution();
  };
  const onNodeClick = (id) => {
    if (removeEdgeMode) return;
    if(connectMode){
      if(edgePick.includes(id)){setEdgePick(edgePick.filter(x=>x!==id));return;}
      const next=[...edgePick,id]; setEdgePick(next);
      if(next.length===2){
        const [u,v]=next;
        const duplicate = edges.some(e => (e.from===u && e.to===v) || (e.from===v && e.to===u && !directed));
        if (u === v) showNotice('Self-loops are not supported in this visualizer.');
        else if (duplicate) showNotice('That connection already exists.');
        else if (String(edgeWeight).trim() === '' || !Number.isSafeInteger(Number(edgeWeight)) || Math.abs(Number(edgeWeight)) > 1000000) {
          showNotice('Enter a whole-number edge weight between −1,000,000 and 1,000,000.');
        } else {
          const weight = Number(edgeWeight);
          setEdges(prev=>[...prev,{id:Math.max(-1,...prev.map(e=>e.id))+1,from:u,to:v,w:weight}]);
          clearExecution();
        }
        setEdgePick([]);setConnectMode(false);
      }
    } else {
      setSource(id);
      if (steps.length) clearExecution();
    }
  };
  const onCanvasClick = (e) => {
    if (!svgRef.current || connectMode || removeEdgeMode) return;
    if (nodes.length >= 20) { showNotice('The graph lab supports up to 20 vertices.'); return; }
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 720;
    const y = (e.clientY - rect.top) / rect.height * 420;
    if (x > 24 && x < 696 && y > 24 && y < 396) {
      if (nodes.some(node => Math.hypot(node.x - x, node.y - y) < 52)) { showNotice('Choose a spot at least 52 units away from existing vertices.'); return; }
      const id = nodes.length;
      setNodes(prev => [...prev, { id, label: nextNodeLabel(prev), x, y }]);
      clearExecution();
    }
  };
  const onNodePointerDown = (id, event) => {
    if (connectMode || removeEdgeMode || event.button !== 0) return;
    event.stopPropagation();
    clearExecution();
    dragRef.current = { id, pointerId: event.pointerId };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture is an enhancement, not a requirement. */ }
  };
  const onCanvasPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(30, Math.min(690, (event.clientX - rect.left) / rect.width * 720));
    const y = Math.max(30, Math.min(390, (event.clientY - rect.top) / rect.height * 420));
    setNodes(prev => {
      const moving = prev.find(node => node.id === drag.id);
      if (!moving || prev.some(node => node.id !== drag.id && Math.hypot(node.x - x, node.y - y) < 52)) return prev;
      return prev.map(node => node.id === drag.id ? { ...node, x, y } : node);
    });
  };
  const onCanvasPointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };
  const removeSelectedNode = () => {
    const id=source; if(nodes.length<=1){showNotice('Keep at least one vertex in the graph.');return;}
    const remap={}; let nextId=0; nodes.forEach(n=>{if(n.id!==id) remap[n.id]=nextId++;});
    setNodes(nodes.filter(n=>n.id!==id).map(n=>({...n,id:remap[n.id]})));
    setEdges(edges.filter(e=>e.from!==id&&e.to!==id).map((e,i)=>({...e,id:i,from:remap[e.from],to:remap[e.to]})));
    setSource(0);clearExecution();setEdgePick([]);setConnectMode(false);setRemoveEdgeMode(false);
  };
  const onEdgeClick = (id) => {
    if (!removeEdgeMode) return;
    setEdges(prev => prev.filter(edge => edge.id !== id));
    setRemoveEdgeMode(false);
    clearExecution();
    showNotice('Connection removed.');
  };

  return <div className={`app ${theme}`}>
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand" onClick={()=>navigate('home')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate('home');}}} role="button" tabIndex="0"><div className="brand-mark">G<span>∿</span></div><div><strong>GRAPH ATLAS</strong><small>THE GRAPH THEORY LAB</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">
        <button className={page==='home'?'active':''} onClick={()=>navigate('home')}><span className="nav-icon">⌂</span> Overview</button>
        <button className={page==='library'||page==='lesson'?'active':''} onClick={()=>navigate('library')}><span className="nav-icon">▦</span> Algorithm library <i>{algorithms.length}</i></button>
        <button className={page==='visualizer'?'active':''} onClick={()=>navigate('visualizer')}><span className="nav-icon">⌘</span> Graph lab</button>
        <button className={page==='roadmap'?'active':''} onClick={()=>navigate('roadmap')}><span className="nav-icon">◷</span> Learning path</button>
        <button className={page==='glossary'?'active':''} onClick={()=>navigate('glossary')}><span className="nav-icon">Aa</span> Graph glossary</button>
        <button className={page==='resources'?'active':''} onClick={()=>navigate('resources')}><span className="nav-icon">↗</span> References</button>
      </nav>
      <div className="side-label side-label-spaced">YOUR PROGRESS</div>
      <div className="progress-mini"><div className="progress-meta"><span>Library explored</span><b>{completed.length}/{algorithms.length}</b></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div><small>{progress}% of the atlas marked complete</small></div>
      <div className="sidebar-bottom"><div className="offline-indicator"><span/> SELF-CONTAINED LEARNING</div><div className="version-line">GRAPH ATLAS <span>v1.3</span></div></div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>☰</button>
        <div className="breadcrumbs"><span>LEARNING ENVIRONMENT</span><b>/</b><strong>{page==='home'?'OVERVIEW':page.toUpperCase()}</strong></div>
        <div className="top-actions"><div className="global-search"><span>⌕</span><input ref={searchInputRef} aria-label="Search algorithms and concepts" placeholder="Search algorithms, concepts…" value={search} onChange={e=>{setSearch(e.target.value);setActiveGroup('all');if(page!=='library')setPage('library');}}/><kbd>Ctrl K</kbd>{search && <button type="button" className="search-clear" aria-label="Clear search" onClick={()=>setSearch('')}>×</button>}</div><button className="icon-button theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} title="Toggle theme" aria-label="Toggle color theme">{theme==='dark'?'☼':'☾'}</button></div>
      </header>

      {page==='home' && <Home algorithms={algorithms} completed={completed} progress={progress} onNavigate={navigate} onOpen={openLesson} />}
      {page==='library' && <Library search={search} setSearch={setSearch} activeGroup={activeGroup} setActiveGroup={setActiveGroup} items={filteredAlgorithms} completed={completed} onOpen={openLesson} />}
      {page==='lesson' && <Lesson item={selected} completed={completed.includes(selected.id)} onToggle={()=>toggleComplete(selected.id)} onBack={()=>navigate('library')} onVisualize={()=>{setMode(['bfs','dfs','dijkstra','prim','kruskal'].includes(selected.id)?selected.id: selected.id==='bellman-ford'?'bellman':selected.id==='topological'?'topo':'bfs');navigate('visualizer');}} />}
      {page==='visualizer' && <Visualizer nodes={nodes} edges={edges} directed={directed} setDirected={value=>{setDirected(value);clearExecution();}} weighted={weighted} setWeighted={setWeighted} mode={mode} setMode={m=>{setMode(m);clearExecution();}} source={source} setSource={value=>{setSource(value);clearExecution();}} steps={steps} stepIndex={stepIndex} step={step} run={run} play={play} pause={pause} setStepIndex={setStepIndex} playSpeed={playSpeed} setPlaySpeed={setPlaySpeed} addNode={addNode} resetGraph={resetGraph} loadPreset={loadPreset} connectMode={connectMode} setConnectMode={setConnectMode} removeEdgeMode={removeEdgeMode} setRemoveEdgeMode={setRemoveEdgeMode} edgePick={edgePick} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} onCanvasClick={onCanvasClick} svgRef={svgRef} edgeWeight={edgeWeight} setEdgeWeight={setEdgeWeight} removeSelectedNode={removeSelectedNode} showNotice={showNotice} onOpenLesson={id => openLesson(id)} onNodePointerDown={onNodePointerDown} onCanvasPointerMove={onCanvasPointerMove} onCanvasPointerUp={onCanvasPointerUp} />}
      {page==='roadmap' && <Roadmap completed={completed} onOpen={openLesson} />}
      {page==='glossary' && <Glossary />}
      {page==='resources' && <Resources />}
      <footer className="footer"><span>GRAPH ATLAS</span><span>Learn the model. Trace the algorithm. Prove the result.</span><span>Built for curious problem solvers.</span></footer>
      {notice && <div className="toast">{notice}</div>}
    </main>
  </div>;
}

function PageHeading({eyebrow,title,description,children}) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{children}</div>; }
function Home({algorithms,completed,progress,onNavigate,onOpen}) {
  const featured=['bfs','dijkstra','kruskal','scc'].map(id=>algorithms.find(a=>a.id===id));
  const stats=[[algorithms.length, 'LESSON TOPICS'],['10', 'LEARNING CATEGORIES'],['C++17','IMPLEMENTATION FOCUS'],['∞','GRAPHS TO EXPLORE']];
  return <div className="content-wrap">
    <section className="hero-panel"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> YOUR GRAPH THEORY COMPANION</div><h1>Understand the<br/><em>connections.</em></h1><p>A practical atlas of graph theory — from your first traversal to advanced network flow. Learn the idea, see the algorithm, then write it in C++.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>onNavigate('library')}>Explore algorithms <span>↗</span></button><button className="text-btn" onClick={()=>onNavigate('visualizer')}>Open graph lab <span>→</span></button></div><div className="hero-note"><span>✳</span> THEORY <b>+</b> VISUALS <b>+</b> IMPLEMENTATION <b>+</b> APPLICATIONS</div></div><div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><svg viewBox="0 0 440 340" role="img" aria-label="Abstract connected graph illustration"><g className="hero-edges"><path d="M76 170 L168 66 L280 94 L360 182 L282 276 L137 267 L76 170 M168 66 L214 188 L280 94 M214 188 L360 182 M214 188 L137 267 M214 188 L282 276 M76 170 L214 188"/><path d="M168 66 L282 276 M137 267 L280 94" className="edge-dash"/></g><g className="hero-nodes"><circle cx="76" cy="170" r="9"/><circle cx="168" cy="66" r="12"/><circle cx="280" cy="94" r="8"/><circle cx="360" cy="182" r="11"/><circle cx="282" cy="276" r="9"/><circle cx="137" cy="267" r="7"/><circle cx="214" cy="188" r="16" className="center-node"/></g><g className="hero-labels"><text x="55" y="151">01</text><text x="151" y="43">02</text><text x="288" y="75">03</text><text x="375" y="178">04</text><text x="290" y="301">05</text><text x="113" y="291">06</text><text x="202" y="192">G</text></g></svg><div className="floating-chip chip-a"><span/> O(V + E) <small>TRAVERSAL</small></div><div className="floating-chip chip-b">01 <small>CONNECTED COMPONENT</small></div></div></section>
    <div className="stats-grid">{stats.map(([v,l])=><div className="stat-card" key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
    <section className="section-block"><div className="section-head"><div><div className="eyebrow">START HERE</div><h2>A map of the territory</h2><p>Follow a natural progression, or jump straight to the algorithm you need.</p></div><button className="subtle-btn" onClick={()=>onNavigate('roadmap')}>View learning path ↗</button></div><div className="path-grid">{algorithmGroups.slice(0,6).map((g,i)=><button className="path-card" key={g.id} onClick={()=>onNavigate('library',g.id)}><span className="path-number">0{i+1}</span><span className="path-arrow">↗</span><h3>{g.title}</h3><p>{g.desc}</p><div className="path-line"><span style={{width:`${[34,55,48,63,42,38][i]}%`}}/></div></button>)}</div></section>
    <section className="section-block"><div className="section-head"><div><div className="eyebrow">THE ESSENTIALS</div><h2>Algorithms worth knowing</h2><p>Four foundational ideas that unlock a large part of graph problem solving.</p></div><button className="subtle-btn" onClick={()=>onNavigate('library')}>Full library ↗</button></div><div className="featured-grid">{featured.map((a,i)=><article className="featured-card" key={a.id} role="button" tabIndex="0" onClick={()=>onOpen(a.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen(a.id);}}}><div className="featured-top"><span className="feature-index">0{i+1}</span><span className="level-pill">{a.level}</span></div><h3>{a.name}</h3><p>{a.summary}</p><div className="feature-bottom"><span>{a.complexity}</span><b>Read lesson ↗</b></div></article>)}</div></section>
    <section className="progress-banner"><div className="progress-orbit">{progress}%</div><div><div className="eyebrow">YOUR LEARNING RECORD</div><h2>Small steps. Strong foundations.</h2><p>{completed.length ? `${completed.length} of ${algorithms.length} topics marked complete. Keep building your graph intuition.` : 'Mark lessons complete as you work through them. Your progress stays saved in this browser.'}</p></div><button className="primary-btn" onClick={()=>onNavigate('roadmap')}>Continue learning <span>→</span></button></section>
  </div>;
}

function Library({search,setSearch,activeGroup,setActiveGroup,items,completed,onOpen}) {
  return <div className="content-wrap"><PageHeading eyebrow="THE KNOWLEDGE BASE" title="Algorithm library" description="Browse graph concepts and algorithms. Each lesson includes the core idea, step-by-step logic, complexity, use cases, pitfalls, and C++ examples."><span className="heading-count">{items.length} RESULTS</span></PageHeading>
    <div className="library-controls"><div className="library-search"><span>⌕</span><input aria-label="Find an algorithm or concept" placeholder="Find an algorithm or concept…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button type="button" aria-label="Clear search" onClick={()=>setSearch('')}>×</button>}</div><select value={activeGroup} onChange={e=>setActiveGroup(e.target.value)}><option value="all">All categories</option>{algorithmGroups.map(g=><option value={g.id} key={g.id}>{g.title}</option>)}</select></div>
    {algorithmGroups.filter(g=>activeGroup==='all'||g.id===activeGroup).map(g=>{const groupItems=items.filter(a=>a.group===g.id);if(!groupItems.length)return null;return <section className="library-section" key={g.id}><div className="library-group-heading"><div><div className="eyebrow">{g.title.toUpperCase()}</div><p>{g.desc}</p></div><span>{groupItems.length.toString().padStart(2,'0')} TOPICS</span></div><div className="algorithm-grid">{groupItems.map((a,i)=><button className="algorithm-card" key={a.id} onClick={()=>onOpen(a.id)}><div className="algorithm-card-top"><span className="algorithm-symbol">{String.fromCharCode(65+(i%26))}</span><span className="level-pill">{a.level}</span></div><h3>{a.name}</h3><p>{a.summary}</p><div className="algorithm-card-bottom"><span>{a.complexity}</span><span className={completed.includes(a.id)?'done-mark':'open-mark'}>{completed.includes(a.id)?'✓ COMPLETE':'OPEN LESSON ↗'}</span></div></button>)}</div></section>})}
    {!items.length&&<div className="empty-state"><div>⌕</div><h3>No matching lessons</h3><p>Try a different keyword or category.</p><button className="subtle-btn" onClick={()=>{setSearch('');setActiveGroup('all')}}>Clear filters</button></div>}
  </div>;
}

function Lesson({item,completed,onToggle,onBack,onVisualize}) {
  const [tab,setTab]=useState('overview'); const [copied,setCopied]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(item.code||'');setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{setCopied(false);}};
  const group=algorithmGroups.find(g=>g.id===item.group);
  return <div className="content-wrap lesson-wrap"><button className="back-link" onClick={onBack}>← BACK TO LIBRARY</button><div className="lesson-header"><div><div className="eyebrow">{group?.title.toUpperCase()} / {item.tag.toUpperCase()}</div><h1>{item.name}</h1><p>{item.summary}</p><div className="lesson-meta"><span className="level-pill">{item.level}</span><span className="complexity-pill">◷ {item.complexity}</span></div></div><div className="lesson-header-actions"><button className="outline-btn" onClick={onVisualize}>⌘ Open visualizer</button><button className={completed?'complete-btn done':'complete-btn'} onClick={onToggle}>{completed?'✓ Completed':'＋ Mark complete'}</button></div></div>
    <div className="lesson-tabs"><button className={tab==='overview'?'selected':''} onClick={()=>setTab('overview')}>Overview</button><button className={tab==='code'?'selected':''} onClick={()=>setTab('code')}>C++ implementation</button><button className={tab==='practice'?'selected':''} onClick={()=>setTab('practice')}>Application & pitfalls</button></div>
    {tab==='overview'&&<div className="lesson-layout"><div className="lesson-main"><section className="lesson-section"><div className="section-kicker"><span>01</span> THE CORE IDEA</div><h2>What is happening?</h2><p>{item.idea}</p></section><section className="lesson-section"><div className="section-kicker"><span>02</span> ALGORITHM WALKTHROUGH</div><h2>How it works</h2><ol className="walkthrough-list">{item.how.map((s,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{s}</p></li>)}</ol></section><section className="lesson-section"><div className="section-kicker"><span>03</span> A REAL-WORLD CONNECTION</div><h2>Think of it this way</h2><div className="real-example"><div className="example-icon">↗</div><div><span>REAL-LIFE MODEL</span><p>{item.example}</p></div></div></section><section className="lesson-section"><div className="section-kicker"><span>04</span> WHERE IT IS USEFUL</div><h2>Applications</h2><div className="application-grid">{item.applications.map(x=><div key={x}><span>↗</span>{x}</div>)}</div></section></div><aside className="lesson-aside"><div className="quick-facts"><div className="eyebrow">AT A GLANCE</div><div className="fact-row"><span>Difficulty</span><b>{item.level}</b></div><div className="fact-row"><span>Category</span><b>{group?.title}</b></div><div className="fact-row"><span>Complexity</span><b>{item.complexity}</b></div><div className="fact-row"><span>Code standard</span><b>C++17</b></div></div><div className="aside-note"><div className="eyebrow">MENTAL MODEL</div><p>{item.name.toLowerCase().includes('dijkstra')?'Always expand the currently cheapest unsettled vertex; non-negative weights make its distance final.':item.name.toLowerCase().includes('bfs')?'The queue preserves layer order: every vertex at distance d is processed before distance d+1.':item.name.toLowerCase().includes('dfs')?'The call stack records the current exploration path; finishing a call is as meaningful as entering it.':'Focus on the invariant: what does the algorithm guarantee after each step?'}</p></div><button className="aside-visual-btn" onClick={onVisualize}>Explore in visual lab <span>↗</span></button></aside></div>}
    {tab==='code'&&<div className="code-page"><div className="code-intro"><div><div className="eyebrow">IMPLEMENTATION REFERENCE</div><h2>C++17 template</h2><p>This is an educational implementation pattern. Adapt input parsing, indexing, limits, and return values to the exact problem statement.</p></div><button className="copy-btn" onClick={copy}>{copied?'✓ Copied':'▣ Copy code'}</button></div><div className="code-window"><div className="code-window-top"><span><i/> C++ / GRAPH ALGORITHM</span><span>STANDARD C++17</span></div><pre><code>{item.code || '// Implementation notes coming soon.'}</code></pre></div><div className="code-tip"><b>Implementation checklist</b><span>Check the vertex indexing (0-based or 1-based), constraints, integer overflow, disconnected components, and edge direction before submitting.</span></div></div>}
    {tab==='practice'&&<div className="lesson-layout"><div className="lesson-main"><section className="lesson-section"><div className="section-kicker"><span>01</span> WHEN TO REACH FOR IT</div><h2>Recognize the pattern</h2><p>{item.example}</p><div className="application-grid">{item.applications.map(x=><div key={x}><span>✳</span>{x}</div>)}</div></section><section className="lesson-section"><div className="section-kicker"><span>02</span> COMMON MISTAKES</div><h2>Things to watch for</h2><ul className="pitfall-list">{item.pitfalls.map(x=><li key={x}>{x}</li>)}</ul></section><section className="lesson-section"><div className="section-kicker"><span>03</span> COMPLEXITY</div><h2>What the bound tells you</h2><p>{item.complexity}. The practical runtime also depends on the graph representation, data structures, and input constraints. Always estimate both time and memory before choosing an approach.</p></section></div><aside className="lesson-aside"><div className="quick-facts"><div className="eyebrow">PROBLEM-SOLVING CHECK</div><p>Before coding, ask yourself:</p><ul className="check-list"><li>Is the graph directed?</li><li>Are edge weights present?</li><li>Can weights be negative?</li><li>Is the graph connected?</li><li>Do I need one source or all pairs?</li></ul></div><div className="aside-note"><div className="eyebrow">SOURCE NOTE</div><p>{item.source || 'This lesson is an original educational synthesis based on the references listed in the References section.'}</p></div></aside></div>}
    <div className="lesson-footer-nav"><button className="text-btn" onClick={onBack}>← All algorithms</button><button className="primary-btn" onClick={onVisualize}>Try the visualizer <span>↗</span></button></div>
  </div>;
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

const roadmapLessonIds = {
  'Graph fundamentals':'graph-model', 'Graph representations':'representations', 'BFS':'bfs', 'DFS':'dfs',
  'Connected components':'connected-components', 'Cycle detection':'cycle-detection', 'Grid BFS':'grid-bfs',
  'Multi-source BFS':'multi-bfs', 'Topological sorting (Kahn)':'topological', 'Shortest paths in a DAG':'dag-shortest',
  'Dijkstra shortest paths':'dijkstra', '0–1 BFS':'zero-one-bfs', 'Bellman–Ford':'bellman-ford',
  'Disjoint Set Union (Union–Find)':'dsu', 'Kruskal minimum spanning tree':'kruskal',
  'Prim minimum spanning tree':'prim', 'Bridges (cut edges)':'bridges', 'Articulation points':'articulation',
  'Bipartite graph checking':'bipartite', 'Strongly connected components (Kosaraju)':'scc',
  'Tarjan SCC algorithm':'tarjan-scc', 'Floyd–Warshall':'floyd-warshall', 'Johnson’s all-pairs algorithm':'johnson',
  'Lowest common ancestor (binary lifting)':'lca', 'Tree diameter and center':'tree-diameter',
  'Bipartite matching (augmenting paths)':'matching', 'Eulerian path and circuit':'eulerian',
  'Dinic maximum flow':'dinic', 'Minimum cut and max-flow min-cut theorem':'min-cut',
  '2-SAT (implication graph)':'two-sat', 'Tree dynamic programming':'tree-dp',
  'Centroid decomposition':'centroid', 'Heavy-light decomposition':'hld',
  'Traveling Salesperson Problem (bitmask DP)':'tsp'
};

function Roadmap({completed,onOpen}) {
  return <div className="content-wrap"><PageHeading eyebrow="A STRUCTURED ROUTE" title="Learning path" description="A suggested order for building graph intuition. You can move at your own pace and jump between topics whenever a problem demands it."><span className="heading-count">5 STAGES</span></PageHeading><div className="roadmap-intro"><div className="roadmap-icon">⌁</div><div><b>From first principles to advanced graph techniques</b><p>Start with representation and traversal. Then learn paths, connectivity, trees, and optimization. The sequence is a recommendation, not a prerequisite lock.</p></div></div><div className="roadmap-stages">{roadmap.map(stage=><section className="roadmap-stage" key={stage.stage}><div className="stage-marker">{stage.stage}</div><div className="stage-content"><div className="stage-heading"><div><h2>{stage.title}</h2><p>{stage.subtitle}</p></div><span>{stage.items.filter(x=>{const id=roadmapLessonIds[x];return id&&completed.includes(id)}).length}/{stage.items.length} COMPLETE</span></div><div className="stage-items">{stage.items.map((name,i)=>{const id=roadmapLessonIds[name];const a=algorithms.find(x=>x.id===id);const done=a&&completed.includes(a.id);return <button key={name} className="roadmap-item" onClick={()=>a&&onOpen(a.id)} disabled={!a}><span className={done?'road-check checked':'road-check'}>{done?'✓':String(i+1).padStart(2,'0')}</span><b>{name}</b><span className="road-open">{a?'↗':'COMING UP'}</span></button>})}</div></div></section>)}</div></div>;
}
function Glossary() { const [q,setQ]=useState('');const list=glossary.filter(([a,b])=>`${a} ${b}`.toLowerCase().includes(q.toLowerCase()));return <div className="content-wrap"><PageHeading eyebrow="THE LANGUAGE OF GRAPHS" title="Graph glossary" description="A compact dictionary for the terminology that appears throughout graph problems."/><label className="library-search glossary-search"><span>⌕</span><input placeholder="Search a term…" value={q} onChange={e=>setQ(e.target.value)}/></label><div className="glossary-grid">{list.map(([term,desc])=><article className="glossary-card" key={term}><div className="glossary-letter">{term[0].toUpperCase()}</div><div><h3>{term}</h3><p>{desc}</p></div></article>)}</div>{!list.length&&<div className="empty-state">No matching terms.</div>}</div>; }
function Resources() { return <div className="content-wrap"><PageHeading eyebrow="FURTHER READING" title="References & resources" description="Graph Atlas is a curated educational compilation. These external resources were used to cross-check topic coverage, terminology, algorithm invariants, and implementation patterns."/><div className="resource-callout"><span>ⓘ</span><p><b>Attribution note.</b> Explanations and examples on this site are rewritten as an original learning guide. C++ snippets are educational templates, not copied verbatim from one source. Follow the cited references for deeper proofs, variants, and edge-case discussions.</p></div><div className="resource-list">{resources.map((r,i)=><a className="resource-card" href={r.url} target="_blank" rel="noreferrer" key={r.name}><span className="resource-index">0{i+1}</span><div><span className="resource-type">{r.type}</span><h3>{r.name}</h3><p>{r.description}</p><span className="resource-url">{r.url.replace('https://','')} ↗</span></div><span className="resource-arrow">↗</span></a>)}</div><div className="citation-note"><div className="eyebrow">HOW TO USE THE REFERENCES</div><p><b>For proof and implementation details:</b> CP-Algorithms. <b>For guided competitive-programming practice:</b> USACO Guide. <b>For animation and intuition:</b> VisuAlgo and William Fiset’s video lessons. <b>For a broader software-library taxonomy:</b> Boost.Graph documentation.</p></div></div>; }

export default App;
