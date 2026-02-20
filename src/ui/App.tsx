import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { Graph } from "../schema/graph.js";
import type { NodeStatus } from "../schema/graph.js";
import { GraphView } from "./GraphView.js";
import { NodeDrawer } from "./NodeDrawer.js";
import { StatusFilter } from "./StatusFilter.js";
import { fetchGraph } from "./fetchGraph.js";
import { uploadPlan } from "./uploadPlan.js";
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    setUploadError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const plan = JSON.parse(reader.result as string);
        const result = await uploadPlan(plan);
        setGraph(result);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : String(err));
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read file");
      setUploading(false);
    };
    reader.readAsText(file);
  }

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
        <div className="upload-section">
          <StatusFilter active={activeFilters} onChange={setActiveFilters} />
          <label className={`upload-button${uploading ? " uploading" : ""}`}>
            {uploading ? "Uploading…" : "Upload Plan"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {uploadError && <span className="upload-error">{uploadError}</span>}
        </div>
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
