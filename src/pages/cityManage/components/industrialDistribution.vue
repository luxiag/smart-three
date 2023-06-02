<template>
  <div
    class="industrialDistribution page"
    ref="industrialDistributionRef"
  ></div>
</template>
<script setup>
import * as Cesium from "cesium";
import CesiumNavigaion from "cesium-navigation-es6";
import MousePosition from "@/cesium/MousePosition";
import modifyMap from "@/cesium/modifyMap";
import modifyBuild from "@/cesium/modifyBuild";
import "public/Cesium/Widgets/widgets.css";

import LightCone from "@/cesium/LightCone";
import RectFlyLight from "@/cesium/RectFlyLight";
import RoadLightLine from "@/cesium/RoadLightLine";
import RadarLight from "@/cesium/RadarLight";
import LightSpread from "@/cesium/LightSpread";
import LightWall from "@/cesium/LightWall";
import ParticleLight from "@/cesium/ParticleLight";

const industrialDistributionRef = ref();

const initViewer = () => {
  // 设置cesium默认视角
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZjRjYTEwNi0zZTljLTRmMjUtYTdlYi0yYjcxNTRmNzEyNDUiLCJpZCI6MTE5MDM1LCJpYXQiOjE2NzkxNDU5NjR9.0I7z7InLhK57lctyV2bUG0vKLryYKhxYEYF0RpEN4Xw";
  Cesium.Ion.defaultAccessToken = token;
  window.CESIUM_BASE_URL = "/Cesium/";
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    // 西边的经度
    89.5,
    // 南边维度
    20.4,
    // 东边经度
    110.4,
    // 北边维度
    61.2
  );
  const viewer = new Cesium.Viewer(industrialDistributionRef.value, {
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
  const iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0];
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
  // viewer.scene.backgroundColor = Cesium.Color.BLACK;
  // 设置抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = true;

  // 广州塔
  const position = Cesium.Cartesian3.fromDegrees(
    // 经度
    113.3301,
    // 纬度
    23.0991,
    // 高度
    1500
  );
  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(-45),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 2,
  });

  return viewer;
};

onMounted(() => {
  const viewer = initViewer();

  new MousePosition(viewer,industrialDistributionRef.value);

  new CesiumNavigaion(viewer, {
    // 启用罗盘
    enableCompass: true,
    // 是否启用缩放
    enableZoomControls: false,
    // 是否启用指南针外环
    enableCompassOuterRing: true,
    // 是否启用距离的图例
    // enableDistanceLegend: false,
  });

  // 修改地图的底色
  modifyMap(viewer);
  // 修改建筑的颜色
  modifyBuild(viewer);
  // 添加动态的光锥特效
  new LightCone(viewer);
  // 创建区域上升流光飞线
  new RectFlyLight(viewer);
  // // 创建道路飞线
  // new RoadLightLine(viewer);
  // 创建雷达
  new RadarLight(viewer);
  // 6边形光波扩散特效
  // new LightSpread(viewer);
  // // 创建光墙
  // new LightWall(viewer); 
  // // particleLight,创建烟花粒子
  new ParticleLight(viewer, Cesium.Color.RED);
  new ParticleLight(viewer, Cesium.Color.AQUA);
  new ParticleLight(viewer, Cesium.Color.GREEN);
});
</script>

<style lang="less" scoped>
.industrialDistribution {
  // :deep(canvas) {
  //   width: 100%;
  //   height: 100%;
  // }
  :deep(.cesium-viewer) {
    .cesium-viewer-cesiumWidgetContainer {
      .cesium-widget {
        canvas {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
