import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Graph } from "../schema/graph.js";
import type { GraphNode, NodeStatus } from "../schema/graph.js";
import { TaskNode } from "./TaskNode.js";
import { layoutGraph } from "./layoutGraph.js";

const nodeTypes = { task: TaskNode };

interface Props {
  graph: Graph;
  activeFilters: Set<NodeStatus>;
  onNodeSelect: (node: GraphNode) => void;
}

export function GraphView({ graph, activeFilters, onNodeSelect }: Props) {
  const criticalEdgeSet = useMemo(() => {
    const set = new Set<string>();
    const cp = graph.critical_path;
    for (let i = 0; i < cp.length - 1; i++) {
      set.add(`${cp[i]}->${cp[i + 1]}`);
    }
    return set;
  }, [graph.critical_path]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const positions = layoutGraph(graph);

    const nodes: Node[] = graph.nodes.map((n) => ({
      id: n.id,
      type: "task",
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      data: {
        ...n,
        dimmed: !activeFilters.has(n.status),
      },
    }));

    const edges: Edge[] = graph.edges.map((e) => {
      const isCritical = criticalEdgeSet.has(`${e.from}->${e.to}`);
      return {
        id: `${e.from}->${e.to}`,
        source: e.from,
        target: e.to,
        className: isCritical ? "critical" : "",
        animated: isCritical,
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [graph, activeFilters, criticalEdgeSet]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const graphNode = graph.nodes.find((n) => n.id === node.id);
      if (graphNode) onNodeSelect(graphNode);
    },
    [graph.nodes, onNodeSelect],
  );

  return (
    <div className="graph-view">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as GraphNode & { dimmed?: boolean };
            if (data.dimmed) return "#2d333b";
            if (data.is_critical) return "#f0883e";
            const statusColors: Record<NodeStatus, string> = {
              pending: "#8b949e",
              in_progress: "#58a6ff",
              completed: "#56d364",
              blocked: "#f85149",
            };
            return statusColors[data.status] ?? "#8b949e";
          }}
          style={{ background: "#161822" }}
        />
        <Background variant={BackgroundVariant.Dots} color="#2d3148" gap={20} />
      </ReactFlow>
    </div>
  );
}
