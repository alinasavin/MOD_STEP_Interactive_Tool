<script setup lang="ts">
import type { DiagramStep } from '@/types/diagram.ts';
import NodeTooltip from './NodeTooltip.vue';

const props = defineProps<{
  step: DiagramStep;
  isActive: boolean;
  depth?: number;
  hoveredId: string | null; // Track which ID is globally hovered in this node
}>();

const emit = defineEmits<{
  (e: 'updateHover', id: string | null): void;
}>();

const getStepColorClasses = (color?: string) => `accent-${color || 'white'}`;

const handleMouseEnter = (e: MouseEvent) => {
  e.stopPropagation();
  if (props.isActive) {
    emit('updateHover', props.step.id);
  }
};
</script>

<template>
  <div
      @mouseenter="handleMouseEnter"
      @mouseleave="emit('updateHover', null)"
      class="relative group/step w-full"
  >
    <div
        class="border-2 rounded-xl transition-all duration-500 flex flex-col gap-3"
        :style="{
        borderColor: isActive ? 'var(--accent-color)' : '',
        color: isActive ? 'var(--accent-color)' : '',
        backgroundColor: isActive ? 'var(--accent-bg)' : '',
        padding: (depth || 0) > 0 ? '0.5rem' : '0.75rem'
      }"
        :class="[isActive ? getStepColorClasses(step.accentColor) : 'border-zinc-800 opacity-40']"
    >
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <div class="text-[8px] font-black uppercase tracking-[0.15em] mb-0.5 opacity-80">
            {{ step.label }}
          </div>
          <div class="text-xs font-semibold text-white leading-tight">
            {{ step.description }}
          </div>
        </div>
        <div v-if="step.tooltipDescription" class="shrink-0 opacity-40">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Recursive Sub-steps -->
      <div v-if="step.subSteps && step.subSteps.length > 0" class="flex flex-col gap-2 pt-2 border-t border-white/10">
        <StepItem
            v-for="sub in step.subSteps"
            :key="sub.id"
            :step="sub"
            :isActive="isActive"
            :depth="(depth || 0) + 1"
            :hoveredId="hoveredId"
            @update-hover="(id) => emit('updateHover', id)"
        />
      </div>

      <!-- ONLY show tooltip if this specific ID is the one being hovered -->
      <NodeTooltip
          v-if="isActive && hoveredId === step.id && step.tooltipDescription"
          :text="step.tooltipDescription"
      />
    </div>
  </div>
</template>