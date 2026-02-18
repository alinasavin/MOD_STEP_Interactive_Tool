import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const isDiagramModalOpen = ref(false);
  const hasClosedOnce = ref(false);
  const pulseFlag = ref(false);

  const savedTheme = localStorage.getItem('theme');
  const isDark = ref(savedTheme ? savedTheme === 'dark' : true);

  function openModal() {
    isDiagramModalOpen.value = true;
  }

  function closeModal() {
    isDiagramModalOpen.value = false;
    if (!hasClosedOnce.value) {
      hasClosedOnce.value = true;
      triggerPulse();
    }
  }

  function triggerPulse() {
    pulseFlag.value = true;
    setTimeout(() => {
      pulseFlag.value = false;
    }, 2000);
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    updateTheme();
  }

  function updateTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return {
    isDiagramModalOpen,
    hasClosedOnce,
    pulseFlag,
    isDark,
    openModal,
    closeModal,
    toggleTheme,
    updateTheme
  };
});
