import { MarkerType, type Node, type Edge, Position } from '@vue-flow/core'
import type { Diagram, Edge as DiagramEdge } from '../types/diagram'
import { calculateNodePositions } from './diagramLayout'

export function transformToVueFlow(diagram: Diagram, activeNodeIds: Set<string>) {
  // Use a virtual width/height for layout calculation
  const positions = calculateNodePositions(diagram, 1200, 800)

  const allNodes = [
    ...(diagram.topNodes || []),
    ...(diagram.overviewNodes || []),
    ...diagram.nodes
  ]

  const vfNodes: Node[] = allNodes.map((node) => {
    const pos = positions.find((p) => p.id === node.id)
    let nodeWidth = node.width || 256;
    if (node.role === 'top' || node.role === 'overview') {
      nodeWidth = 1100; // Match the image's wide top section
    }

    return {
      id: node.id,
      type: 'custom',
      position: pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 },
      data: {
        ...node,
        width: nodeWidth,
        isActive: activeNodeIds.has(node.id)
      }
    }
  })

  // Add external nodes to match the image exactly
  const entryPos = positions.find(p => p.id === diagram.entryNodeId) || { x: 0, y: 0 }
  const topPos = positions.find(p => p.id === 'management-services') || positions[0] || { x: 0, y: 0 }

  vfNodes.push({
    id: 'ext-change-drivers',
    type: 'custom',
    position: { x: topPos.x - 650, y: topPos.y },
    data: {
      id: 'ext-change-drivers',
      label: 'EXTERNAL CHANGE DRIVERS',
      accentColor: 'orange',
      role: 'entry',
      width: 150,
      isActive: true
    }
  })

  vfNodes.push({
    id: 'ext-users-suppliers',
    type: 'custom',
    position: { x: entryPos.x - 300, y: entryPos.y },
    data: {
      id: 'ext-users-suppliers',
      label: 'USERS & SUPPLIERS',
      accentColor: 'white',
      role: 'entry',
      width: 150,
      isActive: true
    }
  })

  // Augment edges to match the image if they are missing
  const combinedEdges: DiagramEdge[] = [...diagram.edges]
  const essentialEdges = [
    { from: 'user-support', to: 'integration-services', style: 'solid' },
    { from: 'integration-services', to: 'user-support', style: 'solid' },
    { from: 'te-services-main', to: 'integration-services', style: 'solid' },
    { from: 'integration-services', to: 'te-services-main', style: 'solid' },
    { from: 'enabling-services', to: 'integration-services', style: 'solid' },
    { from: 'integration-services', to: 'enabling-services', style: 'solid' },
    { from: 'management-services', to: 'innovation-services', style: 'solid' },
    { from: 'innovation-services', to: 'integration-services', style: 'solid', color: 'purple' },
    { from: 'innovation-services', to: 'enabling-services', style: 'solid', color: 'purple' }
  ]

  essentialEdges.forEach((ee) => {
    if (!combinedEdges.find(e => e.from === ee.from && e.to === ee.to)) {
      combinedEdges.push(ee as DiagramEdge)
    }
  })

  const vfEdges: Edge[] = combinedEdges.map((edge, index) => {
    const fromNode = allNodes.find(n => n.id === edge.from)
    const toNode = allNodes.find(n => n.id === edge.to)
    let colorKey = edge.color || fromNode?.accentColor || 'pink'

    // Match image colors for top-level services
    if ((fromNode?.role === 'top' && toNode?.role === 'overview') || (fromNode?.role === 'overview' && toNode?.role === 'top')) {
      colorKey = 'green'
    }
    const isActive = activeNodeIds.has(edge.from) && activeNodeIds.has(edge.to)

    // Determine handle positions and IDs based on roles to match image routing
    let sourcePosition: Position | undefined
    let targetPosition: Position | undefined
    let sourceHandle: string | undefined
    let targetHandle: string | undefined

    if (fromNode?.role === 'overview' && (toNode?.role === 'entry' || toNode?.role === 'step')) {
       sourcePosition = Position.Bottom
       sourceHandle = 'bottom-source'
       targetPosition = Position.Top
       targetHandle = 'top-target'
    } else if ((fromNode?.role === 'entry' || fromNode?.role === 'step') && toNode?.role === 'overview') {
       sourcePosition = Position.Top
       sourceHandle = 'top-source'
       targetPosition = Position.Bottom
       targetHandle = 'bottom-target'
    } else if (fromNode?.role === 'top' && toNode?.role === 'overview') {
       // Green -> Grey
       sourcePosition = Position.Bottom
       sourceHandle = 'bottom-source'
       targetPosition = Position.Top
       targetHandle = 'top-target'
    } else if (fromNode?.role === 'overview' && toNode?.role === 'top') {
       // Grey -> Green
       sourcePosition = Position.Top
       sourceHandle = 'top-source'
       targetPosition = Position.Bottom
       targetHandle = 'bottom-target'
    } else if (toNode?.id === 'innovation-services') {
       sourcePosition = Position.Right
       sourceHandle = 'right-source'
       targetPosition = Position.Left
       targetHandle = 'left-target'
    } else if (fromNode?.id === 'innovation-services') {
       sourcePosition = Position.Left
       sourceHandle = 'left-source'
       targetPosition = Position.Right
       targetHandle = 'right-target'
    }

    return {
      id: `e-${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle,
      sourcePosition,
      targetPosition,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getColorValue(colorKey.toLowerCase()),
        width: 20,
        height: 20,
      },
      style: {
        stroke: getColorValue(colorKey.toLowerCase()),
        strokeWidth: isActive ? 3 : 1.5,
        opacity: isActive ? 1 : 0.2,
        strokeDasharray: edge.style === 'dashed' ? '8, 8' : edge.style === 'dotted' ? '2, 6' : 'none',
        transition: 'all 0.5s',
        filter: isActive ? 'url(#glow)' : 'none'
      }
    }
  })

  // Add edges for external nodes
  vfEdges.push({
    id: 'e-ext-drivers',
    source: 'ext-change-drivers',
    target: 'management-services',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    targetHandle: 'left-target',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: getColorValue('orange'), width: 20, height: 20 },
    style: { stroke: getColorValue('orange'), strokeWidth: 1.5, opacity: 1 }
  })

  vfEdges.push({
    id: 'e-ext-users',
    source: 'ext-users-suppliers',
    target: 'user-support',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    targetHandle: 'left-target',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ffffff', width: 20, height: 20 },
    style: { stroke: '#ffffff', strokeWidth: 1.5, opacity: 1 }
  })

  return { nodes: vfNodes, edges: vfEdges }
}

function getColorValue(colorKey: string) {
  const colors: Record<string, string> = {
    pink: '#f087cf',
    green: '#00ce7d',
    blue: '#3db5e6',
    orange: '#ff8200',
    purple: '#ab92e1',
    grey: '#becdd6',
    teal: '#00ce7d', // mapping teal to green if needed
  }
  return colors[colorKey] || '#ffffff'
}
