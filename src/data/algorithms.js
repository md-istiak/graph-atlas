const bfsCode = `#include <bits/stdc++.h>
using namespace std;

// adj[u] contains every vertex reachable from u.
vector<int> bfs(const vector<vector<int>>& adj, int source) {
    int n = (int)adj.size();
    vector<int> dist(n, -1), parent(n, -1);
    queue<int> q;
    dist[source] = 0;
    q.push(source);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;
            parent[v] = u;
            q.push(v);
        }
    }
    return dist; // -1 means unreachable
}`;

const dfsCode = `#include <bits/stdc++.h>
using namespace std;

void dfs(int u, const vector<vector<int>>& adj, vector<char>& seen) {
    seen[u] = true;
    // Process u here (entry time).
    for (int v : adj[u]) {
        if (!seen[v]) dfs(v, adj, seen);
    }
    // Process u here (exit time / post-order).
}

// To cover a disconnected graph:
// for (int s = 0; s < n; ++s)
//     if (!seen[s]) dfs(s, adj, seen);`;

const dijkstraCode = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = (1LL << 62);

vector<ll> dijkstra(int n, const vector<vector<pair<int,ll>>>& adj, int s) {
    vector<ll> dist(n, INF);
    priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;
    dist[s] = 0;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (du != dist[u]) continue; // stale heap entry
        for (auto [v, w] : adj[u]) {
            if (w < 0) throw invalid_argument("Dijkstra needs non-negative weights");
            if (du + w < dist[v]) {
                dist[v] = du + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`;

const bellmanCode = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = (1LL << 62);
struct Edge { int u, v; ll w; };

// Returns distances. A reachable negative cycle is reported separately.
pair<vector<ll>, bool> bellmanFord(int n, const vector<Edge>& edges, int s) {
    vector<ll> d(n, INF);
    d[s] = 0;
    for (int i = 0; i < n - 1; ++i) {
        bool changed = false;
        for (auto [u, v, w] : edges) {
            if (d[u] != INF && d[u] + w < d[v]) {
                d[v] = d[u] + w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    bool negativeCycle = false;
    for (auto [u, v, w] : edges)
        if (d[u] != INF && d[u] + w < d[v]) negativeCycle = true;
    return {d, negativeCycle};
}`;

const floydCode = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = (1LL << 60);

// Initialize d[i][i] = 0 and d[u][v] with the minimum direct edge.
void floydWarshall(vector<vector<ll>>& d) {
    int n = (int)d.size();
    for (int k = 0; k < n; ++k)
        for (int i = 0; i < n; ++i) {
            if (d[i][k] == INF) continue;
            for (int j = 0; j < n; ++j) {
                if (d[k][j] == INF) continue;
                d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
            }
        }
    // A negative d[v][v] indicates a negative cycle through v.
}`;

const zeroOneCode = `#include <bits/stdc++.h>
using namespace std;

vector<int> zeroOneBFS(int n, const vector<vector<pair<int,int>>>& adj, int s) {
    const int INF = 1e9;
    vector<int> d(n, INF);
    deque<int> dq;
    d[s] = 0; dq.push_front(s);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u]) {
            // Every edge weight must be exactly 0 or 1.
            if (d[u] + w >= d[v]) continue;
            d[v] = d[u] + w;
            if (w == 0) dq.push_front(v);
            else dq.push_back(v);
        }
    }
    return d;
}`;

const topoCode = `#include <bits/stdc++.h>
using namespace std;

// Kahn's algorithm. Empty result means the directed graph has a cycle.
vector<int> topologicalSort(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; ++u)
        for (int v : adj[u]) ++indeg[v];
    queue<int> q;
    for (int v = 0; v < n; ++v) if (indeg[v] == 0) q.push(v);
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() != n) return {};
    return order;
}`;

const dsuCode = `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    DSU(int n) : parent(n), sz(n, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]); // path compression
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        return true;
    }
};`;

const kruskalCode = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
struct Edge { int u, v; ll w; };
struct DSU {
    vector<int> p, sz;
    DSU(int n): p(n), sz(n,1) { iota(p.begin(),p.end(),0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a,int b) {
        a=find(a); b=find(b); if(a==b) return false;
        if(sz[a]<sz[b]) swap(a,b); p[b]=a; sz[a]+=sz[b]; return true;
    }
};

pair<ll, vector<Edge>> kruskal(int n, vector<Edge> edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });
    DSU dsu(n); ll total = 0; vector<Edge> chosen;
    for (auto e : edges) if (dsu.unite(e.u, e.v)) {
        total += e.w; chosen.push_back(e);
    }
    return {total, chosen}; // chosen has n-1 edges only if graph is connected
}`;

const primCode = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// adj[u] = {weight, vertex}. Handles disconnected graphs as a forest.
ll primForest(int n, const vector<vector<pair<ll,int>>>& adj) {
    vector<char> used(n, false);
    ll total = 0;
    using State = tuple<ll,int,int>; // weight, vertex, parent
    priority_queue<State, vector<State>, greater<>> pq;
    for (int start = 0; start < n; ++start) if (!used[start]) {
        pq.push({0, start, -1});
        while (!pq.empty()) {
            auto [w, u, parent] = pq.top(); pq.pop();
            if (used[u]) continue;
            used[u] = true;
            total += w;
            for (auto [cost, v] : adj[u])
                if (!used[v]) pq.push({cost, v, u});
        }
    }
    return total;
}`;

const bipartiteCode = `#include <bits/stdc++.h>
using namespace std;

