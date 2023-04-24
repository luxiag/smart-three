<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'environment' ? 'use active' : 'use'"
        @click="switchComponent('environment')"
      >
      <!-- cesium 项目那个实现 -->
        区域人口管理
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        产业分布
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        能耗分析
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
