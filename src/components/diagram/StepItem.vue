<script setup lang="ts">
import { ref } from 'vue';
import type { DiagramStep } from '@/types/diagram.ts';
import NodeTooltip from './NodeTooltip.vue';

const props = defineProps<{
  step: DiagramStep;
  isActive: boolean;
}>();

const isHovered = ref(false);

const getStepColorClasses = (color?: string) => `accent-${color || 'white'}`;
</script>

<template>
  <div class="relative group/step">
    <!--
      The Step Box
      @mouseenter.stop ensures that hovering a step doesn't
      also trigger the main node's tooltip.
    -->
    <div
        @mouseenter.stop="isHovered = true"
        @mouseleave="isHovered = false"
        class="p-3 border-2 rounded-2xl transition-all duration-500 cursor-help"
        :style="{
        borderColor: isActive ? 'var(--accent-color)' : '',
        color: isActive ? 'var(--accent-color)' : '',
        backgroundColor: isActive ? 'var(--accent-bg)' : ''
      }"
        :class="[isActive ? getStepColorClasses(step.accentColor) : 'border-zinc-800 opacity-40']"
    >
      <!-- Info Icon (for main node) -->
      <div v-if="step.tooltipDescription" class="absolute top-2 right-2 text-zinc-600 dark:text-zinc-400 opacity-60">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="text-[8px] font-black uppercase tracking-[0.15em] mb-0.5">
        {{ step.label }}
      </div>
      <div class="text-xs font-semibold text-white leading-tight">
        {{ step.description }}
      </div>

      <!-- Tooltip only shows if this specific step is hovered -->
      <NodeTooltip
          v-if="isActive && isHovered && step.tooltipDescription"
          :text="step.tooltipDescription"
      />
    </div>

    <!-- Recursive Sub-steps -->
    <div
        v-if="step.subSteps && step.subSteps.length > 0"
        class="mt-2 ml-4 pl-3 border-l border-zinc-800 space-y-2"
    >
      <StepItem
          v-for="sub in step.subSteps"
          :key="sub.id"
          :step="sub"
          :isActive="isActive"
      />
    </div>
  </div>
</template>