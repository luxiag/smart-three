<template>
  <div class="landUse">
    <div id="land-use-container"></div>
  </div>
</template>
<script setup>
import Map from "ol/Map";
import View from "ol/View";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Fill, Stroke, Style } from "ol/style";
import * as proj from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { GeoJSON } from "ol/format";
import { fromExtent } from "ol/geom/Polygon";
import LineString from "ol/geom/LineString.js";
import Feature from "ol/Feature.js";
import Mask from "ol-ext/filter/Mask";
import { onMounted } from "vue";
import GuangZhouBoundaryJSON from "public/json/GuangZhouBoundary.json";

let map, layers, maskLayer, reverseLayer;

const initMap = () => {
  layers = [
    new TileLayer({
      source: new XYZ({
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      }),
    }),
  ];
  map = new Map({
    target: "land-use-container",
    layers,
    view: new View({
      center: proj.fromLonLat([113.264434, 23.129162]),
      zoom: 13,
    }),
  });
    createMapMask();
};

const createMapMask = () => {
//   let geoJson = new GeoJSON();
//   const GuangZhouFeatures = GuangZhouBoundaryJSON.features[0];
//   //获取边界数据MultiPolygon数组
//   let ft = geoJson
//     .readFeature(GuangZhouFeatures)
//     .getGeometry()
//     .getGeometries();
//   console.log(ft, "ft");
//   console.log(ft);
//   //获取绘制边界数据的数组，我的是数组中的第一个所以取[1]
//   let linearRing = new Polygon(ft[0].getCoordinates()[1]);
//   // 全球范围（太卡 抛弃）改取当前视窗的范围
//   // let extent = [-180, -90, 180, 90];
//   // let polygonRing = fromExtent(linearRing.getExtent());获取Polygon的范围，太小因此改用视窗范围
//   //获取当前窗口的范围
//   let extent = map.getView().calculateExtent();
//   //不想看到视窗外部线条因此做了计算
//   for (let i = 0; i < extent.length; i++) {
//     extent[0] = extent[0] - 0.04; //左
//     extent[1] = extent[1] - 0.04; //下
//     extent[2] = extent[2] + 0.04; //右
//     extent[3] = extent[3] + 0.04; //上
//   }
//   //针对视窗范围设置Extent
//   let polygonRing = fromExtent(extent);
//   //把视窗范围添加至边界线中也就是确定外环位置
//   polygonRing.appendLinearRing(linearRing);
//   //把数据生成Feature
//   let Polygons = new Feature({
//     geometry: polygonRing,
//   });
//   //实例化一个矢量图层Vector作为绘制层
//   let vectorSource = new VectorSource({
//     features: [Polygons],
//     // features: geoJson.readFeatures(area),
//   });

//   //创建一个图层并设置填充样式
//   let vector = new VectorLayer({
//     source: vectorSource,
//     style: new Style({
//       fill: new Fill({
//         color: "rgba(255,255,255,0.7)",
//       }),
//       stroke: new Stroke({
//         lineDash: [1, 2, 3, 4, 5],
//         color: "#ffcc33",
//         width: 4,
//       }),
//     }),
//   });
//   //设置图层层级
//   vector.setZIndex(0);
//   //添加至地图
//   map.addLayer(vector);
  // 创建一个多边形，用于遮罩广州以外的所有城市
  //

  //   console.log(
  //     new GeoJSON().readFeature(GuangZhouFeature, {
  //       dataProjection: "EPSG:4326", // json的坐标系
  //       featureProjection: "EPSG:3857", // 当前地图使用的坐标系
  //     }),
  //     "gz"
  //   );
  //   var mask = new VectorLayer({
  //     source: new VectorSource({
  //       feature: new Feature({
  //         geometry: new GeoJSON().readFeature(GuangZhouFeature, {
  //           dataProjection: "EPSG:4326", // json的坐标系
  //           featureProjection: "EPSG:3857", // 当前地图使用的坐标系
  //         }),
  //       }),
  //     }),
  //     style: new Style({
  //       fill: new Fill({
  //         color: "rgba(0, 0, 0, 0.5)",
  //       }),
  //       stroke: new Stroke({
  //         color: "black",
  //         width: 1,
  //       }),
  //     }),
  //   });

  //   // 将该遮罩层添加到地图中
  //   map.addLayer(mask);

  //   maskLayer = new VectorLayer({
  //     source: new VectorSource(),
  //     style: new Style({
  //       stroke: new Stroke({
  //         color: "rgb(144,30,252)",
  //         width: 3,
  //       }),
  //       fill: new Fill({ color: "rgba(220,240,253,0.6)" }),
  //     }),
  //     zIndex: 9999,
  //   });
  //   maskLayer.setMap(map);

  //   const GuangZhouFeature = GuangZhouBoundaryJSON.features[0];
  //   console.log(GuangZhouFeature, "a");
  //   const maskFilter = new Mask({
  //     feature: new GeoJSON().readFeature(GuangZhouFeature, {
  //       dataProjection: "EPSG:4326", // json的坐标系
  //       featureProjection: "EPSG:3857", // 当前地图使用的坐标系
  //     }),
  //     wrapX: true,
  //     inner: false,
  //     fill: new Fill({ color: "rgba(220,240,253,0.6)" }),
  //   });
  //   console.log(maskFilter, "maskFilter");
  //   maskLayer.addFilter(maskFilter);
  //   map.addLayer(maskLayer);
};
//反转遮罩：全图半透明遮罩，指定区域擦干净
// 准备反转遮罩层
const addReverseLayer = () => {
  let source = new VectorSource();
  // 遮罩的样式
  let style = new Style({
    fill: new Fill({
      color: "rgba(8,31,63,0.6)",
    }),
    stroke: new Stroke({
      color: "rgb(8,91,163)",
      width: 1,
    }),
  });
  reverseLayer = new VectorLayer({ source, style });
  // this.reverseLayer = reverseLayer;
  console.log(map, reverseLayer);
  reverseLayer.setZIndex(99);
  map.addLayer(reverseLayer);
};
/**
 * 开始操作
 * @param data 某个行政区域的轮廓数据
 */
