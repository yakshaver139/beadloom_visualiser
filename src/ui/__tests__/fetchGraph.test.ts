import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGraph } from "../fetchGraph.js";

describe("fetchGraph", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to fixture when API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const graph = await fetchGraph();
    expect(graph.nodes.length).toBe(6);
    expect(graph.metadata.id).toBe("loom-2026-02-20-124321");
    expect(graph.critical_path).toContain("bvis-o3t.3");
  });

  it("uses API response when available", async () => {
    const mockGraph = {
      nodes: [
        { id: "t1", title: "Test", status: "pending", is_critical: false, wave_index: 0, branch_name: "b/t1" },
      ],
      edges: [],
      critical_path: [],
      metadata: {
        id: "test",
        created_at: "2026-01-01T00:00:00Z",
        total_tasks: 1,
        total_waves: 1,
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGraph),
    } as Response);

    const graph = await fetchGraph();
    expect(graph.nodes.length).toBe(1);
    expect(graph.nodes[0].id).toBe("t1");
  });

  it("falls back to fixture on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const graph = await fetchGraph();
    expect(graph.nodes.length).toBe(6);
  });
});
