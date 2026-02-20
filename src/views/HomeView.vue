<script setup lang="ts">
import { useDiagramModal } from '../composables/useDiagramModal';
import PageShell from '../components/layout/PageShell.vue';
import { useRouter } from 'vue-router';


const { open } = useDiagramModal();
const router = useRouter();

function enterHub() {
  router.push({ name: 'hub' });
  open();
}
</script>

<template>
  <PageShell>
    <div class="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div class="max-w-4xl w-full text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
<!--        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8">-->
<!--          <span class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>-->
<!--          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Framework Evolution 2026</span>-->
<!--        </div>-->

        <h1 class="font-black text-zinc-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
          Strategic Test and Evaluation Portfolio
        </h1>

        <p class="text-black dark:text-zinc-400 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          A synchronised T&E ecosystem designed to streamline
          <span class="text-pink-600 dark:text-pink-400 font-medium">capability testing</span>,
          empower <span class="text-blue-600 dark:text-blue-400 font-medium">service providers</span>, and accelerate <span class="text-purple-600 dark:text-purple-400 font-medium">data-driven innovation</span>.
        </p>

        <button
          @click="enterHub"
          class="group relative inline-flex cursor-pointer items-center justify-center px-12 py-5 font-bold transition-all duration-300 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:scale-105 active:scale-95 shadow-xl"
        >
          Enter the Hub
          <svg
            class="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  </PageShell>
</template>
