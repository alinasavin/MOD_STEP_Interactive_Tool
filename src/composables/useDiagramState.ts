import { useDiagramStore } from '../stores/useDiagramStore';
import { storeToRefs } from 'pinia';

export function useDiagramState() {
  const diagramStore = useDiagramStore();
  const { currentDiagram, activeNodeIds } = storeToRefs(diagramStore);

  return {
    diagram: currentDiagram,
    activeNodeIds,
    setDiagram: diagramStore.setDiagram,
    activate: diagramStore.activateNodes,
    reset: diagramStore.reset,
  };
}
