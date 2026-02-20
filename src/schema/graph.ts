import { z } from "zod";

// ---------------------------------------------------------------------------
// Graph – the normalised format the visualiser UI consumes.
// Derived from a LoomPlan by `toGraph()`.
// ---------------------------------------------------------------------------

export const NodeStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "blocked",
]);

export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const GraphNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: NodeStatusSchema,
  is_critical: z.boolean(),
  wave_index: z.number().int().nonnegative(),
  branch_name: z.string(),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphMetadataSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime({ offset: true }),
  total_tasks: z.number().int().nonnegative(),
  total_waves: z.number().int().nonnegative(),
});

export type GraphMetadata = z.infer<typeof GraphMetadataSchema>;

export const GraphSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  critical_path: z.array(z.string()),
  metadata: GraphMetadataSchema,
});

export type Graph = z.infer<typeof GraphSchema>;
