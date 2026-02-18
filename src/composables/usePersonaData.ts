import { ref } from 'vue';
import type { Persona } from '../types/persona';
import type { Diagram } from '../types/diagram';
import personasData from '../data/personas.json';

export function usePersonaData() {
  const personas = ref<Persona[]>(personasData as Persona[]);

  function getPersona(id: string): Persona | undefined {
    return personas.value.find(p => p.id === id);
  }

  async function loadDiagram(diagramId: string): Promise<Diagram> {
    const modules = import.meta.glob('../data/diagrams/*.json');
    const path = `../data/diagrams/${diagramId}.json`;
    if (modules[path]) {
      const data = await modules[path]();
      return (data as any).default;
    }
    throw new Error(`Diagram ${diagramId} not found`);
  }

  return { personas, getPersona, loadDiagram };
}
