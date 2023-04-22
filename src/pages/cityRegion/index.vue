<template>
  <div class="cityRegion-page">
    <component :is="activeComponent[activeCompName]"></component>
  </div>
</template>

<script setup>
import floodingAnalysis from "./components/floodingAnalysis.vue";

const activeCompName = ref("floodingAnalysis");
const activeComponent = {
  floodingAnalysis,
};
</script>
