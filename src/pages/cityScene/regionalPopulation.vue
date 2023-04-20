<template>
  <div class="regionalPopulation-page page">
    regionalPopulation

    <div
      id="regionalPopulationContainer"
      ref="regionalPopulationContainer"
    ></div>
  </div>
</template>

<script setup>
import * as Cesium from "cesium";
import { onMounted } from "vue";

const dataSource = new Cesium.GeoJsonDataSource();
const regionalPopulationContainer = ref();
let viewer;
const initMap = () => {
  viewer = new Cesium.Viewer("regionalPopulationContainer", {
    // 是否显示信息窗口
    infoBox: false,
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
    selectionIndicator: false, // 隐藏指示器
  });
  viewer.cesiumWidget.creditContainer.style.display = "none";
  // viewer.cesiumWidget.selectionIndicatorContainer.style.display = "none";
  let isLoading = false;
  const position = Cesium.Cartesian3.fromDegrees(113.2644, 22.1291, 200000);
  viewer.screenSpaceEventHandler.setInputAction(function (click) {
    var cartesian = viewer.camera.pickEllipsoid(
      click.position,
      viewer.scene.globe.ellipsoid
    );
    if (cartesian) {
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
      console.log({ lon: longitude, lat: latitude, val: 50 });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  viewer.scene.globe.tileLoadProgressEvent.addEventListener(function () {
    if (viewer.scene.globe.tilesLoaded === true) {
      console.log("地球加载完成！");
      if (!isLoading) {
        viewer.camera.flyTo({
          destination: position,
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60),
            roll: 0,
          },
        });
        createCityBadge();
        create3DBar();
        isLoading = true;
      }
    }
  });
};

const createCityBadge = async () => {
  const geoJSON = Cesium.GeoJsonDataSource.load("/json/GuangZhou.json", {
    stroke: Cesium.Color.fromCssColorString("#ffffff"),
    fill: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.2),
    strokeWidth: 3,
  });
  console.log(viewer, "viewer");
  const polyliner = viewer.dataSources.add(geoJSON);
};

const create3DBar = (west, south, east, north) => {
  const data = [
    { lon: 113.22698054576085, lat: 23.094026982917132, val: 100 },
    { lon: 113.22698054576085, lat: 23.094026982917132, val: 150 },
    { lon: 113.3276214910859, lat: 23.09912115878135, val: 80 },
    { lon: 113.39087961736917, lat: 22.984647843894564, val: 50 },
    { lon: 113.36980583640816, lat: 23.158292639608796, val: 50 },
    { lon: 113.31060019409976, lat: 23.28656892648459, val: 50 },
    { lon: 113.2522625838226, lat: 23.462521290217666, val: 50 },
    { lon: 113.52830749311032, lat: 23.554213675712997, val: 50 },
    { lon: 113.51899947244738, lat: 23.222197916094288, val: 50 },
    { lon: 113.53475082379038, lat: 22.79034894481141, val: 50 },
    { lon: 113.76190904852058, lat: 23.35026879713109, val: 50 },
  ];
  for (let i = 0; i < data.length; i++) {
    viewer.entities.add({
      name: "Cylinder" + i,
      position: Cesium.Cartesian3.fromDegrees(data[i].lon, data[i].lat, 10000),
      cylinder: {
        length: 20000,
        topRadius: 2000,
        bottomRadius: 2000,
        material: Cesium.Color.ORANGE.withAlpha(0.5),
      },
      show: true,
      label: {
        show: false,
      },
      description: function () {
        return (
          "<h3>" +
          this.name +
          "</h3>" +
          "<p>Latitude: " +
          this.position.latitude +
          "</p>" +
          "<p>Longitude: " +
          this.position.longitude +
          "</p>"
        );
      },
    });
  }

  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    // var pickedObject = viewer.scene.pick(movement.position);
    var pickedObject = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
    console.log(pickedObject,'a')
    // const cartesian = viewer.camera.pickEllipsoid(
    //     movement.endPosition,
    //     scene.globe.ellipsoid
    //   );
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      var entity = pickedObject.id;
      var tooltip = entity.name;
      var cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );

      if (cartesian) {
        // 显示 label
        entity.label.show = true;
        entity.label.text = tooltip;
        entity.label.showBackground = true;
        entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        entity.label.scale = 0.6;
        entity.label.pixelOffset = new Cesium.Cartesian2(0, -45);
        entity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, -50.0);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 调整视角

  viewer.zoomTo(viewer.entities);
};
onMounted(() => {
  initMap();
});
</script>

<style lang="less" scoped>
#regionalPopulationContainer {
  width: 100%;
  height: 100%;
  :deep(canvas) {
    width: 100%;
    height: 100%;
  }
}
</style>
