import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Diagram } from '../types/diagram';

export const useDiagramStore = defineStore('diagram', () => {
  const currentDiagram = ref<Diagram | null>(null);
  const activeNodeIds = ref<Set<string>>(new Set());
  let cascadeTimeouts: number[] = [];

  // Logic: Simplified to show the main instruction
  const currentInstruction = computed(() => {
    return currentDiagram.value?.instruction || '';
  });

  // Keep your logic: Automatically find entry node's color to style the banner
  const bannerColor = computed(() => {
    if (!currentDiagram.value) return 'pink';
    const entryNode = currentDiagram.value.nodes.find(n => n.role === 'entry' || n.id === currentDiagram.value?.entryNodeId);
    return entryNode?.accentColor || 'pink';
  });

  function clearTimeouts() {
    cascadeTimeouts.forEach(t => window.clearTimeout(t));
    cascadeTimeouts = [];
  }

  function setDiagram(diagram: Diagram) {
    clearTimeouts();
    currentDiagram.value = diagram;
    activeNodeIds.value = new Set();

    // Combine all nodes so overview nodes also animate in
    const allNodes = [
      ...(diagram.topNodes || []),
      ...(diagram.overviewNodes || []),
      ...diagram.nodes
    ];

    allNodes.forEach((node, index) => {
      const timeout = window.setTimeout(() => {
        activeNodeIds.value.add(node.id);
        activeNodeIds.value = new Set(activeNodeIds.value);
      }, index * 400);
      cascadeTimeouts.push(timeout);
    });
  }

  function reset() {
    clearTimeouts();
    currentDiagram.value = null;
    activeNodeIds.value = new Set();
  }

  return {
    currentDiagram,
    activeNodeIds,
    currentInstruction,
    bannerColor,
    setDiagram,
    reset
  };
});