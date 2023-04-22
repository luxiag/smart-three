<template>
  <div class="floodingAnalysis-page">
    <div ref="floodingAnalysisRef" class="container"></div>
  </div>
</template>

<script setup>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { onMounted } from "vue";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const floodingAnalysisRef = ref();
let camera, scene, renderer;

const initScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.y = 2;
  scene.add(camera);
  scene.background = new THREE.Color(0xbbbbbb);
  const loader = new GLTFLoader();
  loader.load("/models/wall-street2.glb", (gltf) => {
    console.log(gltf, "gltf");

    gltf.scene.position.set(0, 0, 0);
    camera.lookAt(gltf.scene.position);
    scene.add(gltf.scene);
  });
  var axesHelper = new THREE.AxesHelper(50,true);
  scene.add(axesHelper);

  const light = new THREE.AmbientLight(0xffffff,1); // soft white light
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  floodingAnalysisRef.value.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  // controls.minDistance = 400;
  // controls.maxDistance = 1000;
  controls.target.set(0, 0, 0);
  controls.update();
  window.addEventListener("resize", onWindowResize);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
};
const render = () => {
  renderer.render(scene, camera);
};
onMounted(() => {
  initScene();
  render();
});
</script>
<style scoped lang="less">
.floodingAnalysis-page {
  width: 100%;
  height: 100;
  .container {
    width: 100%;
    height: 100;
  }
}
</style>
