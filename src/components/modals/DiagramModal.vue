<script setup lang="ts">
import { computed } from 'vue';
import { useDiagramModal } from '../../composables/useDiagramModal';
import DiagramCanvas from '../diagram/DiagramCanvas.vue';
import masterData from '../../data/full-framework.json';
import type { Diagram } from '../../types/diagram';

const { isOpen, close } = useDiagramModal();

/**
 * Computes a Set of all IDs in the Master JSON.
 * This ensures the entire diagram is highlighted in the modal reference.
 */
const allActiveIds = computed(() => {
  const ids = new Set<string>();
  const d = masterData as unknown as Diagram;

  const collect = (nodeList?: any[]) => nodeList?.forEach(n => ids.add(n.id));

  collect(d.nodes);
  collect(d.overviewNodes);
  collect(d.topNodes);

  return ids;
});
</script>

<template>
  <Teleport to="body">
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 lg:p-12 animate-in fade-in duration-300"
        @click="close"
    >
      <div
          class="relative w-full   rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500"
          @click.stop
      >
        <!-- Floating Close Button: z-index 110 to stay above everything -->
        <button
            @click="close"
            class="absolute top-8 right-8 z-[110] p-4 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all shadow-xl group cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- The Persona Diagram Engine -->
        <div class="w-full">
          <DiagramCanvas
              v-if="isOpen"
              :diagram="(masterData as any)"
              :activeNodeIds="allActiveIds"
              :showBanner="false"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>