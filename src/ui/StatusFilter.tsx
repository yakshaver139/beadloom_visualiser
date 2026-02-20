import type { NodeStatus } from "../schema/graph.js";

const ALL_STATUSES: NodeStatus[] = ["pending", "in_progress", "completed", "blocked"];

interface Props {
  active: Set<NodeStatus>;
  onChange: (next: Set<NodeStatus>) => void;
}

export function StatusFilter({ active, onChange }: Props) {
  function toggle(status: NodeStatus) {
    const next = new Set(active);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    onChange(next);
  }

  return (
    <div className="status-filter" role="group" aria-label="Filter by status">
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          className={active.has(s) ? "active" : ""}
          onClick={() => toggle(s)}
          aria-pressed={active.has(s)}
        >
          {s.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
