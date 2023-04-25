<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'floodingAnalysis' ? 'use active' : 'use'"
        @click="switchComponent('floodingAnalysis')"
      >
        水淹分析
      </div>
      <div
        :class="activeCompName == 'virtualReality' ? 'use active' : 'use'"
        @click="switchComponent('virtualReality')"
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
import virtualReality from "./components/virtualReality.vue";

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};
const activeCompName = ref("virtualReality");
const activeComponent = {
  floodingAnalysis,
  virtualReality,
};
</script>
