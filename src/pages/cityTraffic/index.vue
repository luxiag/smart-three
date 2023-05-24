<template>
  <container>
    <template v-slot:left></template>
    <template v-slot:left-use>
      <div
        :class="activeCompName == 'routeDistribution' ? 'use active' : 'use'"
        @click="switchComponent('routeDistribution')"
      >
        路线分布
      </div>
      <div
        :class="activeCompName == 'regionalPopulation' ? 'use active' : 'use'"
        @click="switchComponent('regionalPopulation')"
      >
        交通热力
      </div>
      <div
        :class="activeCompName == 'terrain' ? 'use active' : 'use'"
        @click="switchComponent('terrain')"
      >
        交通预警
      </div>
    </template>
    <template v-slot:right> </template>
    <template v-slot:center>
      <div class="page" ref="cityTrafficRef"></div>
      <!-- <component :is="activeComponent[activeCompName]"></component> -->
    </template>
  </container>
</template>
<script setup>
import container from "@/components/container.vue";
import { onMounted } from "vue";
import routeDistribution from "./components/routeDistribution.vue";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { debounce } from "@/utils/lang.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Sky } from "three/examples/jsm/objects/Sky";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

const activeCompName = ref("routeDistribution");
const activeComponent = {
  routeDistribution,
};

const switchComponent = (componentName) => {
  activeCompName.value = componentName;
};

let scene, camera, renderer, controls, labelRenderer;
const loader = new THREE.FileLoader();
const textureLoader = new THREE.TextureLoader();
const manager = new THREE.LoadingManager();
const fbxLoader = new FBXLoader(manager);
const dracoLoader = new DRACOLoader(manager);
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.preload();
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

const cityTrafficRef = ref();

const initMap = () => {
  return new Promise((resolve) => {
    scene = new THREE.Scene();
    textureLoader.loadAsync("/imgs/sky.png").then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      console.log(texture, "texture");
    });
    // scene.background = new THREE.Color(0x0a0f12);
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(65, 20, 0);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    cityTrafficRef.value.appendChild(renderer.domElement);

    renderer.render(scene, camera);
    window.addEventListener("resize", debounce(onWindowResize));
    resolve();
  });
};

const initControls = () => {
  if (labelRenderer?.domElement) {
    controls = new OrbitControls(camera, labelRenderer.domElement);
  } else {
    controls = new OrbitControls(camera, renderer.domElement);
  }
  controls.enableDamping = true;
  controls.update();
};

const createLight = () => {
  const light = new THREE.AmbientLight(0xffffff, 0.6); // soft white light
  scene.add(light);

  const pointLight = new THREE.PointLight(0xffffff, 1, 400);
  pointLight.position.set(50, 50, 0);
  scene.add(pointLight);

  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(50, 50, 0);
  scene.add(sphere);
};

const initCSS2DRender = () => {
  return new Promise((resolve) => {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    cityTrafficRef.value.appendChild(labelRenderer.domElement);
    resolve(labelRenderer);
  });
};
const initAxesHelper = () => {
  const axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer?.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
  labelRenderer?.render(scene, camera);
  // composer?.render();
};

const createCity = () => {
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // console.log(
    //   "Loading file: " +
    //     url +
    //     ".\nLoaded " +
    //     itemsLoaded +
    //     " of " +
    //     itemsTotal +
    //     " files."
    // );
  };
  gltfLoader.load("/models/ground.glb", (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(-100, 0, 0);

    scene.add(mesh);
  });
  gltfLoader.load("/models/hongkong01.glb", (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(-100, 0, 0);

    scene.add(mesh);
  });
  gltfLoader.load("/models/hongkong02.glb", (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(-100, 0, 0);

    scene.add(mesh);
  });
};

const createSkyAndSun = () => {
  const sun = new THREE.Vector3();
  const sky = new Sky();
  sky.scale.setScalar(100000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  let renderTarget;
  // updateSun

  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);
  // water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  if (renderTarget !== undefined) renderTarget.dispose();

  renderTarget = pmremGenerator.fromScene(sky);

  scene.environment = renderTarget.texture;
};

onMounted(async () => {
  await initMap();
  await initCSS2DRender();

  initControls();
  createLight();
  initAxesHelper();

  createCity();
  // createSkyAndSun();

  animate();
});
</script>
<style scoped lang="less"></style>
