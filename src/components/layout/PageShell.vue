<script setup lang="ts">
import HeaderNav from './HeaderNav.vue';
import DiagramModal from '../modals/DiagramModal.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans overflow-x-hidden">
    <HeaderNav />
    <main class="flex-grow relative">
      <slot />
    </main>
    <footer class="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
      <p>&copy; {{ new Date().getFullYear() }} STEP Process Framework.</p>
    </footer>
    <DiagramModal />
  </div>
</template>
