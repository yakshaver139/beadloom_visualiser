import express from "express";
import { LoomPlanSchema } from "../schema/loom-plan.js";
import { GraphSchema, type Graph } from "../schema/graph.js";
import { toGraph } from "../schema/transform.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// In-memory graph store — seeded with null, populated via POST.
let currentGraph: Graph | null = null;

/** POST /graph — accept a LoomPlan, validate, transform, store. */
app.post("/graph", (req, res) => {
  const result = LoomPlanSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Invalid LoomPlan payload",
      details: result.error.issues,
    });
    return;
  }

  const graph = toGraph(result.data);
  const graphResult = GraphSchema.safeParse(graph);
  if (!graphResult.success) {
    res.status(500).json({
      error: "Graph transformation produced invalid output",
      details: graphResult.error.issues,
    });
    return;
  }

  currentGraph = graphResult.data;
  res.status(201).json(currentGraph);
});

/** GET /graph — return the current graph, or 404 if none loaded. */
app.get("/graph", (_req, res) => {
  if (!currentGraph) {
    res.status(404).json({ error: "No graph loaded. POST a LoomPlan first." });
    return;
  }
  res.json(currentGraph);
});

/** Reset store — used in tests. */
export function resetGraph(): void {
  currentGraph = null;
}

export { app };
