import type { LoomPlan } from "./loom-plan.js";
import type { Graph, GraphEdge, GraphNode } from "./graph.js";

/**
 * Convert a raw LoomPlan into the normalised Graph the UI renders.
 *
 * Node status defaults to "pending" — the API layer can enrich this
 * with live issue status later.
 */
export function toGraph(plan: LoomPlan): Graph {
  const nodes: GraphNode[] = Object.values(plan.tasks).map((t) => ({
    id: t.task_id,
    title: t.title,
    status: "pending" as const,
    is_critical: t.is_critical,
    wave_index: t.wave_index,
    branch_name: t.branch_name,
  }));

  const edges: GraphEdge[] = [];
  for (const [taskId, preds] of Object.entries(plan.deps.predecessors)) {
    if (preds) {
      for (const pred of preds) {
        edges.push({ from: pred, to: taskId });
      }
    }
  }

  return {
    nodes,
    edges,
    critical_path: plan.critical_path,
    metadata: {
      id: plan.id,
      created_at: plan.created_at,
      total_tasks: plan.total_tasks,
      total_waves: plan.total_waves,
    },
  };
}
