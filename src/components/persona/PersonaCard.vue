<script setup lang="ts">
import type { Persona } from '../../types/persona';
import iconRegistry from '../../data/icons/icon-registry.json';

const props = defineProps<{
  persona: Persona;
}>();

const emit = defineEmits<{
  (e: 'select', personaId: string): void;
}>();

const iconPath = (iconRegistry as Record<string, string>)[props.persona.iconKey];
</script>

<template>
  <button
    @click="emit('select', persona.id)"
    class="group relative flex flex-col items-start p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-200 dark:hover:shadow-black overflow-hidden"
  >
    <!-- Background Glow -->
    <div
      class="absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full transition-opacity opacity-0 group-hover:opacity-20 dark:group-hover:opacity-40 pointer-events-none"
      :class="persona.colorClass.replace('text-', 'bg-')"
    ></div>

    <div
      class="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-all duration-300 group-hover:scale-110 group-hover:border-transparent"
      :class="persona.colorClass"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath" />
      </svg>
    </div>

    <h3 class="text-2xl font-bold mb-3 transition-colors" :class="persona.colorClass">
      {{ persona.title }}
    </h3>

    <p class="text-zinc-900 dark:text-zinc-100 text-lg mb-4 text-left font-semibold">
      {{ persona.description }}
    </p>

    <p class="text-zinc-500 dark:text-zinc-400 text-sm text-left leading-relaxed mb-8 flex-grow">
      {{ persona.longDescription }}
    </p>

    <div class="mt-auto flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-4" :class="persona.colorClass">
      {{ persona.ctaLabel }}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  </button>
</template>
