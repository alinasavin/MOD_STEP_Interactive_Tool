<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps<{
  text: string;
  id: string; // Unique ID for ARIA association
}>();

const trigger = ref<HTMLElement | null>(null);
const coords = ref({ top: 0, left: 0 });
const isVisible = ref(false);
const placement = ref<'top' | 'bottom'>('top');

const updatePosition = () => {
  if (!trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();

  // Flip logic: If the node is within 200px of the viewport top, show below it
  if (rect.top < 200) {
    placement.value = 'bottom';
    coords.value = {
      top: rect.bottom + 10,
      left: rect.left + (rect.width / 2)
    };
  } else {
    placement.value = 'top';
    coords.value = {
      top: rect.top - 10,
      left: rect.left + (rect.width / 2)
    };
  }
};

onMounted(() => {
  updatePosition();
  // 'true' for capture phase to catch scroll events inside the overflow container
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
  nextTick(() => { isVisible.value = true; });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<template>
  <!-- Invisible anchor used to track viewport position -->
  <div ref="trigger" class="absolute inset-0 pointer-events-none"></div>

  <Teleport to="body">
    <div
        v-if="isVisible"
        :id="id"
        role="tooltip"
        class="fixed z-[9999] pointer-events-none -translate-x-1/2 animate-in fade-in zoom-in duration-200"
        :class="placement === 'top' ? '-translate-y-full' : 'translate-y-0'"
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
        <div
            class="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-zinc-700 rotate-45"
            :class="placement === 'top'
            ? 'top-[calc(100%-7px)] border-r-2 border-b-2'
            : 'bottom-[calc(100%-7px)] border-l-2 border-t-2'"
        ></div>
      </div>
    </div>
  </Teleport>
</template>