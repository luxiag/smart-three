<template>
  <div class="left">
    <div class="left-container"></div>
    <div class="use-list">
      <div
        :class="activeCompName == 'environment' ? 'use active' : 'use'"
        @click="switchComponent('environment')"
      >
        行政规划
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        生态环境
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        分析
      </div>
    </div>
  </div>
  <div class="right"></div>
  <div class="center">
    <component :is="activeComponent[activeCompName]"></component>
  </div>
</template>
<script setup>
import environment from "./components/environment.vue";
import regionalPopulation from "./components/regionalPopulation.vue";
import terrain from "./components/terrain.vue";
const activeCompName = ref("terrain");
const activeComponent = {
  environment,
  regionalPopulation,
  terrain,
};

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};
</script>
<style scoped lang="less">
.left {
  padding-top: 90px;
  position: absolute;
  z-index: 11;
  .use-list {
    padding: 20px;
    .use {
      position: relative;
      margin: 10px 0;
      padding: 1px 5px;
      cursor: pointer;
      &:hover {
        background: #5d838f;
      }
      &.active {
        background: #5d838f;
      }
    }
    .use::after {
      content: "";
      position: absolute;
      top: 0;
      left: -1px;
      width: 100%;
      /* box-shadow: 0px 3px 0px 0px rgba(0, 0, 0, 0.2); */
      height: 100%;
      border: 1px solid #fff;
      background: rgba(29, 53, 56, 0.6);
      background: linear-gradient(left right, #404435, transparent);
      transform: skew(-20deg);
      box-shadow: 0 1px 5px #fff;
      border-right: none;
      text-shadow: 0 0 20px #29b6f6;
      // border-image: linear-gradient(45deg, #fff, #7dd1d9) 1;
      z-index: -1;
    }
    .active.use::after {
      background: #5d838f;
    }
  }
}
.center {
  position: relative;
  .use-list {
    position: absolute;
  }
}
</style>
