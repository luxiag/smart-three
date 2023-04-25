<template>
  <div class="virtualReality" ref="virtualRealityRef"></div>
</template>
<script setup>
import { Viewer, utils } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { onMounted } from "vue";
import "@photo-sphere-viewer/core/index.css";
let viewer, autorotate;
const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";
const animatedValues = {
  pitch: { start: -Math.PI / 2, end: 0.2 },
  yaw: { start: Math.PI, end: 0 },
  zoom: { start: 0, end: 50 },
  fisheye: { start: 2, end: 0 },
};
const virtualRealityRef = ref();
const initViewer = () => {
  viewer = new Viewer({
    container: virtualRealityRef.value,
    panorama: baseUrl + "sphere.jpg",
    caption: "广州塔",
    defaultPitch: animatedValues.pitch.start,
    defaultYaw: animatedValues.yaw.start,
    defaultZoomLvl: animatedValues.zoom.start,
    fisheye: animatedValues.fisheye.start,
    navbar: [
      "autorotate",
      "zoom",
      {
        title: "Rerun animation",
        content: "🔄",
        onClick: intro,
      },
      "caption",
      "fullscreen",
    ],
    plugins: [
      [
        AutorotatePlugin,
        {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: animatedValues.pitch.end,
        },
      ],
    ],
  });
  autorotate = viewer.getPlugin(AutorotatePlugin);
  viewer.addEventListener('ready', intro, { once: true });
};
const intro = () => {
  autorotate.stop();

  new utils.Animation({
    properties: animatedValues,
    duration: 2500,
    easing: "inOutQuad",
    onTick: (properties) => {
      viewer.setOption("fisheye", properties.fisheye);
      viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
      viewer.zoom(properties.zoom);
    },
  }).then(() => {
    autorotate.start();
  });
};
onMounted(() => {
  console.log(utils,autorotate, "auto");
  initViewer();
});
</script>

<style lang="less" scoped>
.virtualReality {
  width: 100%;
  height: 100%;
}
</style>
