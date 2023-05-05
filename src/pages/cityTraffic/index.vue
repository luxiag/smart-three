<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'routeDistribution' ? 'use active' : 'use'"
        @click="switchComponent('routeDistribution')"
      >
        路线分布
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        交通热力
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        交通预警
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
import routeDistribution from "./components/routeDistribution.vue";

const activeCompName = ref("routeDistribution");
const activeComponent = {
  routeDistribution
};






const switchComponent = (componentName) => {
  activeCompName.value = componentName
};
</script>
<style scoped lang="less"></style>
