<script setup lang="ts">
import { onMounted } from 'vue';
import { useUiStore } from './stores/useUiStore';
import DiagramModal from "@/components/modals/DiagramModal.vue";

const uiStore = useUiStore();

onMounted(() => {
  uiStore.updateTheme();
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <DiagramModal />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
