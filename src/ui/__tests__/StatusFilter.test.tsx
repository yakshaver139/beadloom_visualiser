import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { StatusFilter } from "../StatusFilter.js";
import type { NodeStatus } from "../../schema/graph.js";

afterEach(cleanup);

describe("StatusFilter", () => {
  const allActive = new Set<NodeStatus>(["pending", "in_progress", "completed", "blocked"]);

  it("renders all four status buttons", () => {
    render(<StatusFilter active={allActive} onChange={() => {}} />);
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("blocked")).toBeInTheDocument();
  });

  it("marks active buttons with aria-pressed=true", () => {
    render(<StatusFilter active={allActive} onChange={() => {}} />);
    for (const btn of screen.getAllByRole("button")) {
      expect(btn).toHaveAttribute("aria-pressed", "true");
    }
  });

  it("calls onChange with toggled set when a button is clicked", () => {
    const onChange = vi.fn();
    render(<StatusFilter active={allActive} onChange={onChange} />);

    fireEvent.click(screen.getByText("blocked"));
    expect(onChange).toHaveBeenCalledTimes(1);

    const result = onChange.mock.calls[0][0] as Set<NodeStatus>;
    expect(result.has("blocked")).toBe(false);
    expect(result.has("pending")).toBe(true);
  });

  it("adds a status back when toggled on", () => {
    const partial = new Set<NodeStatus>(["pending", "in_progress"]);
    const onChange = vi.fn();
    render(<StatusFilter active={partial} onChange={onChange} />);

    fireEvent.click(screen.getByText("completed"));
    const result = onChange.mock.calls[0][0] as Set<NodeStatus>;
    expect(result.has("completed")).toBe(true);
  });
});
