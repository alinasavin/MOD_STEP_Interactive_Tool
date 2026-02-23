import type { Diagram, DiagramNode, DiagramStep } from '../types/diagram';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

const getStepTreeHeight = (step: DiagramStep): number => {
  // Each step is roughly 80px tall plus some gap to account for text wrapping
  let h = 80;
  if (step.subSteps && step.subSteps.length > 0) {
    step.subSteps.forEach((s) => { h += getStepTreeHeight(s); });
    h += 12; // Extra padding for sub-step container
  }
  return h;
};

export const getNodeVisualHeight = (node: DiagramNode): number => {
  if (node.manualHeight) return node.manualHeight;

  const mainH = (node.steps || []).reduce((acc, s) => acc + getStepTreeHeight(s), 0);
  const parallelH = (node.parallelSteps || []).reduce((acc, s) => acc + getStepTreeHeight(s), 0);

  // Base height needs to be generous to ensure arrows don't clip into the border
  const hasSteps = (node.steps?.length || 0) > 0 || (node.parallelSteps?.length || 0) > 0;
  // Increase baseHeight for box nodes to ensure content fits
  const baseHeight = hasSteps ? 160 : 120;

  return baseHeight + Math.max(mainH, parallelH);
};

export function calculateNodePositions(
    diagram: Diagram,
    width: number,
    height: number
): NodePosition[] {
  let positions: NodePosition[] = [];
  const { nodes, edges, overviewNodes = [], topNodes = [] } = diagram;
  const layoutOptions = diagram.layoutOptions || {};
  const specialIds = new Set([...overviewNodes.map(n => n.id), ...topNodes.map(n => n.id)]);

  const baseColGap = layoutOptions.columnGap ?? 320;
  const baseRowGap = layoutOptions.rowGap ?? 150;
  const defaultNodeWidth = 256;

  // 1. DETERMINE COLUMN DEPTHS
  const depths: Record<string, number> = {};
  if (diagram.layout === 'linear') {
    nodes.forEach((n, i) => depths[n.id] = i);
  } else {
    const queue: string[] = [diagram.entryNodeId];
    depths[diagram.entryNodeId] = 0;
    let maxD = 0;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const d = depths[curr];
      maxD = Math.max(maxD, d);
      edges.filter(e => e.from === curr && !specialIds.has(e.to)).forEach(e => {
        if (depths[e.to] === undefined || depths[e.to] < d + 1) {
          depths[e.to] = d + 1;
          queue.push(e.to);
        }
      });
    }
    nodes.forEach(n => { if (depths[n.id] === undefined) depths[n.id] = n.role === 'entry' ? 0 : Math.ceil(maxD / 2); });
  }

  // 2. GROUP NODES INTO COLUMNS
  const columns: Record<number, string[]> = {};
  Object.entries(depths).forEach(([id, d]) => { if (!columns[d]) columns[d] = []; columns[d].push(id); });
  const sortedDepths = Object.keys(columns).map(Number).sort((a, b) => a - b);

  // 3. CALCULATE DYNAMIC COLUMN X POSITIONS
  // We find the maxWidth of each column and calculate X based on actual edges
  const colMaxWidths = sortedDepths.map(d => {
    return columns[d].reduce((max, id) => {
      const node = nodes.find(n => n.id === id);
      return Math.max(max, node?.width || defaultNodeWidth);
    }, 0);
  });

  const columnXPositions: Record<number, number> = {};
  let currentX = 0;

  sortedDepths.forEach((depth, i) => {
    if (i === 0) {
      currentX = colMaxWidths[i] / 2;
    } else {
      // Calculate distance between column centers:
      // (Half of prev col) + (Half of current col) + (a minimum margin buffer)
      const buffer = Math.max(60, baseColGap - defaultNodeWidth);
      currentX += (colMaxWidths[i - 1] / 2) + (colMaxWidths[i] / 2) + buffer;
    }
    columnXPositions[depth] = currentX;
  });

  // 4. POSITION STANDARD NODES
  const diagramWidth = currentX + (colMaxWidths[colMaxWidths.length - 1] / 2);
  const startXOffset = (width - diagramWidth) / 2;

  sortedDepths.forEach((depth) => {
    const colNodeIds = columns[depth];
    const tallest = colNodeIds.reduce((m, id) => Math.max(m, getNodeVisualHeight(nodes.find(n => n.id === id)!)), 110);
    const localRowGap = Math.max(baseRowGap, tallest + 30);
    const totalColHeight = (colNodeIds.length - 1) * localRowGap;
    const startY = -(totalColHeight / 2);

    colNodeIds.forEach((id, nodeIndex) => {
      const node = nodes.find(n => n.id === id);
      positions.push({
        id,
        x: (node?.manualX !== undefined) ? node.manualX : (startXOffset + columnXPositions[depth]),
        y: (node?.manualY !== undefined) ? node.manualY : (startY + (nodeIndex * localRowGap))
      });
    });
  });

  // 5. POSITION SPECIAL LAYERS (Centered vertically above)
  const currentMinY = positions.length > 0 ? Math.min(...positions.map(p => p.y)) : 0;

  if (overviewNodes.length > 0) {
    const gap = layoutOptions.overviewGap ?? 200;
    overviewNodes.forEach((node) => {
      positions.push({
        id: node.id,
        x: (node.manualX !== undefined) ? node.manualX : (width / 2),
        y: (node.manualY !== undefined) ? node.manualY : (currentMinY - gap)
      });
    });
  }

  if (topNodes.length > 0) {
    const newMinY = Math.min(...positions.map(p => p.y));
    const gap = layoutOptions.topGap ?? 180;
    topNodes.forEach((node) => {
      positions.push({
        id: node.id,
        x: (node.manualX !== undefined) ? node.manualX : (width / 2),
        y: (node.manualY !== undefined) ? node.manualY : (newMinY - gap)
      });
    });
  }

  return positions;
}