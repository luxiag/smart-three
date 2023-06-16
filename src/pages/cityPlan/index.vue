<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'landUse' ? 'use active' : 'use'"
        @click="switchComponent('landUse')"
      >
        用地总览
      </div>
      <div
        :class="activeCompName == 'topographicOverview' ? 'use active' : 'use'"
        @click="switchComponent('topographicOverview')"
      >
        地形概况
      </div>
      <div
        :class="activeCompName == 'industryMap' ? 'use active' : 'use'"
        @click="switchComponent('industryMap')"
      >
        产业地图
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
import landUse from "./components/landUse.vue";
import topographicOverview from "./components/topographicOverview.vue";
import industryMap from "./components/industryMap.vue";

const activeCompName = ref("landUse");
const activeComponent = { landUse, topographicOverview, industryMap };

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};
</script>
<style scoped lang="less"></style>
