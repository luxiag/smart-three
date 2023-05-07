<template>
  <div class="regional-population">
    <div
      id="regionalPopulationContainer"
      ref="regionalPopulationContainer"
    ></div>
  </div>
</template>
<script setup>
import * as Cesium from "cesium";
import { onMounted } from "vue";

let viewer;
const initMap = () => {
  viewer = new Cesium.Viewer("cesiumContainer", {
    // 是否显示信息窗口
    // infoBox: false,
    // 是否显示查询按钮
    geocoder: false,
    // 不显示home按钮
    homeButton: false,
    // 控制查看器的显示模式
    sceneModePicker: false,
    // 是否显示图层选择
    baseLayerPicker: false,
    // 是否显示帮助按钮
    navigationHelpButton: false,
    // 是否播放动画
    animation: false,
    // 是否显示时间轴
    timeline: false,
    // 是否显示全屏按钮
    fullscreenButton: false,
    shouldAnimate: true,
  });

  // 设置沙箱允许使用js
  var iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0];
  iframe.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-popups allow-forms"
  );
  iframe.setAttribute("src", "");

  // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  viewer.scene.globe.enableLighting = true;
  // 取消天空盒显示
  viewer.scene.skyBox.show = false;
  // 设置背景为黑色
  viewer.scene.backgroundColor = Cesium.Color.BLACK;
  // 设置抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = true;

  // 广州塔
  var postion = Cesium.Cartesian3.fromDegrees(
    // 经度
    113.3301,
    // 纬度
    23.0991,
    // 高度
    1500
  );
  viewer.camera.flyTo({
    destination: postion,
    orientation: {
      heading: Cesium.Math.toRadians(-45),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 2,
  });

};

onMounted(() => {
  // console.log('aaa')
  initMap();
});
</script>

<style lang="less" scoped>
.regional-population {
  width: 100%;
  height: 100%;
}
#regionalPopulationContainer {
  width: 100%;
  height: 100%;
  :deep(canvas) {
    width: 100%;
    height: 100%;
  }
}
</style>