bool isBipartite(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> color(n, -1);
    for (int s = 0; s < n; ++s) if (color[s] == -1) {
        queue<int> q; q.push(s); color[s] = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) color[v] = color[u] ^ 1, q.push(v);
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`;

const kosarajuCode = `#include <bits/stdc++.h>
using namespace std;

void dfs1(int u, const vector<vector<int>>& g, vector<char>& vis, vector<int>& order) {
    vis[u] = true;
    for (int v : g[u]) if (!vis[v]) dfs1(v, g, vis, order);
    order.push_back(u);
}
void dfs2(int u, const vector<vector<int>>& rg, vector<int>& comp, int id) {
    comp[u] = id;
    for (int v : rg[u]) if (comp[v] == -1) dfs2(v, rg, comp, id);
}

vector<int> kosaraju(const vector<vector<int>>& g) {
    int n = g.size();
    vector<vector<int>> rg(n);
    for (int u=0; u<n; ++u) for (int v:g[u]) rg[v].push_back(u);
    vector<char> vis(n, false); vector<int> order;
    for (int i=0;i<n;++i) if(!vis[i]) dfs1(i,g,vis,order);
    vector<int> comp(n,-1); int id=0;
    reverse(order.begin(),order.end());
    for (int u:order) if(comp[u]==-1) dfs2(u,rg,comp,id++);
    return comp;
}`;

const bridgeCode = `#include <bits/stdc++.h>
using namespace std;

// Undirected graph. Edge IDs are used so parallel edges are handled correctly.
vector<pair<int,int>> findBridges(int n, const vector<vector<pair<int,int>>>& adj) {
    vector<int> tin(n,-1), low(n,-1);
    vector<pair<int,int>> bridges; int timer=0;
    function<void(int,int)> dfs = [&](int u, int parentEdge) {
        tin[u]=low[u]=timer++;
        for (auto [v,id] : adj[u]) {
            if (id==parentEdge) continue;
            if (tin[v]!=-1) low[u]=min(low[u],tin[v]);
            else {
                dfs(v,id); low[u]=min(low[u],low[v]);
                if (low[v]>tin[u]) bridges.push_back({u,v});
            }
        }
    };
    for(int i=0;i<n;++i) if(tin[i]==-1) dfs(i,-1);
    return bridges;
}`;

const lcaCode = `#include <bits/stdc++.h>
using namespace std;

struct LCA {
    int n, LOG; vector<vector<int>> up, adj; vector<int> depth;
    LCA(int n): n(n), LOG(1), adj(n), depth(n) {
        while ((1 << LOG) <= n) ++LOG;
        up.assign(LOG, vector<int>(n));
    }
    void addEdge(int u,int v) { adj[u].push_back(v); adj[v].push_back(u); }
    void build(int root=0) {
        function<void(int,int)> dfs = [&](int u,int p) {
            up[0][u]=p;
            for(int k=1;k<LOG;++k) up[k][u]=up[k-1][up[k-1][u]];
            for(int v:adj[u]) if(v!=p) depth[v]=depth[u]+1, dfs(v,u);
        };
        dfs(root,root);
    }
    int query(int a,int b) {
        if(depth[a]<depth[b]) swap(a,b);
        int diff=depth[a]-depth[b];
        for(int k=0;k<LOG;++k) if(diff>>k&1) a=up[k][a];
        if(a==b) return a;
        for(int k=LOG-1;k>=0;--k) if(up[k][a]!=up[k][b]) a=up[k][a],b=up[k][b];
        return up[0][a];
    }
};
// Assumes a connected tree rooted at root; call build() after adding edges.`;

const dinicCode = `#include <bits/stdc++.h>
using namespace std;

struct Dinic {
    struct Edge { int to, rev, cap; };
    int n; vector<vector<Edge>> g; vector<int> level, ptr;
    Dinic(int n): n(n), g(n), level(n), ptr(n) {}
    void addEdge(int u,int v,int cap) {
        Edge a{v,(int)g[v].size(),cap}, b{u,(int)g[u].size(),0};
        g[u].push_back(a); g[v].push_back(b);
    }
    bool bfs(int s,int t) {
        fill(level.begin(),level.end(),-1); queue<int> q;
        level[s]=0; q.push(s);
        while(!q.empty()) { int u=q.front(); q.pop();
            for(auto &e:g[u]) if(e.cap>0 && level[e.to]==-1)
                level[e.to]=level[u]+1,q.push(e.to);
        }
        return level[t]!=-1;
    }
    int dfs(int u,int t,int pushed) {
        if(!pushed || u==t) return pushed;
        for(int &cid=ptr[u];cid<(int)g[u].size();++cid) {
            Edge &e=g[u][cid]; if(e.cap<=0 || level[e.to]!=level[u]+1) continue;
            int tr=dfs(e.to,t,min(pushed,e.cap)); if(!tr) continue;
            e.cap-=tr; g[e.to][e.rev].cap+=tr; return tr;
        }
        return 0;
    }
    int maxFlow(int s,int t) {
        int flow=0;
        while(bfs(s,t)) { fill(ptr.begin(),ptr.end(),0);
            while(int pushed=dfs(s,t,INT_MAX)) flow+=pushed;
        }
        return flow;
    }
};`;

export const algorithmGroups = [
  { id:'foundations', title:'Foundations', desc:'The language of graphs: models, representations, and properties.' },
  { id:'traversal', title:'Traversal & exploration', desc:'Explore vertices, discover paths, and understand reachability.' },
  { id:'connectivity', title:'Connectivity & structure', desc:'Components, cuts, cycles, and the hidden structure of a network.' },
  { id:'shortest', title:'Shortest paths', desc:'Find efficient routes through weighted and unweighted networks.' },
  { id:'mst', title:'Spanning trees & DSU', desc:'Connect every vertex cheaply and maintain dynamic components.' },
  { id:'directed', title:'Directed graphs & DAGs', desc:'Dependencies, ordering, cycles, and directed reachability.' },
  { id:'trees', title:'Tree algorithms', desc:'Queries and optimization on acyclic connected graphs.' },
  { id:'special', title:'Special graph problems', desc:'Coloring, matching, Euler tours, and Hamiltonian routes.' },
  { id:'flow', title:'Network flow & cuts', desc:'Move resources through capacity-constrained networks.' },
  { id:'advanced', title:'Advanced graph techniques', desc:'Powerful techniques for hard contest and research problems.' }
];

export const algorithms = [
  {id:'graph-model',name:'Graph fundamentals',group:'foundations',level:'Beginner',tag:'Theory',complexity:'Depends on representation',summary:'Model entities as vertices and relationships as edges.',idea:'A graph is G = (V, E): a set of vertices and a set of edges. Edges may be directed or undirected, weighted or unweighted, and may allow parallel edges or self-loops.',how:['Choose what an entity represents and make it a vertex.','Represent each relationship as an edge.','Decide whether direction matters and whether edges need weights.','State assumptions: connectedness, simple graph vs multigraph, and indexing.'],example:'A city map: intersections are vertices, roads are edges, and travel time is an edge weight. A one-way street is a directed edge.',applications:['Social networks','Road and airline networks','Dependency systems','Communication networks'],pitfalls:['A tree is connected and acyclic; a forest is an acyclic graph that may be disconnected.','A directed edge u → v does not imply v → u.','A weighted edge can represent cost, time, distance, capacity, or risk.'],code:`// Edge list: each pair is one edge
vector<tuple<int,int,int>> edges;

// Adjacency list: efficient for sparse graphs
vector<vector<pair<int,int>>> adj(n);
adj[u].push_back({v, weight});

// Adjacency matrix: convenient for dense graphs
vector<vector<int>> matrix(n, vector<int>(n, INF));`},
  {id:'representations',name:'Graph representations',group:'foundations',level:'Beginner',tag:'Data modeling',complexity:'Adjacency list O(V+E); matrix O(V²)',summary:'Choose a storage format that matches the graph and operations.',idea:'An adjacency list stores each vertex’s neighbors and is usually the default for sparse contest graphs. An adjacency matrix stores direct connections in a V × V table. An edge list stores the edges themselves.',how:['Use adjacency lists for traversals and sparse graphs.','Use matrices for dense graphs or constant-time edge lookup.','Use edge lists for Kruskal and Bellman–Ford.','For undirected graphs, insert each edge in both endpoint lists.'],example:'A road network with millions of intersections and only a few roads per intersection is sparse, so an adjacency list avoids allocating a huge mostly-empty matrix.',applications:['Memory-efficient maps','Fast edge existence checks','Sorting edges for MST','Input parsing in programming contests'],pitfalls:['Undirected edges must be inserted twice in an adjacency list.','A matrix needs a clear convention for “no edge”; zero may be a valid weight.','Parallel edges require care when converting representations.'],code:`// Undirected weighted graph
int n, m; cin >> n >> m;
vector<vector<pair<int,int>>> adj(n);
for (int i=0; i<m; ++i) {
    int u,v,w; cin >> u >> v >> w;
    adj[u].push_back({v,w});
    adj[v].push_back({u,w});
}`},
  {id:'bfs',name:'Breadth-first search (BFS)',group:'traversal',level:'Beginner',tag:'Traversal',complexity:'O(V + E) time · O(V) space',summary:'Explore a graph in layers using a FIFO queue.',idea:'BFS visits all vertices at distance 0, then distance 1, then distance 2, and so on. Because every edge contributes exactly one step, the first time a vertex is discovered its path has the minimum number of edges.',how:['Mark the source discovered and push it into a queue.','Pop the front vertex and inspect each neighbor.','For every undiscovered neighbor, set its parent and distance, then enqueue it.','Continue until the queue is empty.'],example:'Finding the minimum number of subway stops between two stations when every ride between adjacent stations counts as one stop.',applications:['Unweighted shortest paths','Social-network degrees of separation','Web crawling by layers','Grid movement with equal-cost steps'],pitfalls:['BFS minimizes number of edges, not total weight.','Mark vertices when enqueuing, not when dequeuing, to avoid duplicate queue entries.','For disconnected graphs, start BFS from every still-unvisited vertex.'],code:bfsCode,source:'CP-Algorithms: Breadth First Search'},
  {id:'dfs',name:'Depth-first search (DFS)',group:'traversal',level:'Beginner',tag:'Traversal',complexity:'O(V + E) time · O(V) space',summary:'Follow one path as far as possible, then backtrack.',idea:'DFS explores a branch deeply before returning to explore alternatives. Recursive calls naturally create a stack; an explicit stack can do the same iteratively.',how:['Mark the current vertex visited.','For each neighbor, recurse if it has not been visited.','Use entry and exit actions to compute discovery/finish times.','Repeat from another unvisited vertex to cover disconnected components.'],example:'Exploring every reachable page in a link network, while recording the path used to reach each page.',applications:['Connected components','Cycle detection','Topological ordering','Bridges, articulation points, and SCCs'],pitfalls:['Recursive DFS can overflow the call stack on a very deep graph; use iterative DFS for large limits.','DFS does not generally find shortest paths.','For undirected cycle detection, ignore the parent edge—not merely the parent vertex—when parallel edges are possible.'],code:dfsCode,source:'CP-Algorithms: Depth First Search'},
  {id:'multi-bfs',name:'Multi-source BFS',group:'traversal',level:'Intermediate',tag:'Traversal',complexity:'O(V + E)',summary:'Run one BFS wave from many starting vertices at once.',idea:'Put every source into the queue at distance zero. The resulting distance of a vertex is its minimum distance to any source.',how:['Initialize all distances to infinity.','Insert every source with distance zero.','Run ordinary BFS from the shared queue.','Each vertex is claimed by whichever source reaches it first.'],example:'Calculate how far every cell in a building is from the nearest exit, assuming each move has equal cost.',applications:['Nearest hospital or facility in an unweighted network','Fire spread and infection simulations','Distance to the nearest special node','Grid problems with multiple starting points'],pitfalls:['All sources must be inserted before the search begins.','This is not a weighted multi-source shortest-path algorithm; use a suitable Dijkstra variant for nonnegative weights.'],code:`queue<int> q;
vector<int> dist(n, INT_MAX);
for (int s : sources) dist[s] = 0, q.push(s);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) if (dist[v] == INT_MAX) {
        dist[v] = dist[u] + 1;
        q.push(v);
    }
}`},
  {id:'grid-bfs',name:'BFS on grids',group:'traversal',level:'Beginner',tag:'Grid traversal',complexity:'O(R × C)',summary:'Treat each traversable cell as a vertex and legal moves as edges.',idea:'A rectangular grid is an implicit graph. Instead of building adjacency lists, generate neighbors by applying direction offsets such as up, down, left, and right.',how:['Represent a cell by (row, column).','Use a visited or distance matrix.','For each cell, generate the allowed neighboring coordinates.','Check bounds and obstacles before visiting a neighbor.'],example:'Find the minimum number of moves for a character to escape a maze.',applications:['Maze solving','Board-game movement','Image region traversal','Flood-fill and distance maps'],pitfalls:['Clarify whether diagonal moves are allowed.','Do not confuse row/column with x/y.','For 0/1 terrain costs, switch to 0-1 BFS rather than ordinary BFS.'],code:`int dr[] = {-1, 1, 0, 0};
int dc[] = {0, 0, -1, 1};
queue<pair<int,int>> q;
dist[sr][sc] = 0; q.push({sr,sc});
while (!q.empty()) {
    auto [r,c] = q.front(); q.pop();
    for (int k=0;k<4;++k) {
        int nr=r+dr[k], nc=c+dc[k];
        if (nr<0 || nr>=R || nc<0 || nc>=C) continue;
        if (grid[nr][nc]=='#' || dist[nr][nc]!=-1) continue;
        dist[nr][nc]=dist[r][c]+1;
        q.push({nr,nc});
    }
}`},
  {id:'connected-components',name:'Connected components',group:'connectivity',level:'Beginner',tag:'Connectivity',complexity:'O(V + E)',summary:'Partition an undirected graph into maximal mutually reachable groups.',idea:'In an undirected graph, two vertices are in the same connected component when a path exists between them. One DFS or BFS from an unvisited vertex discovers an entire component.',how:['Initialize every vertex as unassigned.','Scan vertices from 0 to V−1.','When an unassigned vertex appears, start DFS/BFS and label all reached vertices with a new component ID.','Count or process each component as needed.'],example:'Separate a social network into groups where members are connected through chains of friendships.',applications:['Cluster detection','Network reliability','Counting islands','Grouping equivalent states'],pitfalls:['In a directed graph, ordinary connected components are not the same as strongly connected components.','An isolated vertex is a component of size one.'],code:`int components = 0;
vector<int> comp(n, -1);
for (int s=0; s<n; ++s) if (comp[s]==-1) {
    queue<int> q; q.push(s); comp[s]=components;
    while (!q.empty()) {
        int u=q.front(); q.pop();
        for (int v:adj[u]) if(comp[v]==-1)
            comp[v]=components, q.push(v);
    }
    ++components;
}`},
  {id:'cycle-detection',name:'Cycle detection',group:'connectivity',level:'Intermediate',tag:'Structure',complexity:'O(V + E)',summary:'Determine whether a graph contains a closed path.',idea:'The exact test depends on graph type. In an undirected graph, a visited neighbor other than the incoming edge indicates a cycle. In a directed graph, DFS colors distinguish active recursion-stack vertices from fully processed vertices.',how:['Choose the correct directed or undirected invariant.','For directed DFS use WHITE (unseen), GRAY (active), BLACK (finished).','An edge to GRAY is a back edge and proves a directed cycle.','For undirected graphs, use parent edge IDs to handle multigraphs.'],example:'Detect circular prerequisites in a course registration system.',applications:['Build-system dependency validation','Deadlock detection models','Course prerequisite validation','Circuit and route analysis'],pitfalls:['A self-loop is a cycle.','A pair of parallel undirected edges forms a length-two cycle in a multigraph.','A DAG is exactly a directed graph with no directed cycles.'],code:`// Directed graph: 0 = unseen, 1 = active, 2 = finished
bool hasCycle = false;
vector<int> state(n, 0);
function<void(int)> dfs = [&](int u) {
    state[u] = 1;
    for (int v : adj[u]) {
        if (state[v] == 1) hasCycle = true;
        else if (state[v] == 0) dfs(v);
    }
    state[u] = 2;
};
for (int i=0;i<n;++i) if (!state[i]) dfs(i);`},
  {id:'bridges',name:'Bridges (cut edges)',group:'connectivity',level:'Advanced',tag:'Low-link',complexity:'O(V + E)',summary:'Find edges whose removal increases the number of connected components.',idea:'During DFS, tin[u] is the discovery time and low[u] is the earliest discovery time reachable from u’s DFS subtree using tree edges plus at most one back edge. A DFS tree edge u—v is a bridge when low[v] > tin[u].',how:['Run DFS and assign discovery time tin[u].','Initialize low[u] = tin[u].','For a DFS child v, update low[u] with low[v] after returning.','For a back edge to an ancestor, update low[u] with tin[ancestor].','If low[v] > tin[u], the edge u—v is a bridge.'],example:'Identify single links in a communication network whose failure would split the network.',applications:['Network vulnerability analysis','Road-cut detection','Reliability engineering','Finding 2-edge-connected components'],pitfalls:['Use edge IDs to distinguish the DFS parent edge from a parallel edge.','The comparison is strictly greater-than: low[child] > tin[parent].','Handle every connected component, not just vertex zero.'],code:bridgeCode,source:'CP-Algorithms: Finding Bridges'},
  {id:'articulation',name:'Articulation points',group:'connectivity',level:'Advanced',tag:'Low-link',complexity:'O(V + E)',summary:'Find vertices whose removal disconnects an undirected graph.',idea:'For a non-root DFS vertex u, u is an articulation point if some child v cannot reach an ancestor of u without using u: low[v] ≥ tin[u]. The DFS root is special: it is a cut vertex only if it has at least two DFS-tree children.',how:['Compute tin and low exactly as in bridge finding.','For each tree child v of u, update low[u].','For non-root u, flag it when low[v] ≥ tin[u].','For a DFS root, count DFS children and flag it when the count is at least two.'],example:'Find critical routers or intersections whose failure separates parts of a network.',applications:['Infrastructure resilience','Single points of failure','Social network influence structure','Biconnected decomposition'],pitfalls:['Use ≥ rather than > for articulation points.','The root rule is different from the non-root rule.','Disconnected graphs require a fresh DFS root for each component.'],code:`vector<int> tin(n,-1), low(n), cut;
int timer=0;
function<void(int,int)> dfs = [&](int u,int p) {
    tin[u]=low[u]=timer++;
    int children=0; bool isCut=false;
    for(int v:adj[u]) {
        if(v==p) continue;
        if(tin[v]!=-1) low[u]=min(low[u],tin[v]);
        else {
            dfs(v,u); low[u]=min(low[u],low[v]);
            if(p!=-1 && low[v]>=tin[u]) isCut=true;
            ++children;
        }
    }
    if(p==-1 && children>1) isCut=true;
    if(isCut) cut.push_back(u);
};
for(int i=0;i<n;++i) if(tin[i]==-1) dfs(i,-1);`},
  {id:'scc',name:'Strongly connected components (Kosaraju)',group:'connectivity',level:'Advanced',tag:'SCC',complexity:'O(V + E)',summary:'Partition a directed graph into maximal mutually reachable groups.',idea:'Kosaraju uses two DFS passes. First, record vertices by finishing time in the original graph. Then process vertices in reverse finishing order in the transposed graph; each DFS discovers exactly one SCC.',how:['DFS the original graph and push each vertex after exploring all outgoing edges.','Reverse every edge to build the transpose graph.','Pop vertices in decreasing finishing time.','For each unassigned vertex, DFS the transpose and assign one component ID.'],example:'Collapse groups of mutually dependent web pages or modules into a component-level dependency graph.',applications:['2-SAT','Dependency condensation','Reachability analysis','Compiler call-graph analysis'],pitfalls:['The second pass must use the transposed graph.','Use reverse finishing order—not discovery order.','The condensation graph of SCCs is always a DAG.'],code:kosarajuCode,source:'USACO Guide: Strongly Connected Components'},
  {id:'tarjan-scc',name:'Tarjan SCC algorithm',group:'connectivity',level:'Advanced',tag:'SCC',complexity:'O(V + E)',summary:'Find strongly connected components in one DFS pass using low-link values and a stack.',idea:'Tarjan maintains discovery indices, low-link values, and a stack of active vertices. When low[u] equals index[u], u is the root of an SCC; pop the stack through u to extract that component.',how:['Assign index[u] = low[u] when first visiting u.','Push u onto the active stack.','Explore tree edges and edges to vertices still on the stack.','When low[u] == index[u], pop one complete SCC.'],example:'Identify mutually reachable states in a directed state-transition system without explicitly constructing the reversed graph.',applications:['2-SAT implementations','Compiler dependency analysis','Condensation DAG construction','Directed network structure'],pitfalls:['An edge to an already completed SCC must not lower low[u].','Being visited is not the same as being on the active stack.','The low-link update for a child and an active back edge is subtly different.'],code:`vector<int> disc(n,-1), low(n), st, comp(n,-1);
vector<char> onStack(n,false); int timer=0, components=0;
function<void(int)> dfs = [&](int u) {
    disc[u]=low[u]=timer++; st.push_back(u); onStack[u]=true;
    for(int v:adj[u]) {
        if(disc[v]==-1) dfs(v), low[u]=min(low[u],low[v]);
        else if(onStack[v]) low[u]=min(low[u],disc[v]);
    }
    if(low[u]==disc[u]) {
        while(true) { int v=st.back(); st.pop_back(); onStack[v]=false;
            comp[v]=components; if(v==u) break; }
        ++components;
    }
};
for(int i=0;i<n;++i) if(disc[i]==-1) dfs(i);`},
  {id:'dijkstra',name:'Dijkstra shortest paths',group:'shortest',level:'Intermediate',tag:'Shortest path',complexity:'O((V + E) log V) with a binary heap',summary:'Find shortest distances from one source when all edge weights are non-negative.',idea:'Dijkstra repeatedly finalizes the currently closest unprocessed vertex. A min-priority queue selects the smallest tentative distance; relaxation improves neighbors. Non-negative weights make the greedy choice safe.',how:['Set dist[source] = 0 and all other distances to infinity.','Push (0, source) into a min-priority queue.','Pop the smallest distance; skip stale entries.','Relax every outgoing edge and push improved distances.','When the queue empties, finite values are shortest distances.'],example:'Find the fastest route from one city to every other city when road travel times are non-negative.',applications:['GPS route planning','Network latency','Game maps','Shortest paths in non-negative cost networks'],pitfalls:['Dijkstra is not correct with negative-weight edges.','Use long long for large path sums.','The priority queue may contain stale entries; compare popped distance with dist[u].','To reconstruct a path, store parent[v] whenever dist[v] improves.'],code:dijkstraCode,source:'CP-Algorithms: Dijkstra'},
  {id:'bellman-ford',name:'Bellman–Ford',group:'shortest',level:'Intermediate',tag:'Shortest path',complexity:'O(V × E)',summary:'Find single-source shortest paths even with negative edge weights, and detect reachable negative cycles.',idea:'A shortest simple path has at most V−1 edges. Repeating relaxation across all edges V−1 times is therefore sufficient. If a reachable edge can still be relaxed on the next pass, a reachable negative cycle exists.',how:['Initialize source distance to zero and all others to infinity.','Repeat V−1 times: relax every edge u → v if u is reachable.','Stop early if an entire pass makes no change.','Run one extra pass; any further relaxation means a reachable negative cycle.'],example:'Detect arbitrage-like cycles in currency exchange when edge weights encode logarithmic exchange rates.',applications:['Negative-cost routing models','Currency arbitrage detection','Difference constraints','Validation of weighted dependency systems'],pitfalls:['Only relax from a reachable vertex; never add to INF.','A negative cycle matters for source-to-vertex distances only if reachable from the source.','Use edge list for a clean implementation.'],code:bellmanCode,source:'CP-Algorithms: Bellman–Ford'},
  {id:'floyd-warshall',name:'Floyd–Warshall',group:'shortest',level:'Intermediate',tag:'All-pairs shortest path',complexity:'O(V³) time · O(V²) space',summary:'Compute shortest distances between every pair of vertices.',idea:'Dynamic programming over allowed intermediate vertices. At phase k, decide whether the path i → j becomes shorter by routing through k: d[i][j] = min(d[i][j], d[i][k] + d[k][j]).',how:['Initialize diagonal entries to zero.','Load the minimum direct-edge weight for every pair.','Loop over intermediate vertex k on the outside.','For every pair (i, j), relax through k.','A negative diagonal after completion indicates a negative cycle.'],example:'Precompute the cheapest route between every pair of rooms or stations in a small network.',applications:['Small all-pairs routing tables','Transitive closure variants','Finding paths in dense small graphs','Detecting negative cycles'],pitfalls:['Keep k as the outer loop for the standard DP invariant.','Guard infinity before addition.','O(V³) becomes impractical for large V.'],code:floydCode,source:'CP-Algorithms: Floyd–Warshall'},
  {id:'zero-one-bfs',name:'0–1 BFS',group:'shortest',level:'Intermediate',tag:'Shortest path',complexity:'O(V + E)',summary:'Solve shortest paths when every edge weight is either zero or one.',idea:'A deque replaces the priority queue. A relaxation through a zero-cost edge goes to the front; a relaxation through a one-cost edge goes to the back. This preserves the distance order needed for correctness.',how:['Initialize source distance to zero and push it to the deque front.','Pop the front vertex.','Relax each outgoing edge.','Push improved zero-weight neighbors to the front and one-weight neighbors to the back.'],example:'Find the fewest expensive actions when some transitions are free and others cost one.',applications:['Minimum wall breaks in a grid','State transitions with free/paid moves','Binary-weighted shortest paths'],pitfalls:['All edge weights must be exactly 0 or 1.','For arbitrary non-negative weights use Dijkstra.','The deque ordering is the key invariant.'],code:zeroOneCode,source:'CP-Algorithms: 0–1 BFS'},
  {id:'dag-shortest',name:'Shortest paths in a DAG',group:'shortest',level:'Intermediate',tag:'Shortest path',complexity:'O(V + E)',summary:'Solve shortest paths in a directed acyclic graph by processing vertices topologically.',idea:'A DAG has no cycles, so a topological ordering places every edge forward. Relax each outgoing edge once in this order. Negative edge weights are allowed because no cycle can repeatedly reduce a path.',how:['Compute a topological ordering.','Initialize the source distance to zero.','Visit vertices in topological order.','Relax outgoing edges from every reachable vertex.'],example:'Calculate the minimum project completion cost when tasks have precedence constraints and task transitions carry costs.',applications:['Project planning','Pipeline optimization','Longest path in a DAG','Dynamic programming on dependencies'],pitfalls:['The graph must be acyclic.','Topological order is not necessarily unique.','For longest paths, replace min with max and initialize unreachable states carefully.'],code:`vector<int> order = topologicalSort(n, adj);
vector<long long> dist(n, INF);
dist[source] = 0;
for (int u : order) {
    if (dist[u] == INF) continue;
    for (auto [v,w] : weightedAdj[u])
        dist[v] = min(dist[v], dist[u] + w);
}`},
  {id:'johnson',name:'Johnson’s all-pairs algorithm',group:'shortest',level:'Advanced',tag:'All-pairs shortest path',complexity:'Typically O(VE log V) with binary heaps',summary:'Compute all-pairs shortest paths on sparse graphs that may have negative edges but no negative cycles.',idea:'Add a super-source and run Bellman–Ford to compute vertex potentials h[v]. Reweight each edge to w′(u,v)=w(u,v)+h[u]−h[v], which is non-negative. Run Dijkstra from every vertex, then convert distances back.',how:['Add a new source with zero-weight edges to every vertex.','Run Bellman–Ford to obtain potentials and detect negative cycles.','Reweight all edges; shortest path ordering is preserved.','Run Dijkstra from each source.','Undo the reweighting in the resulting distance matrix.'],example:'Analyzing a sparse transportation or communication graph where some modeled transitions have negative adjustments but no negative cycle.',applications:['Sparse all-pairs shortest paths','Routing analysis','Weighted dependency analysis'],pitfalls:['A negative cycle makes finite all-pairs shortest paths undefined.','Reweighting must be undone before returning answers.','For dense small graphs, Floyd–Warshall is often simpler.'],code:`// After Bellman-Ford gives h[v], reweight each edge:
// w2(u,v) = w(u,v) + h[u] - h[v];  // guaranteed non-negative
// Run Dijkstra from every source using w2.
// Convert: originalDist[s][v] = reweightedDist[s][v] - h[s] + h[v].
// If Bellman-Ford detects a negative cycle, Johnson cannot be used.`},
  {id:'astar',name:'A* search',group:'shortest',level:'Advanced',tag:'Heuristic search',complexity:'Depends on heuristic and graph; worst-case exponential in search depth',summary:'Guide shortest-path search toward a target using a heuristic estimate.',idea:'A* prioritizes nodes by f(v)=g(v)+h(v), where g is the known cost from the source and h estimates the remaining cost to the goal. An admissible heuristic never overestimates the true remaining cost; consistency gives especially clean behavior.',how:['Set g[source]=0 and push the source with f=h(source).','Pop the smallest f-score.','For each neighbor, relax g and update its parent.','Push the neighbor with priority g+h.','Stop when the goal is safely selected under the heuristic assumptions.'],example:'A navigation system searches toward a destination using straight-line distance as a lower-bound heuristic.',applications:['Robot navigation','Video-game pathfinding','Route planning','Puzzle solving'],pitfalls:['A heuristic that overestimates can lose optimality.','The heuristic must use units compatible with path cost.','A* can still explore many nodes when the heuristic is weak.'],code:`// Priority is f = g + h. Provide an admissible heuristic h(v).
priority_queue<pair<double,int>, vector<pair<double,int>>, greater<>> pq;
vector<double> g(n, 1e100);
g[source]=0; pq.push({heuristic(source),source});
while(!pq.empty()) {
    auto [f,u]=pq.top(); pq.pop();
    if (u==target) break;
    for(auto [v,w]:adj[u]) if(g[u]+w<g[v]) {
        g[v]=g[u]+w;
        pq.push({g[v]+heuristic(v),v});
    }
}`},
  {id:'dsu',name:'Disjoint Set Union (Union–Find)',group:'mst',level:'Beginner',tag:'Data structure',complexity:'Amortized O(α(V)) per operation',summary:'Maintain a partition of elements under component merges.',idea:'Each set is represented by a rooted tree. Find follows parent pointers with path compression; union uses size or rank to keep trees shallow. With both optimizations, operations are effectively constant for practical input sizes.',how:['Initialize each element as its own parent.','Find returns the representative of an element’s component.','Union finds two representatives and joins them if distinct.','Use path compression and union by size/rank.'],example:'Maintain groups of connected computers while links are added over time.',applications:['Kruskal MST','Dynamic connectivity under insertions','Cycle checks in undirected graphs','Offline connectivity problems'],pitfalls:['DSU supports merges, not arbitrary deletions.','A successful union changes the partition; a failed union means both vertices were already connected.','The inverse Ackermann function grows extraordinarily slowly, but it is not literally zero.'],code:dsuCode,source:'CP-Algorithms: Disjoint Set Union'},
  {id:'kruskal',name:'Kruskal minimum spanning tree',group:'mst',level:'Intermediate',tag:'Minimum spanning tree',complexity:'O(E log E)',summary:'Build a minimum spanning tree by taking the cheapest safe edge first.',idea:'Sort edges by weight. Add an edge if its endpoints are currently in different DSU components. This never creates a cycle and the cut property guarantees the result can be extended to an MST.',how:['Sort all edges in nondecreasing weight.','Initialize DSU with V singleton components.','Scan edges in order.','Add an edge and union its endpoints if union succeeds.','Stop after V−1 chosen edges for a connected graph.'],example:'Connect a set of villages with the minimum total length of new roads.',applications:['Network cabling','Road and utility planning','Clustering','Approximation and graph preprocessing'],pitfalls:['MST is defined for connected, undirected, weighted graphs; disconnected input yields a minimum spanning forest.','Negative edge weights are fine.','Do not confuse MST with a shortest-path tree.'],code:kruskalCode,source:'CP-Algorithms: Minimum Spanning Tree'},
  {id:'prim',name:'Prim minimum spanning tree',group:'mst',level:'Intermediate',tag:'Minimum spanning tree',complexity:'O(E log V) with adjacency list + heap',summary:'Grow an MST from a start vertex by repeatedly adding the cheapest outgoing edge.',idea:'Maintain a cut between vertices already in the tree and vertices outside it. The minimum-weight edge crossing that cut is safe to add by the cut property.',how:['Start from any vertex and mark it inside the tree.','Insert its incident edges into a min-priority queue.','Take the cheapest edge whose destination is not yet included.','Add that vertex and its outgoing edges.','Continue until all vertices are included.'],example:'Expand a fiber-optic network from an existing hub while minimizing total cable length.',applications:['Infrastructure design','Clustering and similarity networks','Power and telecom network layout'],pitfalls:['The graph must be undirected.','Skip heap entries whose destination is already included.','For disconnected graphs, restart from each unvisited vertex to produce a forest.'],code:primCode,source:'CP-Algorithms: Minimum Spanning Tree'},
  {id:'boruvka',name:'Borůvka minimum spanning tree',group:'mst',level:'Advanced',tag:'Minimum spanning tree',complexity:'O(E log V)',summary:'Repeatedly let every component choose its cheapest outgoing edge.',idea:'Initially each vertex is a component. In each phase, every current component selects its minimum outgoing edge; all selected safe edges are merged. The number of components at least halves in each successful phase.',how:['Begin with one component per vertex.','For each component, find its cheapest edge leading outside.','Add all such edges through DSU.','Repeat until one component remains or no edge can merge components.'],example:'Parallel-friendly network design where many local clusters independently choose their cheapest external connection.',applications:['MST construction','Parallel and distributed graph algorithms','Clustering'],pitfalls:['Multiple components may choose the same edge; DSU prevents duplicate merges.','Disconnected graphs produce a forest.','Implementation must map DSU representatives to their best outgoing edge.'],code:`// Each phase: best[find(u)] stores the lightest edge leaving u's component.
// Scan all edges to update the best edge for both endpoint components.
// Then scan best[] and union endpoints of each candidate edge.
// Repeat while at least one union succeeds.`},
  {id:'topological',name:'Topological sorting (Kahn)',group:'directed',level:'Intermediate',tag:'DAG',complexity:'O(V + E)',summary:'Order vertices so every directed edge points from earlier to later.',idea:'A DAG always has at least one vertex with indegree zero. Repeatedly remove one such vertex and decrement its neighbors’ indegrees. If fewer than V vertices are removed, a cycle exists.',how:['Compute indegrees.','Place all zero-indegree vertices into a queue.','Remove one, append it to the order, and decrement outgoing neighbors.','Enqueue any neighbor whose indegree becomes zero.','Check whether the result contains all vertices.'],example:'Schedule courses so every prerequisite is completed before the course that depends on it.',applications:['Build systems','Course scheduling','Task dependency resolution','DAG dynamic programming'],pitfalls:['A topological order exists only for a DAG.','There may be multiple valid orders.','A queue gives one valid order; a min-heap can produce the lexicographically smallest order.'],code:topoCode,source:'CP-Algorithms: Topological Sorting'},
  {id:'bipartite',name:'Bipartite graph checking',group:'special',level:'Intermediate',tag:'Coloring',complexity:'O(V + E)',summary:'Test whether vertices can be split into two sets with every edge crossing between them.',idea:'A graph is bipartite exactly when it has no odd-length cycle. BFS or DFS two-colors each component, assigning every neighbor the opposite color; a same-color edge is a contradiction.',how:['Start each uncolored component with color zero.','For each edge, assign the opposite color to an uncolored neighbor.','If an edge joins equal colors, report non-bipartite.','Continue across every component.'],example:'Assign applicants to two teams when every conflict must be separated across teams.',applications:['Matching and assignment problems','Scheduling conflicts','Checking odd cycles','Modeling two-sided relationships'],pitfalls:['A graph with a self-loop is not bipartite.','Disconnected components must each be colored.','The two partitions can be swapped without changing validity.'],code:bipartiteCode,source:'VisuAlgo: Graph Traversal'},
  {id:'matching',name:'Bipartite matching (augmenting paths)',group:'special',level:'Advanced',tag:'Matching',complexity:'O(VE) for basic Kuhn DFS',summary:'Choose as many disjoint left-right pairs as possible.',idea:'A matching is a set of edges with no shared endpoints. An augmenting path alternates between unmatched and matched edges; flipping matched status along it increases matching size by one. Repeated DFS searches yield a maximum matching.',how:['Separate vertices into left and right partitions.','For each left vertex, search for a free right neighbor.','If a right neighbor is matched, recursively try to rematch its current partner.','Flip the path when a free right vertex is found.'],example:'Assign students to projects where each student and each project can appear in at most one assignment.',applications:['Job assignment','Course allocation','Pairing systems','Resource allocation'],pitfalls:['The basic Kuhn method is suited to smaller or moderate graphs.','For large bipartite graphs, Hopcroft–Karp improves the asymptotic bound to O(E√V).','The graph must truly be bipartite for this formulation.'],code:`vector<int> matchR(m, -1);
function<bool(int, vector<char>&)> aug = [&](int u, vector<char>& seen) {
    for (int v : adjLeft[u]) if (!seen[v]) {
        seen[v] = true;
        if (matchR[v] == -1 || aug(matchR[v], seen)) {
            matchR[v] = u; return true;
        }
    }
    return false;
};
int matching = 0;
for (int u=0; u<n; ++u) {
    vector<char> seen(m, false);
    if (aug(u, seen)) ++matching;
}`},
  {id:'eulerian',name:'Eulerian path and circuit',group:'special',level:'Intermediate',tag:'Edge traversal',complexity:'O(V + E)',summary:'Find a walk that uses every edge exactly once.',idea:'An Eulerian circuit starts and ends at the same vertex; an Eulerian trail may have different endpoints. Hierholzer’s algorithm follows unused edges and splices cycles until all edges are consumed.',how:['Check the degree conditions for the graph type.','For an undirected graph, an Euler circuit requires all non-isolated vertices to have even degree; an open trail requires exactly two odd-degree vertices.','Start at an appropriate vertex and follow unused edges with a stack.','Append vertices when no unused edge remains; reverse the resulting circuit.'],example:'Plan a street-sweeping route that traverses every required street segment exactly once.',applications:['Route inspection','Postal delivery models','DNA assembly fragments','Network testing'],pitfalls:['Connectivity among non-isolated vertices also matters.','Eulerian is about using every edge; Hamiltonian is about visiting every vertex.','Track edge IDs when multigraphs are allowed.'],code:`vector<int> eulerTrail(int n, vector<vector<pair<int,int>>>& adj, int start) {
    vector<char> used(edgeCount, false);
    vector<int> it(n,0), st{start}, path;
    while(!st.empty()) {
        int u=st.back();
        while(it[u]<(int)adj[u].size() && used[adj[u][it[u]].second]) ++it[u];
        if(it[u]==(int)adj[u].size()) { path.push_back(u); st.pop_back(); }
        else { auto [v,id]=adj[u][it[u]++]; if(!used[id]) used[id]=true, st.push_back(v); }
    }
    reverse(path.begin(),path.end()); return path;
}`},
  {id:'hamiltonian',name:'Hamiltonian paths and cycles',group:'special',level:'Advanced',tag:'Combinatorial search',complexity:'NP-complete decision problem in general',summary:'Visit every vertex exactly once (and optionally return to the start).',idea:'Unlike Eulerian problems, Hamiltonian problems constrain vertices rather than edges. General instances are computationally hard; small graphs can be solved by backtracking or subset dynamic programming.',how:['Fix a start vertex or endpoint condition.','Extend a partial path to an unvisited adjacent vertex.','Backtrack when no extension can complete the path.','For small n, use bitmask DP: dp[mask][v] records whether a path visits mask and ends at v.'],example:'Plan a single trip that visits each required city exactly once before returning to the starting city.',applications:['Traveling Salesperson Problem','Circuit design','Scheduling with pairwise transitions'],pitfalls:['Do not confuse with Eulerian path.','There is no known polynomial-time algorithm for general Hamiltonian path existence.','Bitmask DP is typically limited to small n.'],code:`// Subset DP outline (n should be small, often <= 20).
// dp[mask][v] = minimum cost of a path visiting exactly mask and ending at v.
// Initialize dp[1<<s][s] = 0.
// Transition from u in mask to v not in mask:
// dp[mask | (1<<v)][v] = min(dp[...][v], dp[mask][u] + w[u][v]);`},
  {id:'lca',name:'Lowest common ancestor (binary lifting)',group:'trees',level:'Advanced',tag:'Tree queries',complexity:'O(N log N) preprocessing · O(log N) per query',summary:'Find the deepest shared ancestor of two vertices in a rooted tree.',idea:'Precompute up[k][v], the 2^k-th ancestor of v. Lift the deeper vertex until depths match, then lift both vertices from large powers down until their parents coincide.',how:['Root the tree and compute depth and immediate parent.','Build the binary-lifting table.','For a query, lift the deeper node to equal depth.','If nodes differ, lift both by powers of two while their ancestors differ.','Their immediate parent is the LCA.'],example:'Find the lowest shared manager in an organizational hierarchy.',applications:['Tree distance queries','Path queries','Virtual trees','Ancestor and genealogy queries'],pitfalls:['The structure must be a tree or a rooted forest with suitable component handling.','Root parent conventions must be consistent.','For weighted distance, store root distances as well as depth.'],code:lcaCode,source:'William Fiset: Graph Theory / Tree Algorithms'},
  {id:'tree-diameter',name:'Tree diameter and center',group:'trees',level:'Intermediate',tag:'Tree structure',complexity:'O(V)',summary:'Find the longest shortest path in a tree and its midpoint vertex or edge.',idea:'In an unweighted tree, choose any vertex s and find a farthest vertex a. A second traversal from a finds a farthest vertex b; the path a—b is a diameter. The center is the middle vertex or middle edge of a diameter.',how:['Traverse from any vertex to find a farthest vertex a.','Traverse from a to find farthest vertex b and parent pointers.','Reconstruct the path a to b.','Take its middle vertex or middle edge as the center.'],example:'Find the minimum possible maximum distance from a new central server to all nodes in a tree-shaped network.',applications:['Tree facility location','Network center placement','Tree DP problems','Shape analysis'],pitfalls:['The two-traversal method is for trees, not arbitrary graphs.','For weighted trees, use tree traversal accumulating weights; weights should be nonnegative for the farthest-point argument.','A tree can have one center vertex or two adjacent centers.'],code:`// Run BFS/DFS from any node s, recording dist and parent.
// Let a be a farthest node from s.
// Run again from a; let b be farthest from a.
// Follow parent[b] repeatedly to reconstruct the diameter path.`},
  {id:'tree-dp',name:'Tree dynamic programming',group:'trees',level:'Advanced',tag:'Tree DP',complexity:'Usually O(V) or O(V × state count)',summary:'Solve a tree problem by combining information from child subtrees.',idea:'Root the tree. Define a state for each vertex that summarizes the subtree below it. A postorder DFS ensures child states are ready before computing the parent state.',how:['Choose a root.','Define precisely what dp[u] means.','Derive how children contribute to dp[u].','Use postorder traversal to compute states bottom-up.','Add rerooting or multiple states if the answer depends on the chosen root or parent.'],example:'Find the maximum-weight set of employees in a hierarchy where directly connected manager-report pairs cannot both be selected.',applications:['Maximum independent set on trees','Tree matching','Subtree aggregation','Rerooting distance sums'],pitfalls:['State definitions must include whether the parent edge or parent state is constrained.','A tree has no cross edges between sibling subtrees.','Rerooting DP often needs prefix/suffix aggregates to exclude one child efficiently.'],code:`// Example: maximum-weight independent set on a tree.
// take[u] = best value if u is selected; skip[u] = best if u is not.
function<void(int,int)> dfs = [&](int u,int p) {
    take[u] = weight[u]; skip[u] = 0;
    for(int v:adj[u]) if(v!=p) {
        dfs(v,u);
        take[u] += skip[v];
        skip[u] += max(take[v], skip[v]);
    }
};`},
  {id:'dinic',name:'Dinic maximum flow',group:'flow',level:'Advanced',tag:'Network flow',complexity:'O(V²E) general; faster bounds for special networks',summary:'Compute maximum flow using level graphs and blocking flows.',idea:'Residual edges encode how much additional flow can be sent or cancelled. BFS builds levels from the source; DFS sends flow only along edges that advance one level. A blocking flow saturates at least one edge on every source-to-sink path in the level graph.',how:['Create forward edges with capacity and reverse edges with zero capacity.','Run BFS in the residual graph to build levels.','Use DFS with current-edge pointers to send blocking flow.','Repeat DFS until no more flow can be sent in the level graph.','Repeat BFS until the sink is unreachable.'],example:'Determine the maximum volume of data that can move through a network with bandwidth limits.',applications:['Bandwidth allocation','Bipartite matching reductions','Transportation and logistics','Project selection and closure problems'],pitfalls:['Residual reverse edges are essential.','Do not confuse capacity with current flow.','The complexity depends on graph structure; special cases have stronger bounds.'],code:dinicCode,source:'William Fiset: Network Flow'},
  {id:'ford-fulkerson',name:'Ford–Fulkerson method',group:'flow',level:'Advanced',tag:'Network flow',complexity:'O(E × maximum flow value) with integer capacities and DFS paths',summary:'Increase flow along residual source-to-sink paths until none remain.',idea:'The residual graph records unused forward capacity and the ability to undo previous flow through reverse edges. Each augmenting path increases total flow by its bottleneck capacity.',how:['Initialize all flows to zero.','Find a residual path from source to sink.','Compute the minimum residual capacity along that path.','Augment by the bottleneck and update reverse residual edges.','Stop when no augmenting path exists.'],example:'Route water from reservoirs to a city through pipes with fixed capacities.',applications:['Transportation networks','Matching','Production capacity planning','Network design'],pitfalls:['With irrational capacities, basic Ford–Fulkerson path choices may fail to terminate.','Edmonds–Karp chooses shortest augmenting paths and has a polynomial bound.','Use a residual graph, not only the original capacities.'],code:`// Residual capacity of u -> v is cap[u][v] - flow[u][v].
// Find an s-t path using DFS/BFS, take bottleneck f,
// add f to forward flow and subtract f from reverse flow.
// Repeat until no residual s-t path exists.`},
  {id:'edmonds-karp',name:'Edmonds–Karp',group:'flow',level:'Advanced',tag:'Maximum flow',complexity:'O(V × E²)',summary:'A Ford–Fulkerson implementation that uses BFS for each augmenting path.',idea:'Always augment along a shortest path in number of residual edges. This limits how often each edge can become critical and gives an O(VE²) worst-case bound.',how:['Build the residual graph.','Use BFS to find a shortest residual path.','Find its bottleneck and augment flow.','Repeat until BFS cannot reach the sink.'],example:'Compute a maximum matching by reducing assignment to a flow network.',applications:['Maximum bipartite matching','Capacity planning','Teaching residual networks'],pitfalls:['The asymptotic bound is O(VE²), not O(E²) alone.','For larger networks, Dinic or push–relabel may be more appropriate.'],code:`// Use BFS over residual edges with capacity > 0.
// Store parent[v] to reconstruct the path.
// Augment by min residual capacity on the path; update reverse edges.
// Repeat BFS until sink has no parent.`},
  {id:'min-cut',name:'Minimum cut and max-flow min-cut theorem',group:'flow',level:'Advanced',tag:'Cut',complexity:'One max-flow computation plus O(V + E) reachability',summary:'Find the cheapest capacity boundary separating source from sink.',idea:'An s–t cut partitions vertices into S and T with s in S and t in T. Its capacity is the sum of capacities on edges from S to T. The maximum flow value equals the minimum cut capacity.',how:['Compute a maximum flow.','In the final residual graph, BFS from source using positive residual capacity.','Let S be the reachable vertices and T the rest.','Original edges from S to T form a minimum cut.'],example:'Identify the smallest total bandwidth whose failure disconnects a data center from the outside world.',applications:['Network bottleneck analysis','Reliability and vulnerability','Image segmentation','Project selection'],pitfalls:['Count original capacities on S→T edges, not residual values.','The min-cut partition may not be unique.','Directed cuts count only edges leaving S.'],code:`// After max flow, traverse residual graph from s using cap > 0.
// reachable[v] = true for vertices in S.
// Every original edge u -> v with reachable[u] && !reachable[v]
// belongs to a minimum s-t cut.`},
  {id:'two-sat',name:'2-SAT (implication graph)',group:'advanced',level:'Advanced',tag:'Boolean satisfiability',complexity:'O(V + E) in the implication graph',summary:'Determine satisfiability of a Boolean formula whose clauses contain two literals.',idea:'A clause (a OR b) is equivalent to implications (NOT a → b) and (NOT b → a). Build an implication graph and compute SCCs. A variable x makes the formula impossible if x and NOT x belong to the same SCC.',how:['Create a node for each literal and its negation.','For every clause (a OR b), add the two implication edges.','Compute SCC IDs.','If any variable and its negation share an SCC, report unsatisfiable.','Otherwise derive an assignment from the SCC topological order.'],example:'Check whether a set of binary choices with pairwise constraints can all be satisfied.',applications:['Scheduling with yes/no choices','Circuit configuration','Constraint solving','Competitive programming'],pitfalls:['Literal indexing must consistently pair each variable with its negation.','The SCC test proves satisfiability; assignment extraction depends on component order convention.','This solves 2-CNF, not arbitrary SAT.'],code:`// For variable x: node(x) and node(not x) are paired.
// Clause (a OR b): add edge (not a) -> b and (not b) -> a.
// Run SCC. If comp[x] == comp[not x], unsatisfiable.
// Otherwise assign using SCC topological order (check your numbering direction).`},
  {id:'centroid',name:'Centroid decomposition',group:'advanced',level:'Expert',tag:'Tree decomposition',complexity:'O(N log N) decomposition; often O(log N) per update/query layer',summary:'Recursively split a tree at centroids to organize distance and path queries.',idea:'A centroid is a vertex whose removal leaves no component with more than half the tree’s vertices. Recursively decompose each remaining component; the resulting centroid tree has logarithmic height.',how:['Compute subtree sizes in the current component.','Find a centroid whose largest remaining component is at most half.','Mark it removed and record distances or other data.','Recursively decompose each component left after removing the centroid.'],example:'Support queries for the nearest active facility in a tree-shaped network.',applications:['Dynamic nearest marked node','Distance counting on trees','Path pair counting','Tree query optimization'],pitfalls:['The centroid tree is not the original tree.','A vertex can be an ancestor of another in the centroid tree without being on their original path.','Distance bookkeeping is problem-specific.'],code:`// Decomposition outline:
// 1) compute subtree sizes ignoring removed vertices
// 2) find centroid c of current component
// 3) mark removed[c] = true; centroidParent[c] = parentCentroid
// 4) recurse on each remaining neighbor component`},
  {id:'hld',name:'Heavy-light decomposition',group:'advanced',level:'Expert',tag:'Tree queries',complexity:'O(log² N) path query with segment tree; O(log N) chains',summary:'Break tree paths into a logarithmic number of heavy chains.',idea:'Choose each vertex’s largest-subtree child as heavy. Heavy edges form disjoint chains. Any root-to-vertex path crosses only O(log N) light edges, so a path query becomes a logarithmic number of array-range queries.',how:['Root the tree and compute subtree sizes and heavy child.','Assign chain heads and positions with a decomposition DFS.','Store vertex or edge values in base-array order.','Split a path into heavy-chain segments and query each segment.'],example:'Query the maximum risk level along a path between two nodes in a hierarchy.',applications:['Path sum/min/max queries','Dynamic tree values','Competitive programming path problems'],pitfalls:['Be explicit whether values live on vertices or edges.','The segment-tree interval for the LCA may need exclusion in edge queries.','Lazy propagation may be needed for range updates.'],code:`// Compute parent, depth, subtree size, and heavy child first.
// Decompose each heavy chain contiguously in an array.
// While heads differ, process the deeper head-to-node interval,
// then jump to parent[head]. Finally process the same-chain interval.`},
  {id:'tsp',name:'Traveling Salesperson Problem (bitmask DP)',group:'advanced',level:'Advanced',tag:'Optimization',complexity:'O(N² · 2^N) time · O(N · 2^N) space',summary:'Find a minimum-cost tour visiting every city exactly once and returning to the start.',idea:'Use subset DP. dp[mask][u] is the minimum cost of a path starting at a fixed city, visiting exactly the vertices in mask, and ending at u. Add one unvisited vertex at a time.',how:['Fix a start vertex s.','Initialize dp[1<<s][s] = 0.','For each mask and last vertex u, try every unvisited v.','After all vertices are included, add the edge back to s.','Store parent choices to reconstruct the optimal tour.'],example:'Plan a delivery loop that visits a small set of locations exactly once and returns to the depot.',applications:['Small routing problems','Circuit layout','Production sequencing','Exact optimization benchmarks'],pitfalls:['The state count is exponential; this is only practical for small N.','Missing edges need an infinity convention.','A Hamiltonian cycle may not exist.'],code:`// dp[mask][u] = minimum path cost from start to u using vertices in mask.
// Transition: dp[mask | (1<<v)][v] = min(..., dp[mask][u] + w[u][v]).
// Answer: min_u dp[(1<<n)-1][u] + w[u][start].`},
  {id:'planarity',name:'Planarity and Euler’s formula',group:'advanced',level:'Expert',tag:'Graph theory',complexity:'Planarity testing is linear-time with advanced algorithms',summary:'Study whether a graph can be drawn in the plane without edge crossings.',idea:'For a connected planar embedding, V − E + F = 2, where F counts faces including the outer face. For simple planar graphs with V ≥ 3, E ≤ 3V − 6; for simple bipartite planar graphs, E ≤ 2V − 4.',how:['Understand that planarity is a property of the abstract graph, not one drawing.','Use Euler’s formula for counting and proving impossibility.','Apply Kuratowski’s theorem: a graph is planar iff it contains no subdivision of K5 or K3,3.','Use a planarity-testing algorithm for constructive decisions.'],example:'Check whether a circuit or map layout can be embedded in two dimensions without wires crossing.',applications:['VLSI and circuit layout','Map drawing','Graph embeddings','Topological graph theory'],pitfalls:['Euler’s formula stated here assumes a connected planar embedding.','Inequalities are necessary but not sufficient for planarity.','Parallel edges and loops change some simple-graph bounds.'],code:`// For a connected planar graph embedded in the plane:
// V - E + F = 2
// For a simple planar graph with V >= 3:
// E <= 3*V - 6
// For a simple bipartite planar graph with V >= 3:
// E <= 2*V - 4`}
];

export const resources = [
  {name:'CP-Algorithms — Graphs',type:'Reference & implementations',url:'https://cp-algorithms.com/graph/',description:'Detailed competitive-programming explanations, invariants, proofs, and implementations for core graph algorithms.'},
  {name:'USACO Guide — Graphs',type:'Structured curriculum',url:'https://usaco.guide/adv',description:'A contest-oriented learning path with modules, implementation notes, and curated practice problems.'},
  {name:'VisuAlgo — Graph modules',type:'Interactive visualization',url:'https://visualgo.net/en',description:'Explore graph representations, traversal, MST, shortest paths, max flow, matching, and related animations.'},
  {name:'William Fiset — Algorithms repository',type:'Code and video lessons',url:'https://github.com/williamfiset/algorithms',description:'A broad graph-theory collection including trees, shortest paths, SCCs, spanning trees, and network flow.'},
  {name:'William Fiset — Graph Theory course',type:'Video course',url:'https://www.youtube.com/watch?v=09_LlHjoEiY',description:'Long-form visual introduction to graph representations, traversal, shortest paths, MST, SCCs, and network flow.'},
  {name:'Boost.Graph algorithm overview',type:'Library documentation',url:'https://www.boost.org/latest/libs/graph/doc/html/graph/algorithms/overview.html',description:'A useful taxonomy of production graph algorithms, including shortest paths, spanning trees, components, and flow.'},
  {name:'Competitive Programming 2 — Graph chapter',type:'Book reference',url:'https://usaco.guide/CP2.pdf',description:'A broad chapter covering common graph models and contest algorithms.'}
];
