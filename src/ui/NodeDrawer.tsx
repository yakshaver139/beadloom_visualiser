import type { GraphNode } from "../schema/graph.js";

interface Props {
  node: GraphNode;
  isCritical: boolean;
  onClose: () => void;
}

export function NodeDrawer({ node, isCritical, onClose }: Props) {
  return (
    <div className="node-drawer-overlay">
      <div className="node-drawer-backdrop" onClick={onClose} />
      <div className="node-drawer" role="dialog" aria-label={`Details for ${node.id}`}>
        <button className="drawer-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2>{node.title}</h2>
        <dl>
          <div className="drawer-field">
            <dt>Task ID</dt>
            <dd>{node.id}</dd>
          </div>
          <div className="drawer-field">
            <dt>Status</dt>
            <dd>
              <span className={`node-status ${node.status}`}>
                {node.status.replace("_", " ")}
              </span>
            </dd>
          </div>
          <div className="drawer-field">
            <dt>Wave</dt>
            <dd>{node.wave_index}</dd>
          </div>
          <div className="drawer-field">
            <dt>Branch</dt>
            <dd>{node.branch_name}</dd>
          </div>
          <div className="drawer-field">
            <dt>Critical Path</dt>
            <dd>
              <span
                className={`drawer-badge ${isCritical ? "critical" : "not-critical"}`}
              >
                {isCritical ? "On critical path" : "Not on critical path"}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
