<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        用地总览
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        地形概况
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        珠三角经济带
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        粤港澳经济
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

const activeCompName = ref("");
const activeComponent = {};

const switchComponent = (componentName) => {};
</script>
<style scoped lang="less"></style>
