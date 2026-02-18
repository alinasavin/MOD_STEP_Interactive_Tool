<script setup lang="ts">
import { computed } from 'vue';
import type { DiagramNode } from '../../types/diagram';
import iconRegistry from '../../data/icons/icon-registry.json';
import NodeTooltip from './NodeTooltip.vue';

const props = defineProps<{
  node: DiagramNode;
  x: number;
  y: number;
  isActive: boolean;
}>();


const iconPath = computed(() => {
  return props.node.iconKey ? (iconRegistry as Record<string, string>)[props.node.iconKey] : null;
});

const accentColor = computed(() => props.node.accentColor || 'pink');

const colorClasses = computed(() => `accent-${accentColor.value}`);

const getStepColorClasses = (color?: string) => `accent-${color || 'pink'}`;
</script>

<template>
  <div
    class="absolute -translate-x-1/2 -translate-y-1/2 group z-20 diagram-node"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      '--node-accent': `var(--color-accent-${accentColor})`
    }"

  :class="[
  isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
  ]"
  >
    <button
      class="w-64 p-5 bg-zinc-950/80 backdrop-blur-sm border-2 rounded-[2rem] text-left relative transition-all duration-500 hover:scale-[1.02] focus:outline-none"
      :style="{
        borderColor: isActive ? 'var(--accent-color)' : '',
        color: isActive ? 'var(--accent-color)' : '',
        boxShadow: isActive ? `0 10px 15px -3px var(--accent-glow)` : '',
        backgroundColor: isActive ? 'var(--accent-bg)' : ''
      }"
      :class="[
        colorClasses,
        isActive ? 'animate-node-in' : ''
      ]"
    >
      <!-- Info Icon -->
      <div v-if="node.tooltipDescription" class="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 opacity-60">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="flex items-center gap-4 mb-3">
        <div
          class="p-2.5 rounded-xl border-2 transition-colors flex-shrink-0"
          :class="isActive ? colorClasses : 'bg-zinc-900 border-zinc-800 text-zinc-600'"
        >
          <svg v-if="iconPath" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath" />
          </svg>
          <!-- Checkmark for active step nodes (except entry) -->
<!--          <div v-if="isActive && node.role !== 'entry'" class="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">-->
<!--             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">-->
<!--                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />-->
<!--             </svg>-->
<!--          </div>-->
        </div>
        <div>
           <div class="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 transition-colors" :class="isActive ? 'text-inherit' : 'text-zinc-500'">
             {{ node.label }}
           </div>
           <h4 class="text-sm font-bold text-white leading-tight">{{ node.description }}</h4>
        </div>
      </div>

      <!-- Internal Steps -->
      <div v-if="node.steps && node.steps.length > 0" class="mt-4 pt-4 border-t border-zinc-800 space-y-3">
         <div
           v-for="step in node.steps"
           :key="step.id"
           class="p-3 border-2 rounded-2xl relative group/step"
           :style="{
             borderColor: isActive ? 'var(--accent-color)' : '',
             color: isActive ? 'var(--accent-color)' : '',
             backgroundColor: isActive ? 'var(--accent-bg)' : ''
           }"
           :class="isActive ? getStepColorClasses(step.accentColor) : 'border-zinc-800 opacity-40'"
         >
            <div class="text-[8px] font-black uppercase tracking-[0.15em] mb-0.5">
              {{ step.label }}
            </div>
            <div class="text-xs font-semibold text-white">{{ step.description }}</div>

            <NodeTooltip v-if="isActive && step.tooltipDescription" :text="step.tooltipDescription" />
         </div>
      </div>

      <NodeTooltip v-if="node.tooltipDescription" :text="node.tooltipDescription" />
    </button>
  </div>
</template>

<style scoped>
/* Pop-in animation for the cascade effect */
@keyframes node-in {
  0% {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }
  70% {
    transform: scale(1.05) translateY(-2px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.animate-node-in {
  animation: node-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
