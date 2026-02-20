export interface DiagramStep {
  id: string;
  label: string;
  description: string;
  iconKey?: string;
  accentColor?: string;
  tooltipDescription? : string;
  subSteps?: DiagramStep[];
}

export interface DiagramNode {
  id: string;
  label: string;
  description: string;
  iconKey: string | null;
  role: 'entry' | 'step' | 'end' | 'overview' | 'top';
  steps?: DiagramStep[];
  parallelSteps?: DiagramStep[];
  accentColor?: string;
  tooltipDescription?: string;
  width?: number;
  variant?: 'box' | 'text';
  manualX?: number;
  manualY?: number;
}

export interface Edge {
  from: string;
  to: string;
  style?: 'solid' | 'dotted' | 'dashed';
  color?: string;
  routing?: 'bezier' | 'orthogonal' | 'straight';
  sourceAnchor?: 'top' | 'bottom' | 'left' | 'right';
  targetAnchor?: 'top' | 'bottom' | 'left' | 'right';
  showArrow?: boolean;
}

export interface LayoutOptions {
  columnGap?: number;
  rowGap?: number;
  nodeMinWidth?: number;
  nodeMinHeight?: number;
  paddingX?: number;
  paddingY?: number;
  canvasHeight?: number;
  overviewGap?: number;
  topGap?: number;
}



export interface Diagram {
  id: string;
  layout: 'linear' | 'tree' | 'hybrid';
  layoutOptions?: LayoutOptions;
  entryNodeId: string;
  nodes: DiagramNode[];
  edges: Edge[];
  activationMode: 'all' | 'reachable';
  instruction: string;
  overviewNodes?: DiagramNode[];
  topNodes?: DiagramNode[];
}
