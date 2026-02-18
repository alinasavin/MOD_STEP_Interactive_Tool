export interface Scenario {
  id: string;
  label: string;
  diagramId: string;
  description: string;
}

export interface Persona {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  ctaLabel: string;
  scenarios: Scenario[];
  iconKey: string;
  colorClass: string;
  banner?: {
    template: string;
    params: Record<string, string>;
  };
}
