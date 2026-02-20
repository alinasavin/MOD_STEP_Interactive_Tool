<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { usePersonaData } from '../composables/usePersonaData';
import { useDiagramStore } from '../stores/useDiagramStore'; // Use Store instead of composable
import PageShell from '../components/layout/PageShell.vue';
import ScenarioSelector from '../components/diagram/ScenarioSelector.vue';
import VueFlowCanvas from '../components/diagram/VueFlowCanvas.vue';


const props = defineProps<{
  personaId: string;
}>();

const { getPersona, loadDiagram } = usePersonaData();
const diagramStore = useDiagramStore();

const persona = getPersona(props.personaId);
const selectedScenarioId = ref(
    persona?.scenarios.length === 1 ? persona.scenarios[0].id : ''
);

// Helper for smooth scrolling
const scrollToDiagram = () => {
  nextTick(() => {
    const el = document.getElementById('diagram-canvas-section');
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
};

const layoutMode = ref('hybrid');

async function updateDiagram() {
  const scenario = persona?.scenarios.find(s => s.id === selectedScenarioId.value);
  if (scenario) {
    const diag = await loadDiagram(scenario.diagramId);
    diagramStore.setDiagram(diag);
    layoutMode.value = diag.layout || 'hybrid';
  }
}

onMounted(async () => {
  if (selectedScenarioId.value) {
    // Case: 1 Scenario - Load and scroll immediately
    await updateDiagram();
    scrollToDiagram();
  } else {
    // Case: Multiple Scenarios - Ensure store is clean on entry
    diagramStore.reset();
  }
});

watch(selectedScenarioId, async (newVal) => {
  if (newVal) {
    await updateDiagram();
    scrollToDiagram();
  }
});
</script>

<template>
  <PageShell>
    <div v-if="persona" class="w-full px-6 py-12 animate-in fade-in duration-700">
      <div class="max-w-7xl mx-auto mb-10 text-center flex flex-col items-center">


        <h2 class="text-6xl font-black text-zinc-900 dark:text-white mb-6 leading-tight tracking-tighter">
          {{ persona.title }}
        </h2>

        <div class="flex flex-col items-center gap-8">
          <p class="text-zinc-500 dark:text-zinc-400 text-xl max-w-2xl font-light">
            {{ persona.description }}
          </p>

          <ScenarioSelector
              v-if="persona.scenarios.length > 1"
              v-model="selectedScenarioId"
              :scenarios="persona.scenarios"
          />

        </div>
      </div>

      <Transition
          enter-active-class="transition duration-1000 ease-out"
          enter-from-class="opacity-0 translate-y-10"
          enter-to-class="opacity-100 translate-y-0"
      >
        <VueFlowCanvas
            v-if="selectedScenarioId && diagramStore.currentDiagram"
            :diagram="diagramStore.currentDiagram"
            :activeNodeIds="diagramStore.activeNodeIds"
        />
      </Transition>
    </div>
  </PageShell>
</template>