<template>
  <div class="screen">
    <div class="screen-left">
      <div class="left-container">
        <slot name="left"></slot>
      </div>
      <div class="use-list">
        <slot name="left-use"></slot>
      </div>
    </div>
    <div class="screen-right">
      <slot name="right"></slot>
    </div>
    <div class="screen-center">
      <slot name="center"></slot>
    </div>
  </div>
</template>
<script setup></script>
<style scoped lang="less">
.screen {
  width: 100%;
  height: 100%;
  position: relative;
  .screen-center {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .screen-left {
    padding-top: 90px;
    position: absolute;
    z-index: 11;
  }
}
</style>
