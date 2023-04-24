<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'environment' ? 'use active' : 'use'"
        @click="switchComponent('environment')"
      >
        水淹分析
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        虚拟显示
        <!-- vr全景 -->
      </div>
    </template>
    <template v-slot:right> </template>
    <template v-slot:center>
      <component :is="activeComponent[activeCompName]"></component>
    </template>
  </container>
</template>

<script setup>
import container from "@/components/container.vue";

import floodingAnalysis from "./components/floodingAnalysis.vue";

const activeCompName = ref("floodingAnalysis");
const activeComponent = {
  floodingAnalysis,
};
</script>
