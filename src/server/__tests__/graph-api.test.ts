import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetGraph } from "../app.js";
import samplePlan from "../../fixtures/sample-loom-plan.json";

describe("/graph API", () => {
  beforeEach(() => {
    resetGraph();
  });

  // ---- GET before any POST ----

  it("GET /graph returns 404 when no graph loaded", async () => {
    const res = await request(app).get("/graph");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no graph loaded/i);
  });

  // ---- POST valid LoomPlan ----

  it("POST /graph accepts a valid LoomPlan and returns 201", async () => {
    const res = await request(app)
      .post("/graph")
      .send(samplePlan)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("nodes");
    expect(res.body).toHaveProperty("edges");
    expect(res.body).toHaveProperty("critical_path");
    expect(res.body).toHaveProperty("metadata");
  });

  it("POST /graph transforms nodes correctly", async () => {
    const res = await request(app).post("/graph").send(samplePlan);

    expect(res.body.nodes).toHaveLength(6);
    const nodeIds = res.body.nodes.map((n: { id: string }) => n.id);
    expect(nodeIds).toContain("bvis-o3t.1");
    expect(nodeIds).toContain("bvis-o3t.2");
  });

  it("POST /graph transforms edges from deps.predecessors", async () => {
    const res = await request(app).post("/graph").send(samplePlan);

    // bvis-o3t.2 depends on bvis-o3t.1 → edge from .1 to .2
    expect(res.body.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "bvis-o3t.1", to: "bvis-o3t.2" }),
      ]),
    );
  });

  it("POST /graph preserves critical_path", async () => {
    const res = await request(app).post("/graph").send(samplePlan);
    expect(res.body.critical_path).toEqual(samplePlan.critical_path);
  });

  it("POST /graph populates metadata", async () => {
    const res = await request(app).post("/graph").send(samplePlan);
    expect(res.body.metadata.id).toBe(samplePlan.id);
    expect(res.body.metadata.total_tasks).toBe(6);
    expect(res.body.metadata.total_waves).toBe(4);
  });

  // ---- GET after POST ----

  it("GET /graph returns stored graph after POST", async () => {
    await request(app).post("/graph").send(samplePlan);

    const res = await request(app).get("/graph");
    expect(res.status).toBe(200);
    expect(res.body.nodes).toHaveLength(6);
    expect(res.body.metadata.id).toBe(samplePlan.id);
  });

  // ---- Validation failures ----

  it("POST /graph rejects empty body with 400", async () => {
    const res = await request(app)
      .post("/graph")
      .send({})
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid/i);
    expect(res.body.details).toBeDefined();
  });

  it("POST /graph rejects payload missing required fields", async () => {
    const res = await request(app)
      .post("/graph")
      .send({ id: "test", created_at: "2026-01-01T00:00:00Z" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it("POST /graph rejects payload with wrong types", async () => {
    const res = await request(app)
      .post("/graph")
      .send({ ...samplePlan, total_tasks: "not-a-number" });

    expect(res.status).toBe(400);
  });
});
