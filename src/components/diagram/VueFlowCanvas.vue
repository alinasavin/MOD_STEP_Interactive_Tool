<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import type { Diagram } from '../../types/diagram';
import { transformToVueFlow } from '../../utils/vueFlowUtils';
import VueFlowNode from './VueFlowNode.vue';
import DiagramBanner from './DiagramBanner.vue';
import { useDiagramStore } from '../../stores/useDiagramStore';

const props = defineProps<{
  diagram: Diagram;
  activeNodeIds: Set<string>;
}>();

const store = useDiagramStore();

const elements = computed(() => transformToVueFlow(props.diagram, props.activeNodeIds));
const nodes = computed(() => elements.value.nodes);
const edges = computed(() => elements.value.edges);

const { onPaneReady, fitView, setCenter, findNode } = useVueFlow();

// --- AUTO-FOLLOW PANNING ---
watch(() => props.activeNodeIds, (newIds) => {
  if (newIds.size === 0) return;

  const lastActiveId = Array.from(newIds).pop();
  if (lastActiveId) {
    const node = findNode(lastActiveId);
    if (node) {
      // Smoothly center the active node
      setCenter(node.position.x + (node.dimensions.width / 2), node.position.y + (node.dimensions.height / 2), { duration: 800 });
    }
  }
}, { deep: true });

const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);

const updateDimensions = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth;
  }
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});

const layoutOptions = computed(() => props.diagram.layoutOptions || {});

const dynamicCanvasHeight = computed(() => {
  if (layoutOptions.value.canvasHeight) return layoutOptions.value.canvasHeight;
  if (containerWidth.value < 768) return 450;
  if (containerWidth.value < 1024) return 550;
  return 650;
});

onPaneReady(() => {
  fitView({ padding: 0.2 });
});
</script>

<template>
  <div
    id="diagram-canvas-section"
    ref="containerRef"
    class="w-full relative bg-zinc-950/20 rounded-[3rem] md:rounded-[4rem] border border-zinc-800/50 shadow-2xl flex flex-col overflow-hidden"
    :style="{ height: `${dynamicCanvasHeight}px` }"
  >
    <!-- BANNER SECTION: Static at top -->
    <div v-if="store.currentInstruction" class="w-full flex justify-center pt-8 shrink-0 z-30 bg-linear-to-b from-zinc-950/40 to-transparent">
      <DiagramBanner :text="store.currentInstruction" :color="store.bannerColor" />
    </div>

    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :fit-view-on-init="true"
      :prevent-scrolling="false"
      :default-edge-options="{ type: 'smoothstep', borderRadius: 15 }"
      class="vue-flow-custom"
    >
      <!-- Glow Filter Defs -->
      <svg style="position: absolute; width: 0; height: 0;">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      <template #node-custom="nodeProps">
        <VueFlowNode v-bind="nodeProps" />
      </template>
    </VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow-custom .vue-flow__node-custom {
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
}

.vue-flow-custom .vue-flow__edge-path {
  stroke-linecap: round;
}

.vue-flow-custom .vue-flow__attribution {
  display: none;
}

.vue-flow {
  width: 100%;
  height: 100%;
}
</style>
