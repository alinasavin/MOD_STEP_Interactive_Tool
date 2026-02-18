import type { Diagram } from '../types/diagram';

export function getInitialActiveNodes(diagram: Diagram): string[] {
  return diagram.entryNodeId ? [diagram.entryNodeId] : [];
}

export function getActivatedNodes(diagram: Diagram, clickedNodeId: string): string[] {
  if (clickedNodeId !== diagram.entryNodeId) return getInitialActiveNodes(diagram);

  // In all current cases, clicking entry activates everything according to instructions
  // "only entry node click activates rest"
  return diagram.nodes.map(n => n.id);
}
