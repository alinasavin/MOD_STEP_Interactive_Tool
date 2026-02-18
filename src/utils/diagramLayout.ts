import type { Diagram, NodePosition } from '../types/diagram';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function calculateNodePositions(
    diagram: Diagram,
    width: number,
    height: number
): NodePosition[] {
  let positions: NodePosition[] = [];
  const nodes = diagram.nodes;
  const edges = diagram.edges;
  const overviewNodes = diagram.overviewNodes || [];
  const overviewIds = new Set(overviewNodes.map((n) => n.id));

  const layoutOptions = diagram.layoutOptions || {};
  const nodeWidth = layoutOptions.nodeMinWidth ?? 260;

  const columnGap = Math.max(layoutOptions.columnGap ?? 300, nodeWidth + 40);
  const paddingX = layoutOptions.paddingX ?? 100;
  const paddingY = layoutOptions.paddingY ?? 60;
  const overviewGap = layoutOptions.overviewGap ?? 150;

  // --- STEP 1: CALCULATE STANDARD NODES ---
  if (diagram.layout === 'linear') {
    const totalWidth = (nodes.length - 1) * columnGap;
    const startX = (width - totalWidth) / 2;
    nodes.forEach((node, index) => {
      positions.push({ id: node.id, x: startX + index * columnGap, y: 0 });
    });
  } else {
    // BFS/Layered approach to find depths
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
    const startX = Math.max(paddingX + nodeWidth / 2, (width - totalDiagramWidth) / 2);

    // --- NEW: PER-COLUMN ROW GAP LOGIC ---
    sortedDepths.forEach((depth, colIndex) => {
      const colNodeIds = columns[depth];

      // Calculate the tallest node IN THIS COLUMN ONLY
      const tallestInColumn = colNodeIds.reduce((max, id) => {
        const node = nodes.find(n => n.id === id);
        const h = (node?.steps && node.steps.length > 0) ? 120 + (node.steps.length * 45) : 110;
        return Math.max(max, h);
      }, 110);

      // Set the gap for this column. If column only has 1 node, gap doesn't matter.
      // We use the JSON rowGap as the preferred value.
      const localRowGap = Math.max(layoutOptions.rowGap ?? 150, tallestInColumn + 30);

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

  // --- STEP 2: HANDLE OVERVIEW NODES ---
  if (overviewNodes.length > 0) {
    const currentMinY = Math.min(...positions.map((p) => p.y));
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