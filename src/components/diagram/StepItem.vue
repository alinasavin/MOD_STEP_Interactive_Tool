<script setup lang="ts">
import type { DiagramStep } from '../../types/diagram';
import NodeTooltip from './NodeTooltip.vue';

const props = defineProps<{
  step: DiagramStep;
  isActive: boolean;
}>();

const getStepColorClasses = (color?: string) => `accent-${color || 'white'}`;
</script>

<template>
  <div
      class="p-3 border-2 rounded-2xl relative group/step transition-all duration-500"
      :style="{
      borderColor: isActive ? 'var(--accent-color)' : '',
      color: isActive ? 'var(--accent-color)' : '',
      backgroundColor: isActive ? 'var(--accent-bg)' : ''
    }"
      :class="[
      isActive ? getStepColorClasses(step.accentColor) : 'border-zinc-800 opacity-40',
      // If it's a sub-step (nested), we might want it slightly smaller
    ]"
  >
    <div class="text-[8px] font-black uppercase tracking-[0.15em] mb-0.5">
      {{ step.label }}
    </div>
    <div class="text-xs font-semibold text-white leading-tight">
      {{ step.description }}
    </div>

    <!-- Recursive Sub-steps -->
    <div v-if="step.subSteps && step.subSteps.length > 0" class="mt-3 pl-3 border-l-2 border-zinc-800 space-y-2">
      <StepItem
          v-for="sub in step.subSteps"
          :key="sub.id"
          :step="sub"
          :isActive="isActive"
      />
    </div>

    <NodeTooltip v-if="isActive && step.tooltipDescription" :text="step.tooltipDescription" />
  </div>
</template>