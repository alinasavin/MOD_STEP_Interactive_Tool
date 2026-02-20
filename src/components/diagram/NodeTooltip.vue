<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  text: string;
}>();

const trigger = ref<HTMLElement | null>(null);
const coords = ref({ top: 0, left: 0 });
const isVisible = ref(false);

const updatePosition = () => {
  if (!trigger.value) return;
  // Get the real-world position of the hidden 'trigger' div on the screen
  const rect = trigger.value.getBoundingClientRect();

  // Position the tooltip above the center of the element
  coords.value = {
    top: rect.top - 10, // 10px gap
    left: rect.left + (rect.width / 2)
  };
};

onMounted(() => {
  updatePosition();
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
  // Small delay to ensure scale animations have finished
  setTimeout(() => { isVisible.value = true; }, 10);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<template>
  <!-- This invisible div stays inside the node to mark the position -->
  <div ref="trigger" class="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 pointer-events-none"></div>

  <!-- This part is moved to the absolute root of the website -->
  <Teleport to="body">
    <div
        v-if="isVisible"
        class="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-200"
        :style="{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: '280px'
      }"
    >
      <div class="bg-zinc-900 border-2 border-zinc-700 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p class="text-xs text-zinc-200 leading-relaxed font-medium">
          {{ text }}
        </p>

        <!-- Arrow -->
        <div class="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r-2 border-b-2 border-zinc-700 rotate-45"></div>
      </div>
    </div>
  </Teleport>
</template>