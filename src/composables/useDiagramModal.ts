import { useUiStore } from '../stores/useUiStore';
import { storeToRefs } from 'pinia';

export function useDiagramModal() {
  const uiStore = useUiStore();
  const { isDiagramModalOpen, pulseFlag } = storeToRefs(uiStore);

  return {
    isOpen: isDiagramModalOpen,
    isPulsing: pulseFlag,
    open: uiStore.openModal,
    close: uiStore.closeModal,
  };
}
