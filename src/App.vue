<script setup lang="ts">
import { onMounted } from 'vue';
import { useUiStore } from './stores/useUiStore';

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
