import type { Graph } from "../schema/graph.js";

const COLUMN_WIDTH = 300;
const ROW_HEIGHT = 120;
const PADDING_X = 60;
const PADDING_Y = 40;

/**
 * Simple wave-based layout: nodes are placed in columns by wave_index,
 * and spread vertically within each wave.
 */
export function layoutGraph(
  graph: Graph,
): Map<string, { x: number; y: number }> {
  // Group nodes by wave
  const waves = new Map<number, string[]>();
  for (const node of graph.nodes) {
    const list = waves.get(node.wave_index) ?? [];
    list.push(node.id);
    waves.set(node.wave_index, list);
  }

  const positions = new Map<string, { x: number; y: number }>();

  for (const [waveIndex, nodeIds] of waves) {
    const x = PADDING_X + waveIndex * COLUMN_WIDTH;
    // Center nodes vertically in the wave column
    const totalHeight = (nodeIds.length - 1) * ROW_HEIGHT;
    const startY = PADDING_Y + (graph.nodes.length * ROW_HEIGHT - totalHeight) / 2 - (graph.nodes.length * ROW_HEIGHT) / 2 + PADDING_Y;

    nodeIds.forEach((id, i) => {
      positions.set(id, {
        x,
        y: Math.max(PADDING_Y, PADDING_Y + i * ROW_HEIGHT),
      });
    });
  }

  return positions;
}
