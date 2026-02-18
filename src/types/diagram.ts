export interface DiagramStep {
  id: string;
  label: string;
  description: string;
  iconKey?: string;
  accentColor?: string;
  tooltipDescription? : string;
}

export interface DiagramNode {
  id: string;
  label: string;
  description: string;
  iconKey: string | null;
  role: 'entry' | 'step' | 'end' | 'overview';
  steps?: DiagramStep[];
  accentColor?: string;
  tooltipDescription?: string;
}

export interface Edge {
  from: string;
  to: string;
  style?: 'solid' | 'dotted' | 'dashed';
  color?: string;
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
}
