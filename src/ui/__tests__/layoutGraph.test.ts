import { describe, it, expect } from "vitest";
import { layoutGraph } from "../layoutGraph.js";
import type { Graph } from "../../schema/graph.js";

function makeGraph(overrides: Partial<Graph> = {}): Graph {
  return {
    nodes: [
      { id: "a", title: "Task A", status: "pending", is_critical: true, wave_index: 0, branch_name: "b/a" },
      { id: "b", title: "Task B", status: "in_progress", is_critical: true, wave_index: 1, branch_name: "b/b" },
      { id: "c", title: "Task C", status: "pending", is_critical: false, wave_index: 1, branch_name: "b/c" },
      { id: "d", title: "Task D", status: "completed", is_critical: true, wave_index: 2, branch_name: "b/d" },
    ],
    edges: [
      { from: "a", to: "b" },
      { from: "a", to: "c" },
      { from: "b", to: "d" },
    ],
    critical_path: ["a", "b", "d"],
    metadata: {
      id: "test-plan",
      created_at: "2026-01-01T00:00:00Z",
      total_tasks: 4,
      total_waves: 3,
    },
    ...overrides,
  };
}

describe("layoutGraph", () => {
  it("returns a position for every node", () => {
    const graph = makeGraph();
    const positions = layoutGraph(graph);
    expect(positions.size).toBe(4);
    for (const node of graph.nodes) {
      expect(positions.has(node.id)).toBe(true);
    }
  });

  it("places nodes in different waves at different x positions", () => {
    const graph = makeGraph();
    const positions = layoutGraph(graph);
    const xA = positions.get("a")!.x;
    const xB = positions.get("b")!.x;
    const xD = positions.get("d")!.x;
    expect(xA).toBeLessThan(xB);
    expect(xB).toBeLessThan(xD);
  });

  it("places nodes in the same wave at the same x position", () => {
    const graph = makeGraph();
    const positions = layoutGraph(graph);
    expect(positions.get("b")!.x).toBe(positions.get("c")!.x);
  });

  it("places nodes in the same wave at different y positions", () => {
    const graph = makeGraph();
    const positions = layoutGraph(graph);
    expect(positions.get("b")!.y).not.toBe(positions.get("c")!.y);
  });

  it("handles empty graph", () => {
    const graph = makeGraph({ nodes: [], edges: [] });
    const positions = layoutGraph(graph);
    expect(positions.size).toBe(0);
  });
});
