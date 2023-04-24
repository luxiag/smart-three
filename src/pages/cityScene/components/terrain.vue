<template>
  <div class="terrain-page page">
    <div class="geoMap" ref="geoMapRef"></div>
  </div>
</template>
<script setup>
import * as THREE from "three";
import { onMounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as d3 from "d3";

const loader = new THREE.FileLoader();

let scene, camera, renderer, controls;
const map = new THREE.Object3D();

const getMapData = () => {
  loader.load("/json/GuangZhou.json", (data) => {
    data = JSON.parse(data);
    initMap(data);
  });
};

const geoMapRef = ref();

const initScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 0, 100);
  // scene.background = new THREE.Color(0xff00ff);
  scene.add(camera);

  const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
  scene.add(light);


  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  geoMapRef.value.appendChild(renderer.domElement);
  renderer.render(scene, camera);
};
const initMap = (jsonData) => {
  const features = jsonData.features;
  const projection = d3
    .geoMercator()
    .center([113.264434, 23.129162])
    .translate([0, 0, 0]);
  const color = "#99ff99";

  // region.position.set(center[0],center[1],1)

  features.forEach((feature) => {
    const region = new THREE.Object3D();
    region.properties = feature.properties;
    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          const mesh = drawExtrudeMesh(rows, color, projection);
          mesh.properties = feature.properties;
          region.add(mesh);
        });
      });
    }
    map.add(region);
  });
  map.scale.set(10,10,10)
  console.log(map)
  scene.add(map);
};

const createControls = () => {
  controls = new OrbitControls(camera, renderer.domElement);
  // 设置控制器阻尼
  controls.enableDamping = true;
  controls.update();
};

const drawExtrudeMesh = (polygon, color, projection) => {
  const shape = new THREE.Shape();
  polygon.forEach((row, i) => {
    const [x, y] = projection(row);
    if (i == 0) {
      shape.moveTo(x, -y);
    }
    shape.lineTo(x, -y);
  });

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: false,
  });
  const randomColor = (0.5 + Math.random() * 0.5) * 0xffffff;
  const material = new THREE.MeshBasicMaterial({
    color: randomColor,
    transparent: true,
    opacity: 0.5,
    // wireframe:true
  });
  return new THREE.Mesh(geometry, material);
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
};

onMounted(() => {
  initScene();
  createControls();

  getMapData();
  animate();
});
</script>
<style scoped lang="less">
.terrain-page {
  width: 100%;
  height: 100%;
  .geoMap {
    width: 100%;
    height: 100%;
  }
}
</style>
