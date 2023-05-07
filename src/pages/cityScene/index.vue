<template>
  <container>
    <template v-slot:left> </template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'administrative' ? 'use active' : 'use'"
        @click="switchComponent('administrative')"
      >
        行政规划
      </div>
      <div
        :class="activeCompName == 'population' ? 'use active' : 'use'"
        @click="switchComponent('population')"
      >
        人口分布
      </div>
      <div
        :class="activeCompName == 'ecology' ? 'use active' : 'use'"
        @click="switchComponent('ecology')"
      >
        生态环境
      </div>
    </template>
    <template v-slot:right> </template>
    <template v-slot:center>
      <component :is="activeComponent[activeCompName]"></component>
    </template>
  </container>
</template>
<script setup>
import administrative from "./components/administrative.vue";
import ecology from "./components/ecology.vue";
import economics from "./components/economics.vue";
import population from "./component/population.vue";
import technological from "./component/technological.vue";

import container from "@/components/container.vue";

const activeCompName = ref("administrative");
const activeComponent = {
  administrative,
  ecology,
  economics,
  population,
  technological,
};

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};
</script>
<style scoped lang="less"></style>
