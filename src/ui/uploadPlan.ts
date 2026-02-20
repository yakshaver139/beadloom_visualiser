import { GraphSchema, type Graph } from "../schema/graph.js";

const GRAPH_URL = import.meta.env.VITE_GRAPH_API_URL ?? "/graph";

/**
 * Upload a LoomPlan JSON to the server and return the resulting Graph.
 */
export async function uploadPlan(plan: unknown): Promise<Graph> {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }

  const json = await res.json();
  return GraphSchema.parse(json);
}
