<template>
  <div class="left"></div>
  <div class="right"></div>
  <div class="center">
    <div class="use-list">
      <div class="use">行政规划</div>
      <div class="use">生态环境</div>
    </div>
    <component :is="activeComponent[activeCompName]"></component>
  </div>
</template>
<script setup>
import environment from "./environment.vue";
import regionalPopulation from "./regionalPopulation.vue";
const activeCompName = ref("regionalPopulation");
const activeComponent = {
  environment,
  regionalPopulation,
};
</script>
<style scoped lang="less">
.center {
  position: relative;
  .use-list {
    position: absolute;
  }
}
</style>