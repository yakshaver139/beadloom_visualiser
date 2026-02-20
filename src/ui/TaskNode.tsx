import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GraphNode } from "../schema/graph.js";

type TaskNodeData = GraphNode & { dimmed?: boolean };

export const TaskNode = memo(function TaskNode({
  data,
}: NodeProps & { data: TaskNodeData }) {
  const classNames = ["task-node"];
  if (data.is_critical) classNames.push("critical");
  if (data.dimmed) classNames.push("dimmed");

  return (
    <div className={classNames.join(" ")}>
      <Handle type="target" position={Position.Left} />
      <div className="node-id">{data.id}</div>
      <div className="node-title">{data.title}</div>
      <span className={`node-status ${data.status}`}>{data.status.replace("_", " ")}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
