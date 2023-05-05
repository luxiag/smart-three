<template>
  <div class="route-distribution-page">
    <div id="distribution-container"></div>
  </div>
</template>
<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted } from "vue";
let map;
const initMap = () => {
  AMapLoader.load({
    key: "e4667a1d2bab66c7eddb4f34595b8c0d", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      map = new AMap.Map("distribution-container", {
        mapStyle: "amap://styles/whitesmoke",
        features:["road","bg","point"],
        center:[113.28064, 23.125177],
        zoom: 10
      });
    })
    .catch((e) => {
      console.log(e);
    });
};
onMounted(()=>{
    initMap()
})
</script>

<style lang="less" scoped>
.route-distribution-page {
  height: 100%;
  width: 100%;
  #distribution-container {
    height: 100%;
    width: 100%;
  }
}
</style>
