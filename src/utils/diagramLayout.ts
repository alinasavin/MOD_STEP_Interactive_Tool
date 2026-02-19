import type { Diagram, DiagramNode, DiagramStep } from '../types/diagram';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Recursive helper to calculate the height of a step including all nested sub-steps.
 */
const getStepTreeHeight = (step: DiagramStep): number => {
  let h = 45; // Base height for a single step line
  if (step.subSteps && step.subSteps.length > 0) {
    step.subSteps.forEach((s) => {
      h += getStepTreeHeight(s);
    });
  }
  return h;
};

/**
 * Calculates the visual height of a node based on its internal steps and parallel columns.
 */
const getNodeVisualHeight = (node: DiagramNode): number => {
  const mainStepsHeight = (node.steps || []).reduce(
      (acc, s) => acc + getStepTreeHeight(s),
      0
  );
  const parallelStepsHeight = (node.parallelSteps || []).reduce(
      (acc, s) => acc + getStepTreeHeight(s),
      0
  );

  // Base height (Header + Padding) + the tallest of the two internal columns
  return 120 + Math.max(mainStepsHeight, parallelStepsHeight);
};

export function calculateNodePositions(
    diagram: Diagram,
    width: number, // Container width for breakpoints
    height: number
): NodePosition[] {
  let positions: NodePosition[] = [];
  const { nodes, edges, overviewNodes = [], topNodes = [] } = diagram;
  const layoutOptions = diagram.layoutOptions || {};

  // Create a set of IDs that should be excluded from the standard flow calculation
  const specialIds = new Set([
    ...overviewNodes.map((n) => n.id),
    ...topNodes.map((n) => n.id),
  ]);

  // --- 1. RESPONSIVE BREAKPOINT SPACING ---
  let baseColGap = layoutOptions.columnGap ?? 320;
  let baseRowGap = layoutOptions.rowGap ?? 150;

  if (width < 640) { // sm
    baseColGap = 200; baseRowGap = 100;
  } else if (width < 1024) { // lg
    baseColGap = 260; baseRowGap = 120;
  }

  const nodeWidth = layoutOptions.nodeMinWidth ?? 260;
  const columnGap = Math.max(baseColGap, nodeWidth + 40);

  /**
   * Calculates the required gap for a specific column based on the tallest node in it.
   */
  const getDynamicRowGap = (nodeIds: string[]) => {
    const tallest = nodeIds.reduce((max, id) => {
      const node = nodes.find((n) => n.id === id);
      const h = node ? getNodeVisualHeight(node) : 110;
      return Math.max(max, h);
    }, 110);
    return Math.max(baseRowGap, tallest + 40);
  };

  // --- 2. STANDARD FLOW CALCULATION ---
  if (diagram.layout === 'linear') {
    const totalWidth = (nodes.length - 1) * columnGap;
    const startX = (width - totalWidth) / 2;
    nodes.forEach((node, index) => {
      positions.push({ id: node.id, x: startX + index * columnGap, y: 0 });
    });
  } else {
    // BFS Depth Calculation (Ignoring Overview and Top nodes)
    const depths: Record<string, number> = {};
    const queue: string[] = [diagram.entryNodeId];
    depths[diagram.entryNodeId] = 0;
    let maxDepth = 0;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDepth = depths[currentId];
      maxDepth = Math.max(maxDepth, currentDepth);

      const targets = edges
          .filter((e) => e.from === currentId && !specialIds.has(e.to))
          .map((e) => e.to);

      targets.forEach((targetId) => {
        if (depths[targetId] === undefined || depths[targetId] < currentDepth + 1) {
          depths[targetId] = currentDepth + 1;
          queue.push(targetId);
        }
      });
    }

    // Assign fallback depths for orphaned nodes
    nodes.forEach((n) => {
      if (depths[n.id] === undefined) {
        if (n.role === 'entry') depths[n.id] = 0;
        else if (n.role === 'end') depths[n.id] = maxDepth + 1;
        else depths[n.id] = Math.ceil(maxDepth / 2);
      }
    });

    const columns: Record<number, string[]> = {};
    Object.entries(depths).forEach(([id, depth]) => {
      if (!columns[depth]) columns[depth] = [];
      columns[depth].push(id);
    });

    const sortedDepths = Object.keys(columns).map(Number).sort((a, b) => a - b);
    const totalDiagramWidth = (sortedDepths.length - 1) * columnGap;
    const startX = (width - totalDiagramWidth) / 2;

    sortedDepths.forEach((depth, colIndex) => {
      const colNodeIds = columns[depth];
      const localRowGap = getDynamicRowGap(colNodeIds);
      const totalColHeight = (colNodeIds.length - 1) * localRowGap;
      const startY = -(totalColHeight / 2);

      colNodeIds.forEach((id, nodeIndex) => {
        positions.push({
          id,
          x: startX + colIndex * columnGap,
          y: startY + nodeIndex * localRowGap,
        });
      });
    });
  }

  // --- 3. OVERVIEW NODES PLACEMENT (Layer Above Flow) ---
  if (overviewNodes.length > 0) {
    const currentMinY = Math.min(...positions.map((p) => p.y));
    const overviewGap = layoutOptions.overviewGap ?? 180;
    const xSpacing = 400; // Wider spacing for overview bars
    const totalOvWidth = (overviewNodes.length - 1) * xSpacing;
    const ovStartX = (width - totalOvWidth) / 2;

    overviewNodes.forEach((node, index) => {
      positions.push({
        id: node.id,
        x: ovStartX + index * xSpacing,
        y: currentMinY - overviewGap,
      });
    });
  }

  // --- 4. TOP NODES PLACEMENT (Highest Layer) ---
  if (topNodes.length > 0) {
    // Recalculate minY after Overview nodes were added
    const currentMinY = Math.min(...positions.map((p) => p.y));
    const topGap = layoutOptions.topGap ?? 180;
    const xSpacing = 500;
    const totalTopWidth = (topNodes.length - 1) * xSpacing;
    const topStartX = (width - totalTopWidth) / 2;

    topNodes.forEach((node, index) => {
      positions.push({
        id: node.id,
        x: topStartX + index * xSpacing,
        y: currentMinY - topGap,
      });
    });
  }

  return positions;
}