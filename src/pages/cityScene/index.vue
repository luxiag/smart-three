<template>
  <div>cityScene</div>
  <div class="left"></div>
  <div class="right"></div>
  <div class="center">
    <component :is="activeComponent[activeCompName]"></component>
  </div>
</template>
<script setup>
import environment from "./environment.vue";
const activeCompName = ref("environment");
const activeComponent = {
  environment,
};
</script>
