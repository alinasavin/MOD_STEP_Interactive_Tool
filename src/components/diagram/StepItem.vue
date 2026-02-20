<script setup lang="ts">
import type { DiagramStep } from '@/types/diagram.ts';
import NodeTooltip from './NodeTooltip.vue';

const props = defineProps<{
  step: DiagramStep;
  isActive: boolean;
  depth?: number;
  hoveredId: string | null;
}>();

const emit = defineEmits<{
  (e: 'updateHover', id: string | null): void;
}>();

const getStepColorClasses = (color?: string) => `accent-${color || 'white'}`;

const handleInteraction = (e: Event, isStarting: boolean) => {
  e.stopPropagation(); // Prevents parent nodes/steps from showing their tooltips
  if (props.isActive) {
    emit('updateHover', isStarting ? props.step.id : null);
  }
};
</script>

<template>
  <div
      class="relative group/step w-full outline-none"
      tabindex="0"
      role="button"
      :aria-label="`Step: ${step.label}. ${step.description}`"
      :aria-describedby="isActive && hoveredId === step.id ? `tooltip-${step.id}` : undefined"
      @mouseenter="handleInteraction($event, true)"
      @mouseleave="handleInteraction($event, false)"
      @focusin="handleInteraction($event, true)"
      @focusout="handleInteraction($event, false)"
  >
    <div
        class="border-2 rounded-xl transition-all duration-500 flex flex-col gap-3"
        :style="{
        borderColor: isActive ? 'var(--accent-color)' : '',
        color: isActive ? 'var(--accent-color)' : '',
        backgroundColor: isActive ? 'var(--accent-bg)' : '',
        padding: (depth || 0) > 0 ? '0.5rem' : '0.75rem'
      }"
        :class="[
        isActive ? getStepColorClasses(step.accentColor) : 'border-zinc-800 opacity-40',
        'focus-visible:ring-2 focus-visible:ring-white/30'
      ]"
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

      <NodeTooltip
          v-if="isActive && hoveredId === step.id && step.tooltipDescription"
          :id="`tooltip-${step.id}`"
          :text="step.tooltipDescription"
      />
    </div>
  </div>
</template>