import type { Diagram } from '../types/diagram';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function calculateNodePositions(
    diagram: Diagram,
    width: number, // current containerWidth
    height: number
): NodePosition[] {
  let positions: NodePosition[] = [];
  const nodes = diagram.nodes;
  const edges = diagram.edges;
  const overviewNodes = diagram.overviewNodes || [];
  const overviewIds = new Set(overviewNodes.map((n) => n.id));
  const layoutOptions = diagram.layoutOptions || {};

  // --- 1. RESPONSIVE BREAKPOINT SPACING ---
  let baseColGap = layoutOptions.columnGap ?? 300;
  let baseRowGap = layoutOptions.rowGap ?? 150;

  if (width < 640) { // sm
    baseColGap = 180; baseRowGap = 100;
  } else if (width < 768) { // md
    baseColGap = 220; baseRowGap = 110;
  } else if (width < 1024) { // lg
    baseColGap = 240; baseRowGap = 120;
  } else if (width < 1280) { // xl
    baseColGap = 260;
  }

  const nodeWidth = layoutOptions.nodeMinWidth ?? 260;
  const columnGap = Math.max(baseColGap, nodeWidth + 20);

  // Helper to calculate height of tallest node in a specific column
  const getLocalRowGap = (nodeIds: string[]) => {
    const tallest = nodeIds.reduce((max, id) => {
      const node = nodes.find(n => n.id === id);
      const h = (node?.steps && node.steps.length > 0) ? 120 + (node.steps.length * 45) : 110;
      return Math.max(max, h);
    }, 110);
    return Math.max(baseRowGap, tallest + 30);
  };

  // --- 2. LAYOUT CALCULATION ---
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
          .filter((e) => e.from === currentId && !overviewIds.has(e.to))
          .map((e) => e.to);

      targets.forEach((targetId) => {
        if (depths[targetId] === undefined || depths[targetId] < currentDepth + 1) {
          depths[targetId] = currentDepth + 1;
          queue.push(targetId);
        }
      });
    }

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

    // Build positions column by column
    sortedDepths.forEach((depth, colIndex) => {
      const colNodeIds = columns[depth];
      const localRowGap = getLocalRowGap(colNodeIds);
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

  // --- 3. OVERVIEW NODE PLACEMENT ---
  if (overviewNodes.length > 0) {
    const currentMinY = Math.min(...positions.map((p) => p.y));
    const overviewGap = layoutOptions.overviewGap ?? 150;
    const ovGapX = 350;
    const totalOvWidth = (overviewNodes.length - 1) * ovGapX;
    const ovStartX = (width - totalOvWidth) / 2;

    overviewNodes.forEach((node, index) => {
      positions.push({
        id: node.id,
        x: ovStartX + index * ovGapX,
        y: currentMinY - overviewGap,
      });
    });
  }

  return positions;
}