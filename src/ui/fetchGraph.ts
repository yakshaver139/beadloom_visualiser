import { GraphSchema, type Graph } from "../schema/graph.js";
import samplePlan from "../fixtures/sample-loom-plan.json";
import { LoomPlanSchema } from "../schema/loom-plan.js";
import { toGraph } from "../schema/transform.js";

const GRAPH_URL = import.meta.env.VITE_GRAPH_API_URL ?? "/graph";

/**
 * Fetch graph data from the graph API endpoint.
 * Falls back to the sample fixture if the API is unavailable.
 */
export async function fetchGraph(): Promise<Graph> {
  try {
    const res = await fetch(GRAPH_URL);
    if (res.ok) {
      const json = await res.json();
      return GraphSchema.parse(json);
    }
  } catch {
    // API unavailable — fall through to fixture
  }

  // Fallback: use sample fixture transformed to Graph
  const plan = LoomPlanSchema.parse(samplePlan);
  return toGraph(plan);
}
