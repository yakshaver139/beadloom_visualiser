import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { Graph } from "../schema/graph.js";
import type { NodeStatus } from "../schema/graph.js";
import { GraphView } from "./GraphView.js";
import { NodeDrawer } from "./NodeDrawer.js";
import { StatusFilter } from "./StatusFilter.js";
import { fetchGraph } from "./fetchGraph.js";
import type { GraphNode } from "../schema/graph.js";
import "./App.css";

export function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<NodeStatus>>(
    new Set(["pending", "in_progress", "completed", "blocked"]),
  );

  useEffect(() => {
    fetchGraph()
      .then(setGraph)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="app-status">Loading graph…</div>;
  }

  if (error) {
    return <div className="app-status app-error">Error: {error}</div>;
  }

  if (!graph) {
    return <div className="app-status">No graph data available.</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Beadloom Visualiser</h1>
        <StatusFilter active={activeFilters} onChange={setActiveFilters} />
      </header>
      <main className="app-main">
        <ReactFlowProvider>
          <GraphView
            graph={graph}
            activeFilters={activeFilters}
            onNodeSelect={setSelectedNode}
          />
        </ReactFlowProvider>
        {selectedNode && (
          <NodeDrawer
            node={selectedNode}
            isCritical={graph.critical_path.includes(selectedNode.id)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </main>
    </div>
  );
}
