import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NodeDrawer } from "../NodeDrawer.js";
import type { GraphNode } from "../../schema/graph.js";

afterEach(cleanup);

const sampleNode: GraphNode = {
  id: "bvis-o3t.3",
  title: "Build React UI for graph + CPA display",
  status: "in_progress",
  is_critical: true,
  wave_index: 1,
  branch_name: "beadloom/bvis-o3t.3",
};

describe("NodeDrawer", () => {
  it("renders node details", () => {
    render(<NodeDrawer node={sampleNode} isCritical={true} onClose={() => {}} />);

    expect(screen.getByText("Build React UI for graph + CPA display")).toBeInTheDocument();
    expect(screen.getByText("bvis-o3t.3")).toBeInTheDocument();
    expect(screen.getByText("beadloom/bvis-o3t.3")).toBeInTheDocument();
    expect(screen.getByText("On critical path")).toBeInTheDocument();
  });

  it("shows not-critical badge when not on critical path", () => {
    render(<NodeDrawer node={sampleNode} isCritical={false} onClose={() => {}} />);
    expect(screen.getByText("Not on critical path")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<NodeDrawer node={sampleNode} isCritical={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <NodeDrawer node={sampleNode} isCritical={true} onClose={onClose} />,
    );

    const backdrop = container.querySelector(".node-drawer-backdrop")!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has an accessible dialog role", () => {
    render(<NodeDrawer node={sampleNode} isCritical={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
