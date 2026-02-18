
export enum UserPersona {
  TE_USER = 'TE_USER',
  TE_SERVICE_PROVIDER = 'TE_SERVICE_PROVIDER',
  PORTFOLIO_MANAGER = 'PORTFOLIO_MANAGER'
}

export interface AppState {
  view: 'home' | 'selection' | 'dashboard' | 'innovation_outcome';
  selectedPersona: UserPersona | null;
}

export interface PersonaConfig {
  id: UserPersona;
  title: string;
  description: string;
  longDescription: string;
  colorClass: string;
  hoverColorClass: string;
  borderColorClass: string;
  icon: string;
}