const draw = () => {
  // 将data转换为feature
  const GuangZhouFeature = GuangZhouBoundaryJSON.features[0];
  const dataForMart = new GeoJSON().readFeature(GuangZhouFeature);
  console.log(dataForMart,'data')
  // 得到反转擦除后遮盖层数据
  const convertGeom = erase(dataForMart);
  const convertFt = new Feature({ geometry: convertGeom });
  reverseLayer.getSource().addFeature(convertFt);

  function erase(geom) {
    const polygonRing = fromExtent([-180, -90, 180, 90]);
    // 擦除操作
    for (let i = 0, len = geom.length; i < len; i++) {
      let g = geom[i].getGeometry();
      const coords = g.getCoordinates();
      coords.forEach((coord) => {
        const linearRing = new LineString(coord[0]);
        polygonRing.appendLinearRing(linearRing);
      });
    }
    return polygonRing;
  }
};
/*
区域遮罩效果，某个区域上方半透明遮罩：

*/
const createClip = (coords, canvas, type) => {
  for (let i = 0, cout = coords.length; i < cout; i++) {
    //获取屏幕坐标
    let screenCoord = map.getPixelFromCoordinate(coords[i]);
    let x = screenCoord[0],
      y = screenCoord[1];
    if (i === 0) {
      canvas.moveTo(x, y);
    } else if (i < coords.length - 1) {
      let screenCoord1 = map.getPixelFromCoordinate(coords[i + 1]);
      let x1 = screenCoord1[0],
        y1 = screenCoord1[1];
      //canvas.lineTo(x, y);   lineTo是画直线；quadraticCurveTo是画贝塞尔曲线
      canvas.quadraticCurveTo(x, y, (x + x1) / 2, (y + y1) / 2);
    } else {
      canvas.quadraticCurveTo(x - 1, y - 1, x, y);
    }
  }
  if (type == "ditu") {
    canvas.closePath();
    //设置边框
    canvas.shadowColor = "#000000";
    canvas.shadowOffsetX = 4;
    canvas.shadowOffsetY = 4;
    canvas.shadowBlur = 10;
    canvas.strokeStyle = "#dedede";
    canvas.lineWidth = 4;
    canvas.stroke();
  }
};

onMounted(() => {
  initMap();
  addReverseLayer();
  draw();

});
</script>

<style scoped lang="less">
.landUse {
  width: 100%;
  height: 100%;
  #land-use-container {
    width: 100%;
    height: 100%;
  }
}
</style>
