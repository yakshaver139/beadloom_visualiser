import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePlan = JSON.parse(
  readFileSync(resolve(__dirname, "../src/fixtures/sample-loom-plan.json"), "utf-8"),
);

const API = "http://localhost:3001";

test.describe("UI integration", () => {
  test.beforeEach(async ({ request }) => {
    // Seed the API so /graph returns data (not fixture fallback)
    await request.post(`${API}/graph`, { data: samplePlan });
  });

  test("app loads and displays header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Beadloom Visualiser");
  });

  test("renders all 6 task nodes", async ({ page }) => {
    await page.goto("/");

    // Each task node shows its ID in a .node-id element
    for (const taskId of Object.keys(samplePlan.tasks)) {
      await expect(page.locator(`.node-id:text("${taskId}")`)).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test("renders edges between nodes", async ({ page }) => {
    await page.goto("/");

    // Wait for nodes to load first
    await expect(page.locator(".task-node").first()).toBeVisible({
      timeout: 10_000,
    });

    // React Flow renders edges as SVG paths with class react-flow__edge
    const edgeCount = await page.locator(".react-flow__edge").count();
    // The fixture has 6 dependency edges
    expect(edgeCount).toBe(6);
  });

  test("critical nodes have orange border (CPA highlighting)", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for the graph to render
    await expect(page.locator(".task-node").first()).toBeVisible({
      timeout: 10_000,
    });

    // Critical nodes should have the .critical class
    const criticalNodes = page.locator(".task-node.critical");
    const criticalCount = await criticalNodes.count();

    // 5 of 6 tasks are on the critical path
    expect(criticalCount).toBe(5);

    // Verify the non-critical task (bvis-o3t.4) does NOT have .critical
    const docsNode = page.locator('.task-node:has(.node-id:text("bvis-o3t.4"))');
    await expect(docsNode).toBeVisible();
    await expect(docsNode).not.toHaveClass(/critical/);
  });

  test("critical edges are highlighted", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".task-node").first()).toBeVisible({
      timeout: 10_000,
    });

    // Critical edges have the .critical class
    const criticalEdges = page.locator(".react-flow__edge.critical");
    const criticalEdgeCount = await criticalEdges.count();

    // 3 consecutive critical-path pairs have actual edges: .1→.2, .3→.5, .5→.6
    expect(criticalEdgeCount).toBe(3);
  });

  test("clicking a node opens the detail drawer", async ({ page }) => {
    await page.goto("/");

    // Wait for nodes
    await expect(page.locator(".task-node").first()).toBeVisible({
      timeout: 10_000,
    });

    // Click the first critical node (bvis-o3t.1)
    await page.locator('.task-node:has(.node-id:text("bvis-o3t.1"))').click();

    // Drawer should open with node details
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Define Beadloom graph JSON contract");
    await expect(drawer).toContainText("bvis-o3t.1");
    await expect(drawer).toContainText("On critical path");
  });

  test("clicking a non-critical node shows 'Not on critical path'", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator(".task-node").first()).toBeVisible({
      timeout: 10_000,
    });

    // Click bvis-o3t.4 (not on critical path)
    await page.locator('.task-node:has(.node-id:text("bvis-o3t.4"))').click();

    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Not on critical path");
  });

  test("status filter buttons are visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".status-filter")).toBeVisible();
    // 4 status buttons
    const buttons = page.locator(".status-filter button");
    await expect(buttons).toHaveCount(4);
  });
});
