import type { Diagram, DiagramNode, DiagramStep } from '../types/diagram';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Calculates the total height of a step including all nested sub-steps recursively.
 */
const getStepTreeHeight = (step: DiagramStep): number => {
  let h = 45; // Base height per step row
  if (step.subSteps && step.subSteps.length > 0) {
    step.subSteps.forEach((s) => {
      h += getStepTreeHeight(s);
    });
  }
  return h;
};

/**
 * Calculates node height based on the taller of the two internal columns (main vs parallel).
 */
const getNodeVisualHeight = (node: DiagramNode): number => {
  const mainH = (node.steps || []).reduce((acc, s) => acc + getStepTreeHeight(s), 0);
  const parallelH = (node.parallelSteps || []).reduce((acc, s) => acc + getStepTreeHeight(s), 0);

  // Base 120 (header + padding) + tallest column
  return 120 + Math.max(mainH, parallelH);
};

export function calculateNodePositions(
    diagram: Diagram,
    width: number,
    height: number
): NodePosition[] {
  let positions: NodePosition[] = [];
  const { nodes, edges, overviewNodes = [], topNodes = [] } = diagram;
  const layoutOptions = diagram.layoutOptions || {};

  // Exclude special layers from the standard BFS flow
  const specialIds = new Set([...overviewNodes.map(n => n.id), ...topNodes.map(n => n.id)]);

  // --- 1. RESPONSIVE SPACING ---
  let baseColGap = layoutOptions.columnGap ?? 320;
  let baseRowGap = layoutOptions.rowGap ?? 150;
  const nodeWidth = layoutOptions.nodeMinWidth ?? 260;

  if (width < 640) { baseColGap = 200; baseRowGap = 100; }
  else if (width < 1024) { baseColGap = 260; baseRowGap = 120; }

  const columnGap = Math.max(baseColGap, nodeWidth + 40);

  // --- 2. STANDARD FLOW CALCULATION ---
  if (diagram.layout === 'linear') {
    const totalWidth = (nodes.length - 1) * columnGap;
    const startX = (width - totalWidth) / 2;
    nodes.forEach((node, index) => {
      positions.push({ id: node.id, x: startX + index * columnGap, y: 0 });
    });
  } else {
    // BFS Depth Calculation
    const depths: Record<string, number> = {};
    const queue: string[] = [diagram.entryNodeId];
    depths[diagram.entryNodeId] = 0;
    let maxDepth = 0;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDepth = depths[currentId];
      maxDepth = Math.max(maxDepth, currentDepth);

      const targets = edges
          .filter(e => e.from === currentId && !specialIds.has(e.to))
          .map(e => e.to);

      targets.forEach(t => {
        if (depths[t] === undefined || depths[t] < currentDepth + 1) {
          depths[t] = currentDepth + 1;
          queue.push(t);
        }
      });
    }

    nodes.forEach(n => {
      if (depths[n.id] === undefined) depths[n.id] = n.role === 'entry' ? 0 : Math.ceil(maxDepth / 2);
    });

    const columns: Record<number, string[]> = {};
    Object.entries(depths).forEach(([id, d]) => {
      if (!columns[d]) columns[d] = [];
      columns[d].push(id);
    });

    const sortedDepths = Object.keys(columns).map(Number).sort((a, b) => a - b);
    const totalDiagramWidth = (sortedDepths.length - 1) * columnGap;
    const startX = (width - totalDiagramWidth) / 2;

    sortedDepths.forEach((depth, colIndex) => {
      const colNodeIds = columns[depth];

      // Calculate rowGap needed for this specific column based on tallest node
      const tallest = colNodeIds.reduce((m, id) => {
        const n = nodes.find(node => node.id === id);
        return Math.max(m, n ? getNodeVisualHeight(n) : 110);
      }, 110);

      const localRowGap = Math.max(baseRowGap, tallest + 30);
      const totalColHeight = (colNodeIds.length - 1) * localRowGap;
      const startY = -(totalColHeight / 2);

      colNodeIds.forEach((id, nodeIndex) => {
        positions.push({ id, x: startX + colIndex * columnGap, y: startY + nodeIndex * localRowGap });
      });
    });
  }

  // --- 3. OVERVIEW NODES (Layer 2) ---
  if (overviewNodes.length > 0) {
    const currentMinY = Math.min(...positions.map(p => p.y));
    const gap = layoutOptions.overviewGap ?? 200;
    overviewNodes.forEach((node, index) => {
      positions.push({ id: node.id, x: width / 2, y: currentMinY - gap });
    });
  }

  // --- 4. TOP NODES (Layer 1 - Highest) ---
  if (topNodes.length > 0) {
    const currentMinY = Math.min(...positions.map(p => p.y));
    const gap = layoutOptions.topGap ?? 180;
    topNodes.forEach((node, index) => {
      positions.push({ id: node.id, x: width / 2, y: currentMinY - gap });
    });
  }

  return positions;
}