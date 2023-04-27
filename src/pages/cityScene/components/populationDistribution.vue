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
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const loader = new THREE.FileLoader();

let scene, camera, renderer, controls, labelRenderer;
const map = new THREE.Object3D();

let cities = [];

const getMapData = () => {
  loader.load("/json/GuangZhou.json", (data) => {
    data = JSON.parse(data);
    initMap(data);
  });
};

const geoMapRef = ref();

const initScene = () => {
  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(-5, 0, 50);
  // scene.background = new THREE.Color(0xff00ff);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true; // 开启阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  // this.renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.outputEncoding = THREE.sHSVEncoding;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 0);
  geoMapRef.value.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  window.addEventListener("resize", onWindowResize);
};
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render();
};
const guangzhouPopulation = {
  白云区: 1487000,
  天河区: 1413000,
  海珠区: 927000,
  荔湾区: 826000,
  越秀区: 1286000,
  黄埔区: 813000,
  番禺区: 1529000,
  花都区: 1068000,
  南沙区: 604000,
  从化区: 655000,
  增城区: 673000,
};
const initMap = (jsonData) => {
  const features = jsonData.features;
  const projection = d3
    .geoMercator()
    .center([113.264434, 23.129162])
    .translate([0, 0, 0]);
  // const color = "#99ff99";
  const COLOR_ARR = ["#0465BD", "#357bcb", "#3a7abd"];
  const HIGHT_COLOR = "#4fa5ff";
  // region.position.set(center[0],center[1],1)

  features.forEach((feature, index) => {
    const color = COLOR_ARR[index % COLOR_ARR.length];
    const region = new THREE.Object3D();
    region.properties = feature.properties;

    const city = region.properties;
    city.location = projection(city.center);
    cities.push(city);

    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          const mesh = drawExtrudeMesh(rows, color, projection);
          mesh.properties = feature.properties;
          const cityName = feature.properties.name;
          const peopleTotal = guangzhouPopulation[cityName];
          const zScale = peopleTotal / 604000;
          mesh.scale.set(1, 1, zScale);
          if (index % 2 === 0) {
            // mesh.scale.set(1, 1, 1.2);
          }
          region.add(mesh);
        });
      });
    }
    map.add(region);
  });
  console.log(cities, "properties");
  map.scale.set(10, 10, 10);
  // map.rotation.z = Math.PI/2
  scene.add(map);
  createPlayGround();
  createLight();
  createLine();
  createPeopleTotalLabel();
  window.addEventListener("mousemove", raycasterMouseMove);
};

let raycaster = new THREE.Raycaster();
let oldRegionObj, oldColor;
let pointer = new THREE.Vector2();

const raycasterMouseMove = (event) => {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(map.children, true);
  // console.log(intersects,'intersects')

  oldRegionObj && oldRegionObj.material[0].color.set(oldColor);
  if (intersects.length > 0) {
    let regionObj = intersects[0].object;
    if (regionObj.properties) {
      oldRegionObj = regionObj;
      oldColor = regionObj.material[0].color;
      regionObj.material[0].color = new THREE.Color(0xffaa00);
      render();
    }
  }
};

const barGroup = new THREE.Group();
const labelGroup = new THREE.Group();
const createPeopleTotalLabel = () => {
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.left = "0px";
  geoMapRef.value.appendChild(labelRenderer.domElement);
  controls = new OrbitControls(camera, labelRenderer.domElement);
  cities.forEach((ite) => {
    const pos = ite.location;

    const cylinderGeometry = new THREE.CylinderGeometry(
      0.15,
      0.15,
      5,
      32,
      1,
      true
    );
    cylinderGeometry.rotateX(Math.PI / 2);
    cylinderGeometry.translate(0, 0, 1);

    const cylinderMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinderMesh.position.set(pos[0] * 10, -pos[1] * 10, 2);
    barGroup.add(cylinderMesh);
    console.log(ite, "ite");
    const div = document.createElement("div");
    div.innerHTML = `
     <div class="label-container">
        <h3>${ite.name}</h3>
        <p>人口：${(guangzhouPopulation[ite.name] / 1000).toFixed(2)} 万人</p>
      </div>
    `;
    div.className = "label-population";
    const label = new CSS2DObject(div);
    label.position.set(pos[0] * 10, -pos[1] * 10, 7);
    labelGroup.add(label);

    // div.innerHTML = item
  });
  scene.add(labelGroup);
  scene.add(barGroup);
};

