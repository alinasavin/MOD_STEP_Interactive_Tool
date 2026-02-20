<script setup lang="ts">
import { computed } from 'vue';
import { useDiagramModal } from '../../composables/useDiagramModal';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '../../stores/useUiStore';
import { usePersonaData } from '../../composables/usePersonaData';
import { storeToRefs } from 'pinia';

const { open, isPulsing } = useDiagramModal();
const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const { isDark } = storeToRefs(uiStore);
const { getPersona } = usePersonaData();

const currentPersona = computed(() => {
  if (route.name === 'persona' && route.params.personaId) {
    return getPersona(route.params.personaId as string);
  }
  return null;
});

function goHome() {
  router.push({ name: 'home' });
}

function goHub() {
  router.push({ name: 'hub' });
}
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center px-6 justify-between transition-colors">
    <div class="flex items-center gap-4">
      <button @click="goHome" class="transition-opacity hover:opacity-80 flex items-center gap-2 cursor-pointer">
        <p class="text-xl mb-0 font-bold tracking-tight text-zinc-900 dark:text-white">
          STEP
        </p>
      </button>

      <template v-if="currentPersona">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {{ currentPersona.title }}
          </span>
          <button
            @click="goHub"
            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-full transition-all"
          >
            Switch Profile
          </button>
        </div>
      </template>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="uiStore.toggleTheme"
        class="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400"
        title="Toggle Theme"
      >
        <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <button
        @click="open"
        class="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group relative"
        :class="{ 'ring-2 ring-bright-pink shadow-[0_0_15px_rgba(236,72,153,0.5)]': isPulsing }"
        title="View Full Diagram"
      >
        <div class="w-5 h-5 flex flex-col gap-[2px] transition-transform duration-300 group-hover:scale-110" :class="{ 'animate-bounce': isPulsing }">
          <div class="flex items-start gap-[2px] h-[45%]">
            <div class="grow flex flex-col gap-0.5 h-full">
              <div class="h-1/2 bg-bright-green rounded-sm"></div>
              <div class="h-1/2 bg-bright-green rounded-sm"></div>
            </div>
            <div class="w-[28%] h-full bg-bright-purple rounded-sm flex-shrink-0"></div>
          </div>
          <div class="grid grid-cols-[2fr_3fr_2fr] gap-[2px] h-[55%]">
            <div class="bg-bright-pink rounded-sm"></div>
            <div class="bg-bright-blue rounded-sm"></div>
            <div class="bg-bright-orange rounded-sm"></div>
          </div>
        </div>
      </button>
    </div>
  </header>
</template>
