<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { Diagram } from '../../types/diagram';
import { calculateNodePositions } from '../../utils/diagramLayout';
import DiagramNodeComponent from './DiagramNode.vue';
import ConnectorLayer from './ConnectorLayer.vue';
import DiagramBanner from './DiagramBanner.vue';
import { useDiagramStore } from '../../stores/useDiagramStore';

const props = defineProps<{
  diagram: Diagram;
  activeNodeIds: Set<string>;
  layoutOverride?: string;
}>();

const store = useDiagramStore();
const containerRef = ref<HTMLElement | null>(null);
const scrollBodyRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);

const updateDimensions = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth;
  }
};

onMounted(async () => {
  await nextTick();
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});

const layoutOptions = computed(() => props.diagram.layoutOptions || {});

const dynamicCanvasHeight = computed(() => {
  if (layoutOptions.value.canvasHeight) return layoutOptions.value.canvasHeight;
  if (containerWidth.value < 768) return 450; // md
  if (containerWidth.value < 1024) return 550; // lg
  return 650;
});

// Calculate content layout passing the current containerWidth
const diagramLayout = computed(() => {
  const diagWithLayout = { ...props.diagram, layout: (props.layoutOverride || props.diagram.layout) as any };

  // Use a virtual width of at least 1000 to ensure BFS doesn't clump
  const raw = calculateNodePositions(diagWithLayout, Math.max(containerWidth.value, 1000), 2000);
  if (raw.length === 0) return { positions: [], width: 0, height: 0 };

  const pX = layoutOptions.value.paddingX ?? 100;
  const pY = 40;

  const minX = Math.min(...raw.map(p => p.x));
  const maxX = Math.max(...raw.map(p => p.x));
  const minY = Math.min(...raw.map(p => p.y));
  const maxY = Math.max(...raw.map(p => p.y));

  const positions = raw.map(p => ({
    ...p,
    x: (p.x - minX) + pX + 128,
    y: (p.y - minY) + pY + 50
  }));

  return {
    positions,
    width: (maxX - minX) + 256 + (pX * 2),
    height: (maxY - minY) + 100 + (pY * 2)
  };
});

// --- DYNAMIC SCALING (Safety Zoom) ---
const scaleFactor = computed(() => {
  if (containerWidth.value === 0) return 1;
  const contentW = diagramLayout.value.width;
  const availableW = containerWidth.value - 60; // Internal padding safety

  if (contentW <= availableW) return 1;

  // Zoom out if too wide, but cap at 65% zoom for readability
  return Math.max(0.65, availableW / contentW);
});

// --- AUTO-FOLLOW PANNING (Cinematic Camera) ---
watch(() => props.activeNodeIds, (newIds) => {
  if (newIds.size === 0 || !scrollBodyRef.value) return;

  const lastActiveId = Array.from(newIds).pop();
  const pos = diagramLayout.value.positions.find(p => p.id === lastActiveId);

  if (pos) {
    nextTick(() => {
      const scrollContainer = scrollBodyRef.value;
      if (!scrollContainer) return;

      // 1. Calculate Horizontal Target (Centered)
      const scaledX = pos.x * scaleFactor.value;
      const targetX = scaledX - (containerWidth.value / 2);

      // 2. Calculate Vertical Target (Centered)
      // We use the same math for Y: (Node position * zoom) - (Half of container height)
      const scaledY = pos.y * scaleFactor.value;

      // We use containerRef's clientHeight to know how tall the black box is
      const viewportHeight = containerRef.value?.clientHeight || 500;
      const targetY = scaledY - (viewportHeight / 2);

      // 3. Perform the 2D Scroll
      scrollContainer.scrollTo({
        left: targetX,
        top: targetY, // Added vertical panning
        behavior: 'smooth'
      });
    });
  }
}, { deep: true });

const nodePositions = computed(() => diagramLayout.value.positions);
const contentDimensions = computed(() => ({ width: diagramLayout.value.width, height: diagramLayout.value.height }));
const getPosition = (id: string) => nodePositions.value.find(p => p.id === id);
</script>

<template>
  <div id="diagram-canvas-section" class="w-full pt-2">
    <div
        ref="containerRef"
        class="relative mx-auto w-full bg-zinc-950/20 rounded-[3rem] md:rounded-[4rem] border border-zinc-800/50 shadow-2xl flex flex-col overflow-hidden"
        :style="{ height: `${dynamicCanvasHeight}px` }"
    >
      <!-- BANNER SECTION: Static at top -->
      <div class="w-full flex justify-center pt-8 shrink-0 z-30 bg-linear-to-b from-zinc-950/40 to-transparent">
        <DiagramBanner :text="store.currentInstruction" :color="store.bannerColor" />
      </div>

      <!--
        SCROLLABLE BODY:
        - Added 'flex flex-col' so 'my-auto' on the child can calculate vertical centering.
      -->
      <div
          ref="scrollBodyRef"
          class="flex-1 w-full overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent flex flex-col"
      >
        <div
            class="relative transition-all duration-1000 my-auto shrink-0"
            :style="{
            width: `${contentDimensions.width}px`,
            height: `${contentDimensions.height}px`,
           marginLeft: (contentDimensions.width * scaleFactor) < containerWidth ? 'auto' : '0',
            marginRight: (contentDimensions.width * scaleFactor) < containerWidth ? 'auto' : '0',
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'center center'
          }"
        >
          <ConnectorLayer
              :edges="diagram.edges"
              :nodes="[...(diagram.overviewNodes || []), ...diagram.nodes]"
              :positions="nodePositions"
              :activeNodeIds="activeNodeIds"
              :dimensions="contentDimensions"
          />

          <template v-for="node in [...(diagram.overviewNodes || []), ...diagram.nodes]" :key="node.id">
            <DiagramNodeComponent
                v-if="getPosition(node.id)"
                :node="node"
                :x="getPosition(node.id)!.x"
                :y="getPosition(node.id)!.y"
                :isActive="activeNodeIds.has(node.id)"
            />
          </template>
        </div>

        <!-- Bottom Buffer for scroll comfort -->
        <div class="h-10 shrink-0"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { height: 6px; width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(63, 63, 70, 0.4); border-radius: 10px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.7); }
</style>