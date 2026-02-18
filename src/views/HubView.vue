<script setup lang="ts">
import { usePersonaData } from '../composables/usePersonaData';
import PageShell from '../components/layout/PageShell.vue';
import PersonaGrid from '../components/persona/PersonaGrid.vue';
import { useRouter } from 'vue-router';

const { personas } = usePersonaData();
const router = useRouter();

function selectPersona(id: string) {
  router.push({ name: 'persona', params: { personaId: id } });
}
</script>

<template>
  <PageShell>
    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black mb-4 text-zinc-900 dark:text-white">Choose Your Persona</h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">Select the persona that best describes your relationship with the STEP Process to access tailored tools and insights.</p>
      </div>

      <PersonaGrid :personas="personas" @select="selectPersona" />
    </div>
  </PageShell>
</template>
