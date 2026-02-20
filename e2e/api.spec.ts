import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePlan = JSON.parse(
  readFileSync(resolve(__dirname, "../src/fixtures/sample-loom-plan.json"), "utf-8"),
);

const API = "http://localhost:3001";

test.describe("Graph API integration", () => {
  test("POST /graph accepts fixture and returns valid graph", async ({
    request,
  }) => {
    const res = await request.post(`${API}/graph`, { data: samplePlan });

    expect(res.status()).toBe(201);

    const graph = await res.json();
    expect(graph.nodes).toHaveLength(6);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.critical_path).toEqual(samplePlan.critical_path);
    expect(graph.metadata.id).toBe(samplePlan.id);
    expect(graph.metadata.total_tasks).toBe(6);
    expect(graph.metadata.total_waves).toBe(4);
  });

  test("GET /graph returns the previously posted graph", async ({
    request,
  }) => {
    // Seed the API
    await request.post(`${API}/graph`, { data: samplePlan });

    const res = await request.get(`${API}/graph`);
    expect(res.status()).toBe(200);

    const graph = await res.json();
    expect(graph.nodes).toHaveLength(6);

    // Verify node shape
    const node = graph.nodes.find(
      (n: { id: string }) => n.id === "bvis-o3t.1",
    );
    expect(node).toBeDefined();
    expect(node.title).toBe("Define Beadloom graph JSON contract");
    expect(node.is_critical).toBe(true);
    expect(node.wave_index).toBe(0);
  });

  test("POST /graph rejects invalid payload", async ({ request }) => {
    const res = await request.post(`${API}/graph`, {
      data: { invalid: true },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
    expect(body.details).toBeDefined();
  });

  test("graph edges reflect fixture dependencies", async ({ request }) => {
    const res = await request.post(`${API}/graph`, { data: samplePlan });
    const graph = await res.json();

    // bvis-o3t.2 depends on bvis-o3t.1
    expect(graph.edges).toContainEqual({
      from: "bvis-o3t.1",
      to: "bvis-o3t.2",
    });

    // bvis-o3t.5 depends on bvis-o3t.2 and bvis-o3t.3
    expect(graph.edges).toContainEqual({
      from: "bvis-o3t.2",
      to: "bvis-o3t.5",
    });
    expect(graph.edges).toContainEqual({
      from: "bvis-o3t.3",
      to: "bvis-o3t.5",
    });
  });

  test("critical nodes have is_critical=true", async ({ request }) => {
    const res = await request.post(`${API}/graph`, { data: samplePlan });
    const graph = await res.json();

    const criticalIds = new Set(graph.critical_path);
    for (const node of graph.nodes) {
      if (criticalIds.has(node.id)) {
        expect(node.is_critical).toBe(true);
      }
    }

    // bvis-o3t.4 is NOT on critical path
    const docsNode = graph.nodes.find(
      (n: { id: string }) => n.id === "bvis-o3t.4",
    );
    expect(docsNode?.is_critical).toBe(false);
  });
});
