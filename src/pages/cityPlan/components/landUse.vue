<template>
  <div class="landUse">
    <div id="land-use-container"></div>
  </div>
</template>

<script setup>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import * as proj from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import OSM from "ol/source/OSM.js";
import { defaults as defaultControls } from "ol/control/defaults";
import GuangZhouBoundaryJSON from "@/assets/json/GuangZhouBoundary.json";
import GuangZhouJSON from "@/assets/json/GuangZhou.json";
import Feature from "ol/Feature";
import { MultiPolygon } from "ol/geom";
import { Fill, Stroke } from "ol/style";
import Crop from "ol-ext/filter/Crop";
import Mask from "ol-ext/filter/Mask";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";

const initMap = () => {
  const map = new Map({
    target: "land-use-container",
    view: new View({
      zoom: 10,
      projection: "EPSG:4326",
      center: proj.fromLonLat([113.264434, 23.129162], "EPSG:4326"),
    }),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        }),
      }),
    ],
    controls: defaultControls({
      rotate: false,
      zoom: false,
      attribution: true,
    }),
  });
  return map;
};

const addMaskLayer = (map) => {
  const maskLayer = new TileLayer({ source: new OSM(), zIndex: 2 });

  const GuangZhouFeature =
    GuangZhouBoundaryJSON.features[0].geometry.coordinates;
  const feature = new Feature(new MultiPolygon(GuangZhouFeature));
  const crop = new Crop({
    feature,
    wrapX: true,
    inner: false,
  });
  const maskFilter = new Mask({
    feature,
    wrapX: true,
    inner: false,
    fill: new Fill({ color: [255, 255, 255, 0.8] }),
  });

  maskLayer.addFilter(crop);
  maskLayer.addFilter(maskFilter);

  map.addLayer(maskLayer);
};

const createCityLine = (map, geoJson) => {
  const features = new GeoJSON({ featureProjection: "EPSG:4326" }).readFeatures(
    geoJson
  );
  const lineLayer = new VectorLayer({
    title: "区域线图层",
    source: new VectorSource({
      features: features,
    }),
    style: new Style({
      stroke: new Stroke({
        width: 1,
        color: "#757575",
      }),
    }),
    zIndex: 3,
  });
  map.addLayer(lineLayer);
};

const createColumnChart = (map) => {};

onMounted(() => {
  const map = initMap();
  addMaskLayer(map);
  createCityLine(map, GuangZhouJSON);
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
