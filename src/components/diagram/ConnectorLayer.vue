<script setup lang="ts">
import type { Edge, DiagramNode as Node } from '../../types/diagram';
import type { NodePosition } from '../../utils/diagramLayout';

const props = defineProps<{
  edges: Edge[];
  nodes: Node[];
  overviewNodes?: Node[];
  topNodes?: Node[];
  positions: NodePosition[];
  activeNodeIds: Set<string>;
  dimensions: { width: number; height: number };
}>();

const NODE_WIDTH = 256;
const BASE_NODE_HEIGHT = 100;
const STEP_NODE_HEIGHT = 180;

const getPos = (id: string) => props.positions.find(p => p.id === id);
const findNode = (id: string) => {
  return props.nodes.find(n => n.id === id) ||
      props.overviewNodes?.find(n => n.id === id) ||
      props.topNodes?.find(n => n.id === id);
};

const getNodeHeight = (node?: Node) => {
  if (!node) return BASE_NODE_HEIGHT;
  return (node.steps && node.steps.length > 0) || (node.parallelSteps && node.parallelSteps.length > 0)
      ? STEP_NODE_HEIGHT
      : BASE_NODE_HEIGHT;
};

const getPath = (edge: Edge) => {
  const fromPos = getPos(edge.from);
  const toPos = getPos(edge.to);
  if (!fromPos || !toPos) return '';

  const fromNode = findNode(edge.from);
  const toNode = findNode(edge.to);

  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;

  // FIX: ONLY use vertical anchoring if one of the nodes is a 'top' or 'overview' layer.
  // We removed the Math.abs(dy) > 100 check so tree branches stay side-to-side.
  const isLayerConnection = fromNode?.role === 'overview' || fromNode?.role === 'top' ||
      toNode?.role === 'overview' || toNode?.role === 'top';

  if (isLayerConnection) {
    const fromH = getNodeHeight(fromNode) / 2;
    const toH = getNodeHeight(toNode) / 2;

    const sX = fromPos.x;
    const sY = dy > 0 ? fromPos.y + fromH : fromPos.y - fromH;
    const eX = toPos.x;
    const eY = dy > 0 ? toPos.y - toH : toPos.y + toH;

    const vTension = Math.abs(dy) * 0.5;
    const isPerfectlyVertical = Math.abs(dx) < 1;
    const cp1x = isPerfectlyVertical ? sX + 1 : sX;
    const cp2x = isPerfectlyVertical ? eX - 1 : eX;

    const cp1y = dy > 0 ? sY + vTension : sY - vTension;
    const cp2y = dy > 0 ? eY - vTension : eY + vTension;

    return `M ${sX} ${sY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${eX} ${eY}`;
  }
  else {
    // STANDARD FLOW & TREE LOGIC (Side-to-Side)
    const dir = Math.sign(dx) || 1;
    const halfW = NODE_WIDTH / 2;

    // Standard Side-to-Side Anchors
    const sX = fromPos.x + (halfW * dir);
    const sY = fromPos.y;
    const eX = toPos.x - (halfW * dir);
    const eY = toPos.y;

    // CALCULATE SMOOTH S-CURVE
    // We use two control points at the midpoint of X to create the "Ice Tree" look
    const gapX = eX - sX;
    const cp1x = sX + (gapX * 0.5);
    const cp2x = eX - (gapX * 0.5);

    // 1px bulge fix for horizontal lines
    const isHorizontal = Math.abs(dy) < 1;
    const ctrlY1 = isHorizontal ? sY - 1 : sY;
    const ctrlY2 = isHorizontal ? eY + 1 : eY;

    return `M ${sX} ${sY} C ${cp1x} ${ctrlY1}, ${cp2x} ${ctrlY2}, ${eX} ${eY}`;
  }
};

const isActive = (edge: Edge) => props.activeNodeIds.has(edge.from) && props.activeNodeIds.has(edge.to);

const getStrokeColor = (edge: Edge) => {
  if (!isActive(edge)) return '#27272a';
  if (edge.color) return `var(--color-bright-${edge.color.toLowerCase()}, #ab92e1 )`;
  const fromNode = findNode(edge.from);
  const colorKey = fromNode?.accentColor?.toLowerCase().trim() || 'bright-grey';
  return `var(--color-bright-${colorKey}, #ab92e1 )`;
};

const getDashArray = (edge: Edge) => {
  if (!isActive(edge)) return '8, 8';
  const style = edge.style || 'dashed';
  if (style === 'solid') return 'none';
  if (style === 'dotted') return '2, 6';
  return '8, 8';
};
</script>

<template>
  <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-10"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
  >
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <path
        v-for="(edge, index) in edges"
        :key="`edge-${edge.from}-${edge.to}-${index}`"
        :d="getPath(edge)"
        :stroke="getStrokeColor(edge)"
        :stroke-width="isActive(edge) ? '3' : '2'"
        fill="none"
        :stroke-dasharray="getDashArray(edge)"
        stroke-linecap="round"
        class="transition-all duration-700 ease-in-out"
        :opacity="isActive(edge) ? 1.0 : 0.15"
        :filter="isActive(edge) ? 'url(#glow)' : ''"
    />
  </svg>
</template>