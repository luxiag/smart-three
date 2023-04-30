<template>
  <div class="topographicOverview">
    <div id="topographic-overview-container"></div>
  </div>
</template>
<script setup>
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM.js";
import Mask from "ol-ext/filter/Mask";
import Crop from "ol-ext/filter/Crop";
import Feature from "ol/Feature.js";
import BingMaps from "ol/source/BingMaps.js";
import * as proj from "ol/proj";
import GuangZhouBoundaryJSON from "@/assets/json/GuangZhouBoundary.json";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import { Fill, Stroke, Style, RegularShape } from "ol/style";

import { onMounted } from "vue";

let map, osm;

const initMap = () => {
  // osm =
  map = new Map({
    target: "topographic-overview-container",
    layers: [
      new TileLayer({
        source: new BingMaps({
          key: "AiBMkJeOy-GBucuk_YgGEaNJO2NG5Yf0axzk-OQSAW_waO-56TsfqH6akCSQ6qmb",
          imagerySet: "Aerial",
          // imagerySet:'AerialWithLabelsOnDemand'
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          // maxZoom: 19
        }),
      }),
    ],
    view: new View({
      projection: "EPSG:4326",
      center: proj.fromLonLat([113.264434, 23.129162], "EPSG:4326"),
      zoom: 10,
    }),
  });
};

const createMapMask = () => {
  // const osm = new TileLayer({ source: new OSM() });
  const osm = new TileLayer({
    source: new BingMaps({
      key: "AiBMkJeOy-GBucuk_YgGEaNJO2NG5Yf0axzk-OQSAW_waO-56TsfqH6akCSQ6qmb",
      imagerySet: "Aerial",
      // imagerySet:'AerialWithLabelsOnDemand'
      // use maxZoom 19 to see stretched tiles instead of the BingMaps
      // "no photos at this zoom level" tiles
      // maxZoom: 19
    }),
  });
  const GuangZhouFeature =
    GuangZhouBoundaryJSON.features[0].geometry.coordinates;
  console.log(GuangZhouFeature, "GuangZhouFeature");
  const f = new Feature(new MultiPolygon(GuangZhouFeature));
  const crop = new Crop({
    feature: f,
    wrapX: true,
    inner: false,
  });
  osm.addFilter(crop);
  const maskFilter = new Mask({
    feature: f,
    wrapX: true,
    inner: false,
    fill: new Fill({ color: [255, 255, 255, 0.8] }),
  });
  osm.addFilter(maskFilter);
  map.addLayer(osm);
};
onMounted(() => {
  initMap();
  createMapMask();
});
</script>
<style lang="less" scoped>
.topographicOverview {
  height: 100%;
  width: 100%;
  #topographic-overview-container {
    height: 100%;
    width: 100%;
  }
}
</style>
