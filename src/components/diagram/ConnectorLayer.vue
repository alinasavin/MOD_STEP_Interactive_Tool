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

const getNodeHeightOriginal = (node?: Node) => {
  if (!node) return BASE_NODE_HEIGHT;
  const hasSteps = (node.steps && node.steps.length > 0) || (node.parallelSteps && node.parallelSteps.length > 0);
  return hasSteps ? STEP_NODE_HEIGHT : BASE_NODE_HEIGHT;
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const getAnchorPoint = (nodeId: string, anchor: 'top' | 'bottom' | 'left' | 'right' | undefined, otherPos: { x: number, y: number }) => {
  const node = findNode(nodeId);
  const pos = getPos(nodeId);
  if (!node || !pos) return { x: 0, y: 0 };

  const w = node.width || DEFAULT_NODE_WIDTH;
  const h = node.variant === 'text' ? 40 : getNodeVisualHeight(node);
  const r = node.variant === 'text' ? 0 : 32; // corner radius

  if (!anchor) {
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

  // Handle same position (Zero-length connector or self-loop)
  if (fromPos.x === toPos.x && fromPos.y === toPos.y) {
    // Force distinct anchors if nodes share position
    const sAnchor = edge.sourceAnchor || 'top';
    const tAnchor = edge.targetAnchor || 'right';

    // Mock "otherPos" to get correct anchor points on the same node
    const start = getAnchorPoint(edge.from, sAnchor, {
      x: fromPos.x + (sAnchor === 'left' ? -100 : sAnchor === 'right' ? 100 : 0),
      y: fromPos.y + (sAnchor === 'top' ? -100 : sAnchor === 'bottom' ? 100 : 0)
    });
    const end = getAnchorPoint(edge.to, tAnchor, {
      x: fromPos.x + (tAnchor === 'left' ? -100 : tAnchor === 'right' ? 100 : 0),
      y: fromPos.y + (tAnchor === 'top' ? -100 : tAnchor === 'bottom' ? 100 : 0)
    });

    // Control point for a nice arc that goes outward
    const cpX = (sAnchor === 'right' || tAnchor === 'right') ? Math.max(start.x, end.x) + 80 :
               (sAnchor === 'left' || tAnchor === 'left') ? Math.min(start.x, end.x) - 80 : (start.x + end.x) / 2 + 40;
    const cpY = (sAnchor === 'top' || tAnchor === 'top') ? Math.min(start.y, end.y) - 80 :
               (sAnchor === 'bottom' || tAnchor === 'bottom') ? Math.max(start.y, end.y) + 80 : (start.y + end.y) / 2 - 40;

    return `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;
  }

  // Use new precision logic if routing or anchors are specified
  if (edge.routing || edge.sourceAnchor || edge.targetAnchor) {
    const start = getAnchorPoint(edge.from, edge.sourceAnchor, toPos);
    const end = getAnchorPoint(edge.to, edge.targetAnchor, fromPos);

    if (edge.routing === 'straight') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    if (edge.routing === 'orthogonal') {
      // Create a Z-shape or L-shape
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      if (edge.sourceAnchor === 'bottom' && edge.targetAnchor === 'right') {
         // Special case for Innovation -> Enabling/TE
         return `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
      }

      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
    }

    // Default to Bezier but with precision anchors
    const hTension = Math.min(100, Math.abs(end.x - start.x) * 0.5);
    const dx = end.x - start.x;
    return `M ${start.x} ${start.y} C ${start.x + hTension * Math.sign(dx)} ${start.y}, ${end.x - hTension * Math.sign(dx)} ${end.y}, ${end.x} ${end.y}`;
  }

  // ORIGINAL LOGIC for backward compatibility
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;

  const isLayerConnection = fromNode?.role === 'overview' || fromNode?.role === 'top' ||
      toNode?.role === 'overview' || toNode?.role === 'top';

  if (isLayerConnection) {
    const fromH = getNodeHeightOriginal(fromNode) / 2;
    const toH = getNodeHeightOriginal(toNode) / 2;

    const sX = fromPos.x;
    const sY = dy > 0 ? fromPos.y + fromH : fromPos.y - fromH;
    const eX = toPos.x;
    const eY = dy > 0 ? toPos.y - toH : toPos.y + toH;

    const vTension = Math.abs(dy) * 0.5;
    const isVertical = Math.abs(dx) < 1;
    const cp1x = isVertical ? sX + 1 : sX;
    const cp2x = isVertical ? eX - 1 : eX;
    const cp1y = dy > 0 ? sY + vTension : sY - vTension;
    const cp2y = dy > 0 ? eY - vTension : eY + vTension;

    return `M ${sX} ${sY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${eX} ${eY}`;
  } else {
    const dir = Math.sign(dx) || 1;
    const fromW = fromNode?.width || DEFAULT_NODE_WIDTH;
    const toW = toNode?.width || DEFAULT_NODE_WIDTH;

    const sX = fromPos.x + (fromW / 2 * dir);
    const sY = fromPos.y;
    const eX = toPos.x - (toW / 2 * dir);
    const eY = toPos.y;

    const gapX = Math.abs(eX - sX);
    const shoulder = Math.min(30, gapX * 0.4);
    const cp1x = sX + (shoulder * dir);
    const cp2x = eX - (shoulder * dir);

    const isHorizontal = Math.abs(dy) < 1;
    const ctrlY1 = isHorizontal ? sY - 1 : sY;
    const ctrlY2 = isHorizontal ? eY + 1 : eY;

    return `M ${sX} ${sY} C ${cp1x} ${ctrlY1}, ${cp2x} ${ctrlY2}, ${eX} ${eY}`;
  }
};

const isActive = (edge: Edge) => props.activeNodeIds.has(edge.from) && props.activeNodeIds.has(edge.to);

const getStrokeColor = (edge: Edge) => {
  if (!isActive(edge)) return '#27272a';
  if (edge.color) {
     if (edge.color.startsWith('#')) return edge.color;
     if (edge.color === 'black') return '#000000';
     return `var(--color-bright-${edge.color.toLowerCase()}, #ab92e1)`;
  }
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
      class="absolute inset-0 w-full h-full pointer-events-none z-30"
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
        :marker-end="edge.showArrow ? 'url(#arrowhead)' : ''"
        class="transition-all duration-700 ease-in-out"
        :opacity="isActive(edge) ? 1.0 : 0.2"
        :filter="isActive(edge) ? 'url(#glow)' : ''"
    />
  </svg>
</template>