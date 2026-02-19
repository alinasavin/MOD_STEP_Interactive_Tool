<script setup lang="ts">
defineProps<{
  text: string;
  color: string;
}>();
</script>

<template>
  <div v-if="text" class="flex justify-center mb-10 animate-in fade-in zoom-in duration-700">
    <div
        class="px-8 py-3 bg-zinc-950/50 backdrop-blur-md border-2 rounded-full transition-all duration-500"
        :style="{
        borderColor: `var(--color-bright-${color})`,
        boxShadow: `0 0 25px var(--color-bright-${color})`
      }"
    >
      <p
          class="text-[11px] font-black uppercase tracking-[0.3em] transition-colors duration-500"
          :style="{ color: `var(--color-bright-${color})` }"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>