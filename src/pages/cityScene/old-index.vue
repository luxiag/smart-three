<template>
  <container>
    <template v-slot:left>

      
    </template>
    <template v-slot:left-use>
      <div
        :class="
          activeCompName == 'administrativePlanning' ? 'use active' : 'use'
        "
        @click="switchComponent('administrativePlanning')"
      >
        行政规划
      </div>
      <div
        :class="
          activeCompName == 'populationDistribution' ? 'use active' : 'use'
        "
        @click="switchComponent('populationDistribution')"
      >
        人口分布
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        生态环境
      </div>
    </template>
    <template v-slot:right> </template>
    <template v-slot:center>
      <component :is="activeComponent[activeCompName]"></component>
    </template>
  </container>
  <!-- <div class="left">
    <div class="left-container"></div>
    <div class="use-list">

    </div>
  </div>
  <div class="right"></div>
  <div class="center"></div> -->
</template>
<script setup>
import environment from "./components/environment.vue";
import administrativePlanning from "./components/administrativePlanning.vue";
import populationDistribution from "./components/populationDistribution.vue";
import container from "@/components/container.vue";

const activeCompName = ref("populationDistribution");
const activeComponent = {
  environment,
  administrativePlanning,
  populationDistribution,
};

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};
</script>
<style scoped lang="less"></style>
