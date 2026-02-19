<script setup lang="ts">
import type { Scenario } from '../../types/persona';

defineProps<{
  scenarios: Scenario[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="grid grid-cols-1  gap-6 max-w-6xl mx-auto mb-20 justify-center"
  :class="scenarios.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-2'">
    <button
        v-for="scenario in scenarios"
        :key="scenario.id"
        @click="emit('update:modelValue', scenario.id)"
        class="group text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 bg-zinc-950/40 backdrop-blur-sm items-start flex"
        :class="[
        modelValue === scenario.id
          ? 'border-bright-grey shadow-[0_0_30px_rgba(190, 205, 214,0.2)] scale-[1.02]'
          : 'border-zinc-800 hover:border-zinc-700 opacity-70 hover:opacity-100'
      ]"
    >
<!--      <h3 class="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">-->
<!--        {{ scenario.label }}-->
<!--      </h3>-->
      <p class="text-white text-sm leading-relaxed font-light">
        {{ scenario.description }}
      </p>
    </button>
  </div>
</template>