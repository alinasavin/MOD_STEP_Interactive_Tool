<script setup lang="ts">
import { useDiagramModal } from '../../composables/useDiagramModal';
import fullDiagram from '../../assets/full_diagram.png';

const { isOpen, close } = useDiagramModal();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
    @click="close"
  >
    <div
      class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-4 w-[95vw] h-[95vh] max-w-7xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400 ease-out"
      @click.stop
    >
      <button
        @click="close"
        class="absolute top-3 right-3 z-10 p-2 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Close diagram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="w-full h-full overflow-auto rounded-lg">
        <img
          :src="fullDiagram"
          alt="Full STEP framework diagram"
          class="w-full h-auto object-contain"
        />
      </div>
    </div>
  </div>
</template>
