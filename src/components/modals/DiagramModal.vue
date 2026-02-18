<script setup lang="ts">
import { useDiagramModal } from '../../composables/useDiagramModal';
import stepData from '../../data/step-diagram.json';

const { isOpen, close } = useDiagramModal();


</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6" @click="close">
    <div
        class="relative bg-zinc-950 border border-zinc-800 rounded-[3rem] shadow-2xl w-full max-w-[1600px] max-h-[95vh] overflow-y-auto p-10 custom-scrollbar"
        @click.stop
    >
      <!-- Close Button -->
      <button @click="close" class="absolute top-8 right-8 p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- ROW 1: 2/3 (8 cols) and 1/3 (4 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        <!-- Left 2/3 Column: Management & Integration stacked -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <!-- Management Card -->
          <div class="p-8 border-2 rounded-[2.5rem] flex-1 bg-[#D9D9D9]/20 border-white">
            <h4 class=" font-black mb-4  tracking-tight text-white">
              {{ stepData.management.title }}
            </h4>
            <div class="card-content" v-html="stepData.management.content"></div>
          </div>

          <!-- Integration Card -->
          <div class="p-8 border-2 rounded-[2.5rem] flex-1 bg-[#4DE364]/20">
            <h4 class="font-black mb-4  tracking-tight">
              {{ stepData.integration.title }}
            </h4>
            <div class="card-content" v-html="stepData.integration.content"></div>
          </div>
        </div>

        <!-- Right 1/3 Column: Innovation -->
        <div class="lg:col-span-4 flex flex-col">
          <div class="p-8 border-2 rounded-[2.5rem] h-full bg-accent-purple/20">
            <h4 class=" font-black mb-4  tracking-tight">
              {{ stepData.innovation.title }}
            </h4>
            <div class="card-content" v-html="stepData.innovation.content"></div>
          </div>
        </div>
      </div>

      <!-- ROW 2: Equal 3-way split (4 cols each) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- User Support -->
        <div class="lg:col-span-4 flex flex-col">
          <div class="p-8 border-2 rounded-[2.5rem] h-full bg-accent-pink/20">
            <h4 class="font-black mb-4  tracking-tight" >
              {{ stepData.userSupport.title }}
            </h4>
            <div class="card-content" v-html="stepData.userSupport.content"></div>
          </div>
        </div>

        <!-- T&E Services -->
        <div class="lg:col-span-4 flex flex-col">
          <div class="p-8 border-2 rounded-[2.5rem] h-full bg-accent-blue/20" >
            <h4 class=" font-black mb-4 tracking-tight" >
              {{ stepData.teServices.title }}
            </h4>
            <div class="card-content" v-html="stepData.teServices.content"></div>
          </div>
        </div>

        <!-- Enabling Services -->
        <div class="lg:col-span-4 flex flex-col">
          <div class="p-8 border-2 rounded-[2.5rem] h-full bg-accent-orange/20" >
            <h4 class=" mb-4 tracking-tight" >
              {{ stepData.enabling.title }}
            </h4>
            <div class="card-content" v-html="stepData.enabling.content"></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>


.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
</style>