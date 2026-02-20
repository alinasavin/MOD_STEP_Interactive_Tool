<script setup lang="ts">
import type { Edge, DiagramNode as Node } from '../../types/diagram';
import type { NodePosition } from '../../utils/diagramLayout';
import { getNodeVisualHeight } from '../../utils/diagramLayout';

const props = defineProps<{
  edges: Edge[];
  nodes: Node[];
  overviewNodes?: Node[];
  topNodes?: Node[];
  positions: NodePosition[];
  activeNodeIds: Set<string>;
  dimensions: { width: number; height: number };
}>();

const DEFAULT_NODE_WIDTH = 256;
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
  return getNodeVisualHeight(node);
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const getAnchorPoint = (nodeId: string, anchor: 'top' | 'bottom' | 'left' | 'right' | undefined, otherPos: { x: number, y: number }) => {
  const node = findNode(nodeId);
  const pos = getPos(nodeId);
  if (!node || !pos) return { x: 0, y: 0 };

  const w = node.width || DEFAULT_NODE_WIDTH;
  const h = getNodeHeight(node);
  const r = 32; // corner radius

  if (!anchor) {
    // Default logic if no anchor specified
    const dx = otherPos.x - pos.x;
    const dy = otherPos.y - pos.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      anchor = dx > 0 ? 'right' : 'left';
    } else {
      anchor = dy > 0 ? 'bottom' : 'top';
    }
  }

  switch (anchor) {
    case 'top':
      return { x: clamp(otherPos.x, pos.x - w / 2 + r, pos.x + w / 2 - r), y: pos.y - h / 2 };
    case 'bottom':
      return { x: clamp(otherPos.x, pos.x - w / 2 + r, pos.x + w / 2 - r), y: pos.y + h / 2 };
    case 'left':
      return { x: pos.x - w / 2, y: clamp(otherPos.y, pos.y - h / 2 + r, pos.y + h / 2 - r) };
    case 'right':
      return { x: pos.x + w / 2, y: clamp(otherPos.y, pos.y - h / 2 + r, pos.y + h / 2 - r) };
  }
};

const getPath = (edge: Edge) => {
  const fromPos = getPos(edge.from);
  const toPos = getPos(edge.to);
  if (!fromPos || !toPos) return '';

  const fromNode = findNode(edge.from);
  const toNode = findNode(edge.to);

  const start = getAnchorPoint(edge.from, edge.sourceAnchor, toPos);
  const end = getAnchorPoint(edge.to, edge.targetAnchor, fromPos);

  const routing = edge.routing || 'bezier';

  if (routing === 'straight') {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  if (routing === 'orthogonal') {
    const midY = (start.y + end.y) / 2;
    // Simple Z-shape
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
  }

  // Bezier (Default)
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const isVertical = Math.abs(dx) < 10;
  if (isVertical) {
    const vTension = Math.abs(dy) * 0.5;
    return `M ${start.x} ${start.y} C ${start.x} ${start.y + vTension * Math.sign(dy)}, ${end.x} ${end.y - vTension * Math.sign(dy)}, ${end.x} ${end.y}`;
  } else {
    const hTension = Math.min(100, Math.abs(dx) * 0.5);
    return `M ${start.x} ${start.y} C ${start.x + hTension * Math.sign(dx)} ${start.y}, ${end.x - hTension * Math.sign(dx)} ${end.y}, ${end.x} ${end.y}`;
  }
};

const isActive = (edge: Edge) => props.activeNodeIds.has(edge.from) && props.activeNodeIds.has(edge.to);

const getStrokeColor = (edge: Edge) => {
  if (!isActive(edge)) return '#27272a';
  if (edge.color) return `var(--color-bright-${edge.color.toLowerCase()}, #ab92e1)`;
  const fromNode = findNode(edge.from);
  const colorKey = fromNode?.accentColor?.toLowerCase().trim() || 'pink';
  return `var(--color-bright-${colorKey}, #ab92e1)`;
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

      <marker
          id="arrowhead"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
      </marker>
    </defs>

    <path
        v-for="(edge, index) in edges"
        :key="`edge-${edge.from}-${edge.to}-${index}`"
        :d="getPath(edge)"
        :stroke="getStrokeColor(edge)"
        :stroke-width="isActive(edge) ? '3' : '1.5'"
        fill="none"
        :stroke-dasharray="getDashArray(edge)"
        stroke-linecap="round"
        :marker-end="edge.showArrow !== false ? 'url(#arrowhead)' : ''"
        class="transition-all duration-700 ease-in-out"
        :opacity="isActive(edge) ? 1.0 : 0.2"
        :filter="isActive(edge) ? 'url(#glow)' : ''"
    />
  </svg>
</template>