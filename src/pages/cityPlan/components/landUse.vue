<template>
  <div class="landUse">
    <div id="land-use-container"></div>
  </div>
</template>
<script setup>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector.js";
import { Vector as VectorSource } from "ol/source";
import { Fill, Stroke, Style, RegularShape } from "ol/style";
import * as proj from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { GeoJSON } from "ol/format";
import { fromExtent } from "ol/geom/Polygon";
import Polygon from "ol/geom/Polygon.js";
import LineString from "ol/geom/LineString.js";
import LinearRing from "ol/geom/LinearRing.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Mask from "ol-ext/filter/Mask";
import Crop from "ol-ext/filter/Crop"
import MultiPolygon from 'ol/geom/MultiPolygon.js';
import { onMounted } from "vue";
import GuangZhouBoundaryJSON from "@/assets/json/GuangZhouBoundary.json";
let map, layers, maskLayer, reverseLayer;

const stroke = new Stroke({ color: "black", width: 1 });

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
      projection: "EPSG:4326",
      center: proj.fromLonLat([113.264434, 23.129162]),
      zoom: 13,
    }),
  });
  console.log(map,'map')
  // createLineHeight();
  // createMapMask();
};

const erase = (geom) => {
  console.log(geom, "geom");
  const extent = [-180, -90, 180, 90];
  const polygonRing = fromExtent(extent);
  if (!geom instanceof Polygon) {
    console.log("geom的类型必须是Polygon");
    return;
  }
  const coords = geom.getCoordinates();
  coords.forEach((coord) => {
    const linearRing = new LinearRing(coord[0]);
    polygonRing.appendLinearRing(linearRing);
  });
  return polygonRing;
};
const createLineHeight = () => {
  const guangzhouSource = new VectorSource({
    features: new GeoJSON().readFeatures(GuangZhouBoundaryJSON),
  });
  const lineLayer = new VectorLayer({
    zIndex: 3,
    source: guangzhouSource,
    style: new Style({
      fill: new Fill({
        color: "rgba(0, 0, 0, 0)", // 透明色
      }),
      stroke: new Stroke({
        color: "#f4b49f",
        width: 3,
      }),
    }),
  });
  map.addLayer(lineLayer);
};
const createMapMask1 = () => {
  const maskLayer = new VectorLayer({
    zIndex: 3,
    source: new VectorSource(),
    style: new Style({
      fill: new Fill({
        color: "rgba( 255, 255, 255, 0)",
      }),
      stroke: new Stroke({
        color: "#f4b49f",
        width: 3,
      }),
    }),
  });
  map.addLayer(maskLayer);
  const GuangZhouFeature = GuangZhouBoundaryJSON.features[0].geometry;
  const ft = new GeoJSON().readFeatures(GuangZhouBoundaryJSON);
  const convertGeom = erase(ft[0].getGeometry());
  const convertFt = new Feature({ geometry: convertGeom });
  maskLayer.getSource().addFeature(convertFt);
};

const createMapMask = () => {
  maskLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: "rgb(144,30,252)",
        width: 3,
      }),
      fill: new Fill({ color: "rgba(220,240,253,0.6)" }),
    }),
    zIndex: 9999,
  });
  // maskLayer.setMap(map);
  map.addLayer(maskLayer)
  const GuangZhouFeature = GuangZhouBoundaryJSON.features[0].geometry.coordinates;
  console.log(GuangZhouFeature,'GuangZhouFeature')
  const f = new Feature(new MultiPolygon(GuangZhouFeature))
  const crop = new Crop({
    feature:f,
    wrapX:true,
    inner:false
  })
  maskLayer.addFilter(crop)
  const maskFilter = new Mask({
    feature: f,
    wrapX: true,
    inner: false,
    fill: new Fill({ color: "rgba(220,240,253,0.6)" }),
  });
  maskLayer.addFilter(maskFilter);
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
  draw()
};
/**
 * 开始操作
 * @param data 某个行政区域的轮廓数据
 */
const draw = () => {
  // 将data转换为feature
  const GuangZhouFeature = GuangZhouBoundaryJSON.features[0].geometry.coordinates;
  const f = new Feature(new geom.MultiPolygon(GuangZhouFeature))
  const dataForMart = new GeoJSON().readFeatures(GuangZhouBoundaryJSON);
  dataForMart.
  console.log(dataForMart, "data");
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
  // addReverseLayer();
  // draw();
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
