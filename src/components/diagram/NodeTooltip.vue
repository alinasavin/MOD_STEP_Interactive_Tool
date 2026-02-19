<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-zinc-900/95 dark:bg-black/95 backdrop-blur-sm text-white text-[10px] leading-relaxed rounded-xl ring-1 ring-zinc-700 shadow-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover/step:opacity-100 transition-opacity duration-300 pointer-events-none z-40 text-left">
    <div class="relative">
      {{ text }}
      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-4 border-8 border-transparent border-t-zinc-900/95"></div>
    </div>
  </div>
</template>