const createLine = () => {
  // const geometry = new THREE.BoxGeometry(1, 1, 10);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // const city = cities[7];

  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // cube.position.x = city.location[0] * 10;
  // cube.position.y = -city.location[1] * 10;
  // scene.add(cube);
};

const createPlayGround = () => {
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x031837,
    // specular: 0x111111,
    metalness: 0,
    roughness: 1,
    // opacity: 0.2,
    opacity: 0.5,
    transparent: true,
  });
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000, 1, 1),
    groundMaterial
  );
  // ground.rotation.x = - Math.PI / 2;
  ground.position.z = 0;
  // ground.castShadow = true;
  ground.receiveShadow = true;

  scene.add(ground);
};

const createLight = () => {
  let ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光

  const light = new THREE.DirectionalLight(0xffffff, 0.5); // 平行光
  light.position.set(20, -50, 20);

  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  // 半球光
  let hemiLight = new THREE.HemisphereLight("#80edff", "#75baff", 0.6);
  // 这个也是默认位置
  hemiLight.position.set(20, -50, 0);
  scene.add(hemiLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(20, -50, 50);

  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;

  const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
  pointLight2.position.set(50, -50, 20);
  pointLight2.castShadow = true;
  pointLight2.shadow.mapSize.width = 1024;
  pointLight2.shadow.mapSize.height = 1024;

  const pointLight3 = new THREE.PointLight(0xffffff, 0.5);
  pointLight3.position.set(-50, -50, 20);
  pointLight3.castShadow = true;
  pointLight3.shadow.mapSize.width = 1024;
  pointLight3.shadow.mapSize.height = 1024;

  scene.add(ambientLight);
  scene.add(light);
  scene.add(pointLight);
  scene.add(pointLight2);
  scene.add(pointLight3);
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
  // const depth = Math.random() > 0.5 ? 0.1 : 0.2;
  // console.log(depth, "depth");
  // const geometry = new THREE.ExtrudeGeometry(shape, {
  //   depth: 0.1,
  //   bevelEnabled: false,
  // });
  // const randomColor = (0.5 + Math.random() * 0.5) * 0xffffff;
  // const material = new THREE.MeshBasicMaterial({
  //   color,
  //   transparent: true,
  //   // opacity: 0.5,
  //   // wireframe:true
  // });
  // return new THREE.Mesh(geometry, material);
  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false,
    bevelSegments: 1,
    bevelThickness: 0.2,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const material = new THREE.MeshStandardMaterial({
    clearcoat: 3.0,
    metalness: 1,
    color: color,
  });

  const material1 = new THREE.MeshStandardMaterial({
    clearcoat: 3.0,
    metalness: 1,
    roughness: 1,
    color: color,
  });

  const mesh = new THREE.Mesh(geometry, [material, material1]);

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh._color = color;
  return mesh;
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  controls.update();

  renderer.render(scene, camera);
  labelRenderer&&labelRenderer.render(scene, camera);
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
:deep(.geoMap) {
  .label-population {
    .label-container {
      background-color: rgba(20, 143, 221, 0.68);
      box-shadow: 0 0 12px rgba(0, 128, 255, 0.75);
      border: 1px solid rgba(127, 177, 255, 0.75);
      padding: 5px;
      font-size: 12px;
      color: #efefef;
      h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        text-align: center;
      }
      p {
        margin: 5px;
      }
    }
    // &::before {
    //   content: "";
    //   display: block;
    //   position: absolute;
    //   width: 100px;
    //   height: 1px;
    //   background: rgb(127 177 255 / 75%);
    //   bottom: 0;
    //   right: -100px;
    //   transform: rotate(30deg);
    //   transform-origin: 0 0;
    // }
    // &::after {
    //   content: "";
    //   display: block;
    //   position: absolute;
    //   width: 20px;
    //   height: 20px;
    //   border-radius: 50%;
    //   background: rgb(127 177 255 / 75%);
    //   bottom: -65px;
    //   right: -105px;
    // }
  }
}
</style>
