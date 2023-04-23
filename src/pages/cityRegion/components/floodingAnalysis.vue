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
import { Sky } from "three/addons/objects/Sky.js";
import { Water } from "three/addons/objects/Water.js";

const floodingAnalysisRef = ref();
let camera, scene, renderer, water, renderTarget, controls;

const initScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set( 148.44641651545723, 
67.87411899908022, -92.90173497667669);
  // {x: -43.32489051735817, y: 44.15707727029659, z: 203.7138370565122}
  scene.add(camera);
  // scene.background = new THREE.Color(0xbbbbbb);
  const loader = new GLTFLoader();
  loader.load("/models/wall-street3.glb", (gltf) => {
    console.log(gltf, "gltf");
    gltf.scene.scale.set(40, 40, 40);
    gltf.scene.position.set(160, -13.9, 80);
    // camera.lookAt(gltf.scene.position);
    scene.add(gltf.scene);
  });
  var axesHelper = new THREE.AxesHelper(5000, true);
  scene.add(axesHelper);

  const light = new THREE.AmbientLight(0xffffff, 0.8); // soft white light
  scene.add(light);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  floodingAnalysisRef.value.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  // controls.minDistance = 400;
  // controls.maxDistance = 1000;
  controls.target.set(0, 0, 0);
  controls.update();
  window.addEventListener("resize", onWindowResize);
  window.onclick = function () {
    console.log("a", camera.position,controls);
    controlWaterPlane()
  };
};

const createSky = () => {
  const sun = new THREE.Vector3();
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);
  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 8,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();
  console.log(sky, "sky");

  if (renderTarget !== undefined) renderTarget.dispose();

  renderTarget = pmremGenerator.fromScene(sky);

  scene.environment = renderTarget.texture;

 
};

const createWater = () => {
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "/textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
};

const controlWaterPlane = () => {
   water.position.y += water.position.y+5
}

const createControl = () => {
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.maxPolarAngle = Math.PI * 0.495;
  controls.maxPolarAngle = Math.PI * 0.36;

  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 260.0;
  controls.update();
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
};
const render = () => {
  water.material.uniforms["time"].value += 1.0 / 60.0;
  renderer.render(scene, camera);
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};
onMounted(() => {
  initScene();
  createWater();

  createSky();
  createControl();

  animate();
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
