<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DiagramNode } from '@/types/diagram.ts';
import iconRegistry from '../../data/icons/icon-registry.json';
import NodeTooltip from './NodeTooltip.vue';
import StepItem from "./StepItem.vue";

const props = defineProps<{
  node: DiagramNode;
  x: number;
  y: number;
  isActive: boolean;
}>();

// Tracks specifically which ID is hovered (the node itself or a child step)
const hoveredId = ref<string | null>(null);

const iconPath = computed(() => {
  return props.node.iconKey ? (iconRegistry as Record<string, string>)[props.node.iconKey] : null;
});

const accentColor = computed(() => props.node.accentColor || 'white');
const colorClasses = computed(() => `accent-${accentColor.value}`);
const hasParallel = computed(() => props.node.parallelSteps && props.node.parallelSteps.length > 0);

// Only set hover to the node ID if the diagram is active
const handleNodeMouseEnter = () => {
  if (props.isActive) {
    hoveredId.value = props.node.id;
  }
};

const handleMouseLeave = () => {
  hoveredId.value = null;
};

// This function is passed to children to update the shared hover state
const updateHover = (id: string | null) => {
  hoveredId.value = id;
};
</script>

<template>
  <div
      class="absolute -translate-x-1/2 -translate-y-1/2 group diagram-node transition-all z-[100] duration-1000"
      @mouseenter="handleNodeMouseEnter"
      @mouseleave="handleMouseLeave"
      :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: node.width ? `${node.width}px` : '16rem',
      '--node-accent': `var(--color-bright-${accentColor})`,
      zIndex: hoveredId ? 100 : 20
    }"
      :class="[isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none']"
  >
    <div
        class="w-full p-5 bg-zinc-950/90 backdrop-blur-md border-2 rounded-4xl text-left relative transition-all duration-500 shadow-2xl"
        :style="{
        borderColor: isActive ? 'var(--accent-color)' : '',
        color: isActive ? 'var(--accent-color)' : '',
        boxShadow: isActive ? `0 10px 15px -3px var(--accent-glow)` : '',
        backgroundColor: isActive ? 'var(--accent-bg)' : ''
      }"
        :class="[colorClasses, isActive ? 'animate-node-in' : '']"
    >
      <!-- restored Info Icon -->
      <div v-if="node.tooltipDescription" class="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 opacity-60">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Node Header -->
      <div class="flex items-center gap-4 mb-1">
        <div
            class="p-2.5 rounded-xl border-2 transition-colors shrink-0"
            :class="isActive ? colorClasses : 'bg-zinc-900 border-zinc-800 text-zinc-600'"
        >
          <svg v-if="iconPath" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath" />
          </svg>
        </div>
        <div>
          <div v-if="node.label" class="text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors" :class="isActive ? 'text-inherit' : 'text-zinc-500'">
            {{ node?.label }}
          </div>
          <p v-if="node.description" class="text-sm font-bold text-white leading-tight mb-0">{{ node?.description }}</p>
        </div>
      </div>

      <!-- Steps Content Area -->
      <div v-if="(node.steps && node.steps.length > 0) || hasParallel" class="mt-4 pt-4 border-t border-zinc-800">
        <div
            class="grid gap-4"
            :class="hasParallel ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Primary Column -->
          <div class="space-y-3">
            <StepItem
                v-for="step in node.steps"
                :key="step.id"
                :step="step"
                :isActive="isActive"
                :hoveredId="hoveredId"
                @update-hover="updateHover"
            />
          </div>

          <!-- Parallel Column -->
          <div v-if="hasParallel" class="space-y-3">
            <StepItem
                v-for="step in node.parallelSteps"
                :key="step.id"
                :step="step"
                :isActive="isActive"
                :hoveredId="hoveredId"
                @update-hover="updateHover"
            />
          </div>
        </div>
      </div>

      <!-- Main Node Tooltip: Only shows if the specific hovered target is the Node ID -->
      <NodeTooltip
          v-if="isActive && hoveredId === node.id && node.tooltipDescription"
          :text="node.tooltipDescription"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes node-in {
  0% { transform: scale(0.9) translateY(10px); opacity: 0; }
  70% { transform: scale(1.05) translateY(-2px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.animate-node-in {
  animation: node-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>