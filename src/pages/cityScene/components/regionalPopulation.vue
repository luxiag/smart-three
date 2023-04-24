<template>
  <div class="regionalPopulation-page page">
    <div
      id="regionalPopulationContainer"
      ref="regionalPopulationContainer"
    ></div>
  </div>
</template>

<script setup>
import * as Cesium from "cesium";
import { onMounted } from "vue";
// import "http://api.tianditu.gov.cn/cdn/plugins/cesium/cesiumTdt.js"

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
    shouldAnimate: true,
    selectionIndicator: false,
    // 是否播放动画
    animation: false,
    // 是否显示时间轴
    timeline: false,
    // 是否显示全屏按钮
    fullscreenButton: false,
    selectionIndicator: false, // 隐藏指示器
  });
  viewer.cesiumWidget.creditContainer.style.display = "none";
  // createGeographicName();
  // viewer.cesiumWidget.selectionIndicatorContainer.style.display = "none";
  const tdt_tk = "f901e2c576a572b55ae86d623207d9ef";
  const TDTImgProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      tdt_tk,
    layer: "天地图影像",
    style: "default",
    format: "image/jpeg",
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    tileMatrixSetID: "GoogleMapsCompatible",
  });

  const TDTZJProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
      tdt_tk,
    layer: "天地图中文注记",
    style: "default",
    format: "image/jpeg",
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    tileMatrixSetID: "GoogleMapsCompatible",
  });
  viewer.imageryLayers.addImageryProvider(TDTImgProvider); //添加图层
  viewer.imageryLayers.addImageryProvider(TDTZJProvider); //添加图层

  let isLoading = false;
  viewer.screenSpaceEventHandler.setInputAction(function (click) {
    let cartesian = viewer.camera.pickEllipsoid(
      click.position,
      viewer.scene.globe.ellipsoid
    );
    if (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      console.log({ lon: longitude, lat: latitude, val: 50 });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  viewer.scene.globe.tileLoadProgressEvent.addEventListener(function () {
    if (viewer.scene.globe.tilesLoaded === true) {
      console.log("地球加载完成！");
      if (!isLoading) {
        createCityBadge();
        // create3DBar();
        isLoading = true;
      }
    }
  });
};
const createGeographicName = () => {
  let token = "f901e2c576a572b55ae86d623207d9ef";
  let tdtUrl = "https://t{s}.tianditu.gov.cn/";
  // 服务负载子域
  let subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];

  // 叠加影像服务
  let imgMap = new Cesium.UrlTemplateImageryProvider({
    url: tdtUrl + "DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + token,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    maximumLevel: 18,
  });
  viewer.imageryLayers.addImageryProvider(imgMap);

  // 叠加国界服务
  let iboMap = new Cesium.UrlTemplateImageryProvider({
    url: tdtUrl + "DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=" + token,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    maximumLevel: 10,
  });
  viewer.imageryLayers.addImageryProvider(iboMap);

  // 叠加地形服务
  let terrainUrls = new Array();

  for (let i = 0; i < subdomains.length; i++) {
    let url =
      tdtUrl.replace("{s}", subdomains[i]) + "DataServer?T=elv_c&tk=" + token;
    terrainUrls.push(url);
  }

  // let provider = new Cesium.GeoTerrainProvider({
  //   urls: terrainUrls,
  // });

  // viewer.terrainProvider = provider;
  // 叠加三维地名服务
  let wtfs = new Cesium.GeoWTFS({
    viewer,
    subdomains: subdomains,
    metadata: {
      boundBox: {
        minX: -180,
        minY: -90,
        maxX: 180,
        maxY: 90,
      },
      minLevel: 1,
      maxLevel: 20,
    },
    aotuCollide: true, //是否开启避让
    collisionPadding: [5, 10, 8, 5], //开启避让时，标注碰撞增加内边距，上、右、下、左
    serverFirstStyle: true, //服务端样式优先
    labelGraphics: {
      font: "28px sans-serif",
      fontSize: 28,
      fillColor: Cesium.Color.WHITE,
      scale: 0.5,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 5,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      showBackground: false,
      backgroundColor: Cesium.Color.RED,
      backgroundPadding: new Cesium.Cartesian2(10, 10),
      horizontalOrigin: Cesium.HorizontalOrigin.MIDDLE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      eyeOffset: Cesium.Cartesian3.ZERO,
      pixelOffset: new Cesium.Cartesian2(0, 8),
    },
    billboardGraphics: {
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      eyeOffset: Cesium.Cartesian3.ZERO,
      pixelOffset: Cesium.Cartesian2.ZERO,
      alignedAxis: Cesium.Cartesian3.ZERO,
      color: Cesium.Color.WHITE,
      rotation: 0,
      scale: 1,
      width: 18,
      height: 18,
    },
  });

  //三维地名服务，使用wtfs服务
  wtfs.getTileUrl = function () {
    return tdtUrl + "mapservice/GetTiles?lxys={z},{x},{y}&tk=" + token;
  };

  wtfs.getIcoUrl = function () {
    return tdtUrl + "mapservice/GetIcon?id={id}&tk=" + token;
  };

  wtfs.initTDT([
    {
      x: 6,
      y: 1,
      level: 2,
      boundBox: { minX: 90, minY: 0, maxX: 135, maxY: 45 },
    },
    {
      x: 7,
      y: 1,
      level: 2,
      boundBox: { minX: 135, minY: 0, maxX: 180, maxY: 45 },
    },
    {
      x: 6,
      y: 0,
      level: 2,
      boundBox: { minX: 90, minY: 45, maxX: 135, maxY: 90 },
    },
    {
      x: 7,
      y: 0,
      level: 2,
      boundBox: { minX: 135, minY: 45, maxX: 180, maxY: 90 },
    },
    {
      x: 5,
      y: 1,
      level: 2,
      boundBox: { minX: 45, minY: 0, maxX: 90, maxY: 45 },
    },
    {
      x: 4,
      y: 1,
      level: 2,
      boundBox: { minX: 0, minY: 0, maxX: 45, maxY: 45 },
    },
    {
      x: 5,
      y: 0,
      level: 2,
      boundBox: { minX: 45, minY: 45, maxX: 90, maxY: 90 },
    },
    {
      x: 4,
      y: 0,
      level: 2,
      boundBox: { minX: 0, minY: 45, maxX: 45, maxY: 90 },
    },
    {
      x: 6,
      y: 2,
      level: 2,
      boundBox: { minX: 90, minY: -45, maxX: 135, maxY: 0 },
    },
    {
      x: 6,
      y: 3,
      level: 2,
      boundBox: { minX: 90, minY: -90, maxX: 135, maxY: -45 },
    },
    {
      x: 7,
      y: 2,
      level: 2,
      boundBox: { minX: 135, minY: -45, maxX: 180, maxY: 0 },
    },
    {
      x: 5,
      y: 2,
      level: 2,
      boundBox: { minX: 45, minY: -45, maxX: 90, maxY: 0 },
    },
    {
      x: 4,
      y: 2,
      level: 2,
      boundBox: { minX: 0, minY: -45, maxX: 45, maxY: 0 },
    },
    {
      x: 3,
      y: 1,
      level: 2,
      boundBox: { minX: -45, minY: 0, maxX: 0, maxY: 45 },
    },
    {
      x: 3,
      y: 0,
      level: 2,
      boundBox: { minX: -45, minY: 45, maxX: 0, maxY: 90 },
    },
    {
      x: 2,
      y: 0,
      level: 2,
      boundBox: { minX: -90, minY: 45, maxX: -45, maxY: 90 },
    },
    {
      x: 0,
      y: 1,
      level: 2,
      boundBox: { minX: -180, minY: 0, maxX: -135, maxY: 45 },
    },
    {
      x: 1,
      y: 0,
      level: 2,
      boundBox: { minX: -135, minY: 45, maxX: -90, maxY: 90 },
    },
    {
      x: 0,
      y: 0,
      level: 2,
      boundBox: { minX: -180, minY: 45, maxX: -135, maxY: 90 },
    },
  ]);
};
const createCityBadge = async () => {
  viewer.dataSources.add(
    Cesium.GeoJsonDataSource.load("/json/China.json", {
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.RED.withAlpha(0.5),
      strokeWidth: 5,
    })
  );

  // 2、分色渲染行政区
  Cesium.GeoJsonDataSource.load("/json/China.json").then(function (dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      // 构造随机颜色
      const color = Cesium.Color.fromRandom({ alpha: 0.6 });
      entity.polygon.material = color;
      entity.polygon.outline = false;
    }
  });

  Cesium.GeoJsonDataSource.load("/json/GuangZhou.json").then((dataSource) => {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      // 得到每块多边形的坐标集合
      const polyPositions = entity.polygon.hierarchy.getValue(
        Cesium.JulianDate.now()
      ).positions;
      // 根据坐标集合构造BoundingSphere获取中心点坐标
      let polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
      // 将中心点拉回到地球表面
      polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);

      const color = Cesium.Color.fromRandom({ alpha: 0.6 });
      viewer.entities.add({
        position: polyCenter,
        label: {
          text: entity.properties.name,
          // showBackground: true, //背景颜色
          // scale: 0.6,
          verticalOrigin: Cesium.VerticalOrigin.CENTER, // 垂直位置
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平位置
          font: "14pt Source Han Sans CN", // 字体样式
          fillColor: Cesium.Color.BLACK, // 字体颜色
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 5,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          eyeOffset: new Cesium.Cartesian3(0, 0, -80000), // 这里设置了就不会被遮盖了，设为负值则在更上层
        },
        description: function () {
          return "<h3>description</h3>";
        },
      });
    }
  });
  const position = Cesium.Cartesian3.fromDegrees(
    113.45475285674296,
    22.233013647304126,
    160000
  );

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-60),
      roll: 0,
    },
  });
  addMouseMoveEvent();
};
const districts = [
  "越秀区",
  "荔湾区",
  "海珠区",
  "天河区",
  "白云区",
  "黄埔区",
  "番禺区",
  "花都区",
  "南沙区",
  "增城区",
  "从化区",
];


