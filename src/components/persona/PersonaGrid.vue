<script setup lang="ts">
import type { Persona } from '../../types/persona';
import PersonaCard from './PersonaCard.vue';

defineProps<{
  personas: Persona[];
}>();

const emit = defineEmits<{
  (e: 'select', personaId: string): void;
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <PersonaCard
      v-for="persona in personas"
      :key="persona.id"
      :persona="persona"
      @select="emit('select', $event)"
    />
  </div>
</template>
