<script setup lang="ts">
import { computed } from 'vue';
import type { Edge, DiagramNode as Node } from '../../types/diagram';
import type { NodePosition } from '../../utils/diagramLayout';

const props = defineProps<{
  edges: Edge[];
  nodes: Node[];
  positions: NodePosition[];
  activeNodeIds: Set<string>;
  dimensions: { width: number; height: number };
}>();

const NODE_WIDTH = 256;
const BASE_NODE_HEIGHT = 100;
const STEP_NODE_HEIGHT = 180;

const getPos = (id: string) => props.positions.find(p => p.id === id);
const findNode = (id: string) => props.nodes.find(n => n.id === id);

const getNodeHeight = (node?: Node) => {
  if (!node) return BASE_NODE_HEIGHT;
  return (node.steps && node.steps.length > 0) ? STEP_NODE_HEIGHT : BASE_NODE_HEIGHT;
};

const getPath = (edge: Edge) => {
  const fromPos = getPos(edge.from);
  const toPos = getPos(edge.to);
  if (!fromPos || !toPos) return '';

  const fromNode = findNode(edge.from);
  const toNode = findNode(edge.to);

  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;

  // 1. STRICT OVERVIEW CHECK: Only use Top/Bottom anchors if one node is 'overview'
  const isOverviewConnection = fromNode?.role === 'overview' || toNode?.role === 'overview';

  if (isOverviewConnection) {
    const fromH = getNodeHeight(fromNode) / 2;
    const toH = getNodeHeight(toNode) / 2;

    // Anchor to middle-top or middle-bottom
    const sX = fromPos.x;
    const sY = dy < 0 ? fromPos.y - fromH : fromPos.y + fromH;
    const eX = toPos.x;
    const eY = dy < 0 ? toPos.y + toH : toPos.y - toH;

    // Use vertical tension for the loop-back
    const vTension = Math.abs(dy) * 0.5;
    return `M ${sX} ${sY} C ${sX} ${sY + (dy > 0 ? vTension : -vTension)}, ${eX} ${eY - (dy > 0 ? vTension : -vTension)}, ${eX} ${eY}`;
  }

  // 2. STANDARD FLOW & TREE LOGIC (Side-to-Side)
  else {
    const dir = Math.sign(dx) || 1;
    const halfW = NODE_WIDTH / 2;

    // Standard Side-to-Side Anchors
    const sX = fromPos.x + (halfW * dir);
    const sY = fromPos.y;
    const eX = toPos.x - (halfW * dir);
    const eY = toPos.y;

    // THE CLEAN TREE FIX:
    // Set control points to the midpoint of X.
    // This creates a perfect, balanced "S" curve for tree branches.
    const midX = sX + (dx - (NODE_WIDTH * dir)) / 2;

    // 1px bulge fix for perfectly horizontal lines
    const isHorizontal = Math.abs(dy) < 1;
    const ctrlY1 = isHorizontal ? sY - 1 : sY;
    const ctrlY2 = isHorizontal ? eY + 1 : eY;

    return `M ${sX} ${sY} C ${midX} ${ctrlY1}, ${midX} ${ctrlY2}, ${eX} ${eY}`;
  }
};

const isActive = (edge: Edge) => props.activeNodeIds.has(edge.from) && props.activeNodeIds.has(edge.to);

const getStrokeColor = (edge: Edge) => {
  if (!isActive(edge)) return '#27272a';
  if (edge.color) return `var(--color-accent-${edge.color.toLowerCase()}, #ec4899)`;
  const fromNode = findNode(edge.from);
  const colorKey = fromNode?.accentColor?.toLowerCase().trim() || 'pink';
  return `var(--color-accent-${colorKey}, #ec4899)`;
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