// 添加鼠标移入时间
const addMouseMoveEvent = () => {
  tooltipDiv.initTool(viewer.cesiumWidget.container);
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    var pickedObject = viewer.scene.pick(movement.endPosition);
    if (
      Cesium.defined(pickedObject) &&
      pickedObject.id instanceof Cesium.Entity &&
      districts.includes(pickedObject.id.name)
    ) {
      console.log("Entity Name: " + pickedObject.id.name, pickedObject);
      tooltipDiv.showAt(
        movement.endPosition,
        `<div class="tooltip-element">
      <div class="name">${pickedObject.id.name}</div>
      <div class="container">
        内容  
      </div>
    </div>`
      );
    } else {
      tooltipDiv.setVisible(false);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

const tooltipDiv = (function () {
  var isInit = false;

  function _() {}

  _.initTool = function (frameDiv) {
    if (isInit) {
      return;
    }

    var div = document.createElement("DIV");
    div.className = "tooltipdiv";

    var title = document.createElement("DIV");
    title.className = "tooltipdiv-inner";
    div.appendChild(title);

    this._div = div;
    this._title = title;

    frameDiv.appendChild(div);

    isInit = true;
  };

  _.setVisible = function (visible) {
    if (!isInit) {
      return;
    }
    this._div.style.display = visible ? "block" : "none";
  };

  _.showAt = function (position, message) {
    if (!isInit) {
      return;
    }
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this._div.style.left = position.x + 10 + "px";
      this._div.style.top = position.y - this._div.clientHeight / 2 + "px";
    }
  };

  return _;
})();

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
    // let pickedObject = viewer.scene.pick(movement.position);
    let pickedObject = viewer.camera.pickEllipsoid(
      movement.position,
      viewer.scene.globe.ellipsoid
    );
    console.log(pickedObject, "a");
    // const cartesian = viewer.camera.pickEllipsoid(
    //     movement.endPosition,
    //     scene.globe.ellipsoid
    //   );
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      let entity = pickedObject.id;
      let tooltip = entity.name;
      let cartesian = viewer.camera.pickEllipsoid(
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

const showAdministrative = () => {};
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

:deep(.tooltipdiv) {
  display: block;
  position: absolute;
  visibility: visible;
  max-width: 200px;
  min-width: 100px;
  padding: 1px 1px1px 25px;
  font-size: 11px;
  z-index: 1000;
  opacity: 0.8;
  -khtml-opacity: 0.8;
  -moz-opacity: 0.8;
  filter: alpha(opacity=80);
}
.tooltipdiv-inner {
  padding: 3px8px;
  background-color: #000000;
  color: white;
  text-align: center;
  max-width: 200px;
  text-decoration: none;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
</style>
