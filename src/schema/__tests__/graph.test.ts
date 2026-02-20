import { describe, it, expect } from "vitest";
import { GraphSchema } from "../graph.js";
import { LoomPlanSchema } from "../loom-plan.js";
import { toGraph } from "../transform.js";
import fixture from "../../fixtures/sample-loom-plan.json";

describe("GraphSchema", () => {
  const plan = LoomPlanSchema.parse(fixture);
  const graph = toGraph(plan);

  it("validates the transformed graph", () => {
    const result = GraphSchema.safeParse(graph);
    expect(result.success).toBe(true);
  });

  it("produces a node for every task", () => {
    expect(graph.nodes).toHaveLength(plan.total_tasks);
  });

  it("produces correct edges from deps.predecessors", () => {
    // bvis-o3t.5 depends on bvis-o3t.2 and bvis-o3t.3
    const edgesTo5 = graph.edges.filter((e) => e.to === "bvis-o3t.5");
    expect(edgesTo5).toHaveLength(2);
    expect(edgesTo5.map((e) => e.from).sort()).toEqual([
      "bvis-o3t.2",
      "bvis-o3t.3",
    ]);
  });

  it("preserves critical_path from input", () => {
    expect(graph.critical_path).toEqual(plan.critical_path);
  });

  it("copies metadata correctly", () => {
    expect(graph.metadata.id).toBe(plan.id);
    expect(graph.metadata.created_at).toBe(plan.created_at);
    expect(graph.metadata.total_tasks).toBe(plan.total_tasks);
    expect(graph.metadata.total_waves).toBe(plan.total_waves);
  });

  it("marks critical nodes", () => {
    const critical = graph.nodes.filter((n) => n.is_critical);
    expect(critical.length).toBe(5);
  });

  it("defaults node status to pending", () => {
    expect(graph.nodes.every((n) => n.status === "pending")).toBe(true);
  });

  it("includes wave_index on each node", () => {
    const node1 = graph.nodes.find((n) => n.id === "bvis-o3t.1");
    expect(node1?.wave_index).toBe(0);
    const node6 = graph.nodes.find((n) => n.id === "bvis-o3t.6");
    expect(node6?.wave_index).toBe(3);
  });

  it("root node has no incoming edges", () => {
    const edgesTo1 = graph.edges.filter((e) => e.to === "bvis-o3t.1");
    expect(edgesTo1).toHaveLength(0);
  });

  it("leaf node has no outgoing edges", () => {
    const edgesFrom6 = graph.edges.filter((e) => e.from === "bvis-o3t.6");
    expect(edgesFrom6).toHaveLength(0);
  });
});
