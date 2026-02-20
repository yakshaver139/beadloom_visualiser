import { describe, it, expect } from "vitest";
import { LoomPlanSchema } from "../loom-plan.js";
import fixture from "../../fixtures/sample-loom-plan.json";

describe("LoomPlanSchema", () => {
  it("parses the sample fixture", () => {
    const result = LoomPlanSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it("extracts correct metadata", () => {
    const plan = LoomPlanSchema.parse(fixture);
    expect(plan.id).toBe("loom-2026-02-20-124321");
    expect(plan.total_tasks).toBe(6);
    expect(plan.total_waves).toBe(4);
  });

  it("has expected critical path", () => {
    const plan = LoomPlanSchema.parse(fixture);
    expect(plan.critical_path).toEqual([
      "bvis-o3t.1",
      "bvis-o3t.2",
      "bvis-o3t.3",
      "bvis-o3t.5",
      "bvis-o3t.6",
    ]);
  });

  it("rejects missing required fields", () => {
    const bad = { id: "test" };
    const result = LoomPlanSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects invalid created_at format", () => {
    const bad = { ...fixture, created_at: "not-a-date" };
    const result = LoomPlanSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects negative wave index", () => {
    const bad = {
      ...fixture,
      waves: [{ ...fixture.waves[0], index: -1 }],
    };
    const result = LoomPlanSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects empty tasks array in a wave", () => {
    const bad = {
      ...fixture,
      waves: [{ ...fixture.waves[0], tasks: [] }],
    };
    const result = LoomPlanSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
