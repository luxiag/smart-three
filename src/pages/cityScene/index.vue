<template>
  <container>
    <template v-slot:left>
      <leftEchart />
    </template>
    <template v-slot:left-use>
      <div :class="activeCompName == 'administrative' ? 'use active' : 'use'" @click="showRegionGraph">
        行政规划
      </div>
      <div :class="activeCompName == 'population' ? 'use active' : 'use'" @click="showRegionCurve">
        人口分布
      </div>
      <div :class="activeCompName == 'ecology' ? 'use active' : 'use'" @click="showRegionMeshGraph">
        生态环境
      </div>
      <div :class="activeCompName == 'economics' ? 'use active' : 'use'" @click="showRegion3DBoundary">
        经济分布
      </div>
    </template>
    <template v-slot:right>
      <rightEchart />
    </template>
    <template v-slot:center>
      <div class="page" ref="administrativeRef"></div>
    </template>
  </container>
</template>
<script setup>
import leftEchart from "./components/leftEchart.vue";
import rightEchart from "./components/rightEchart.vue";

import container from "@/components/container.vue";

import { nextTick } from "vue";
import GuangZhou from "@/assets/json/GuangZhou.json";
import GuangZhouBoundary from "@/assets/json/GuangZhouBoundary.json";
import * as THREE from "three";
import * as echarts from "echarts";
import { onMounted } from "vue";
import * as d3 from "d3";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { cloneDeep } from "lodash";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

let map,
  scene,
  camera,
  renderer,
  labelRenderer,
  controls,
  composer,
  isPausedComposer;
const regions = [];
const labelGroup = new THREE.Group();

const administrativeRef = ref();
const loader = new THREE.TextureLoader();

const setting = {
  geoMapHeight: -0.1,
};

const css2dLabelObj = {};
const activeCompName = ref("");

const initMap = () => {
  return new Promise((resolve) => {
    scene = new THREE.Scene();
    const bgTexture = loader.load("/imgs/bg.jpg");
    // scene.background = new THREE.Color(0x0a0f12);
    scene.background = bgTexture;
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 4;
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    administrativeRef.value.appendChild(renderer.domElement);

    renderer.render(scene, camera);
    window.addEventListener("resize", debounce(onWindowResize));
    resolve();
  });
};

const debounce = (func, wait = 500, immediate) => {
  let timer = null; // 定时器
  let result = null;
  return function (...params) {
    let context = this,
      now = immediate && !timer;
    // 在设置新的定时器之前要把之前的定时器销毁，只需要在一定的时间间隔wait中执行一次
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        result = func.apply(context, params);
      }
    }, wait);
    if (now) {
      result = func.apply(context, params);
    }
    return result;
  };
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
};

const initControls = () => {
  if (labelRenderer.domElement) {
    controls = new OrbitControls(camera, labelRenderer.domElement);
  } else {
    controls = new OrbitControls(camera, renderer.domElement);
  }
  controls.enableDamping = true;
  controls.update();
};

const initAxesHelper = () => {
  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);
};

const projection = d3
  .geoMercator()
  .center([113.280637, 23.125178])
  .translate([0, 0, 0]);

const getRegionCenterData = (geoJson) => {
  return new Promise((resolve) => {
    const features = geoJson.features;
    features.forEach(async (feature) => {
      const region = {};
      const cityName = feature.properties.name;
      region.regionName = feature.properties.name;
      region.adcode = feature.properties.adcode;
      const [x, y] = projection(feature.properties.center);
      region.position = new THREE.Vector3();
      if (cityName == "白云区") {
        region.position.set(x, -y + 0.3, 0);
      } else if (cityName == "海珠区") {
        region.position.set(x + 0.2, -y - 0.1, 0);
      } else if (cityName == "荔湾区") {
        region.position.set(x - 0.1, -y - 0.1, 0);
      } else if (cityName == "天河区") {
        region.position.set(x + 0.1, -y + 0.1, 0);
      } else {
        region.position.set(x, -y, 0);
      }
      // region.position =
      regions.push(region);
    });
    resolve(regions);
  });
};

const drawCityBoundary = (geoJson) => {
  const features = geoJson.features;

  features.forEach((feature) => {
    const region = new THREE.Object3D();
    const coordinates = feature.geometry.coordinates;

    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((rows) => {
        const shape = new THREE.Shape();
        rows.forEach((row) => {
          row.forEach((r, i) => {
            const [x, y] = projection(r);
            if (i == 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          });
        });
        const geometry = new THREE.ShapeGeometry(shape);

        const gzMap = loader.load("/imgs/guangzhouMap.png");
        const gzAlphaMap = loader.load("/imgs/guangzhouAlphaMap.png");
        // gzTexture.minFilter = THREE.LinearFilter;
        const material = new THREE.MeshStandardMaterial({
          map: gzMap,
          alphaMap: gzAlphaMap,
          side: THREE.DoubleSide,
          // 设置为 RepeatWrapping
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
          opacity: 1,
          // 设置重复次数
          repeat: new THREE.Vector2(0.5, 0.5),
          // transparent:true
        });
        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
      });
    }
  });
};

const createLight = () => {
  const light = new THREE.AmbientLight(0xfff); // soft white light
  scene.add(light);
};

const createCityPlaneLabel = () => { };

let gzPlane;
const createCityPlane = () => {
  const planGeometry = new THREE.PlaneGeometry(4.8, 4.4);
  const gzMap = loader.load("/imgs/guangzhouMap.png");
  const gzAlphaMap = loader.load("/imgs/guangzhouAlphaMap.png");
  // gzTexture.minFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: gzMap,
    alphaMap: gzAlphaMap,
    side: THREE.DoubleSide,
    transparent: true,
  });
  gzPlane = new THREE.Mesh(planGeometry, material);
  gzPlane.position.z = -0.1;
  gzPlane.position.y = 0.28;
  gzPlane.position.x = 0.65;
  scene.add(gzPlane);
};
const guangZhouRegionMap = new THREE.Object3D();

const showRegionGraph = () => {
  activeCompName.value = "administrative";
  // composer.passes.length = 0;
  hideAllObject(guangZhouRegionMap, true);

  console.log(guangZhouMeshMap, "a");
  guangZhouRegionMap.visible = true;
  if (guangZhouRegionMap.children.length == 0) {
    drawRegionGraph(GuangZhou);
  }
};

const drawRegionGraph = (geoJson) => {
  const features = geoJson.features;
  const labelArr = [];
  const color = [
    "#f09135",
    "#eb4629",
    "#dee551",
    "#ed6cdd",
    "#7ad349",
    "#ec6bdc",
  ];

  features.forEach((feature, index) => {
    const properties = feature.properties;
    const cityLabel = createCityNameLabel(properties.center, properties.name);
    labelArr.push(cityLabel);
    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          const shape = new THREE.Shape();

          rows.forEach((row, i) => {
            const [x, y] = projection(row);
            if (i == 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          });
          const geometry = new THREE.ShapeGeometry(shape);
          const bgColor = new THREE.Color(
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5
          );
          // const bgColorIdx =
          //   index > color.length ? index % color.length : index;

          // const meshTexture = loader.load("/imgs/mesh.jpg");
          const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: bgColor,
            needsBloom: false,
            transparent: true,
            // map: meshTexture,

            // color:color[bgColorIdx]
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.add(cityLabel);
          guangZhouRegionMap.add(mesh);
        });
      });
    }
  });
  // composer.reset(renderer)
  // console.log(guangZhouRegionMap, "aa");
  css2dLabelObj[guangZhouRegionMap.uuid] = labelArr;

  scene.add(guangZhouRegionMap);
};

const drawRegionMeshLabel = () => {
  const labelGroup = new THREE.Group();
  regions.forEach((region) => {
    const cityDiv = document.createElement("div");
    let number = Math.random() * 100;
    number = number.toFixed(1);
    cityDiv.className = "region-mesh__label";
    cityDiv.innerHTML = `
    <div class="left">
     <p class="label-title">
      <span class="circle"></span>
      ${region.regionName}监测点</p>
     <p>空气指数：<span class="yellow">良</span></p>
     <p>湿度：<span class="yellow">69%</span></p>
      </div>
      <div class="right">
        <div class="circle">
           ${number}%
          </div>
        </div>
    `;
    // cityDiv.textContent = ;
    const cityLabel = new CSS2DObject(cityDiv);
    cityLabel.position.copy(region.position);
    // cityLabel.position.set(region.position);

    labelGroup.add(cityLabel);
    // regionMesh.add(cityLabel)
  });
  console.log(labelGroup);
  // labelGroup.add()
  return labelGroup;
};
const guangZhouMeshMap = new THREE.Object3D();

const showRegionMeshGraph = () => {
  activeCompName.value = "ecology";

  hideAllObject([gzPlane, guangZhouMeshMap]);

  if (!gzPlane) {
    createCityPlane();
  }
  gzPlane.visible = true;
  guangZhouMeshMap.visible = true;
  if (guangZhouMeshMap.children.length == 0) {
    drawRegionMeshGraph(GuangZhou);
  }
};

const drawRegionMeshGraph = (geoJson) => {
  const features = geoJson.features;
  const color = [
    "#f09135",
    "#eb4629",
    "#dee551",
    "#ed6cdd",
    "#7ad349",
    "#ec6bdc",
  ];
  const labelGroup = drawRegionMeshLabel();

  features.forEach((feature, index) => {
    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          const shape = new THREE.Shape();

          rows.forEach((row, i) => {
            const [x, y] = projection(row);
            if (i == 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          });
          const geometry = new THREE.ShapeGeometry(shape);
          const bgColor = new THREE.Color(
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5
          );

          loader.loadAsync("/imgs/mesh.jpeg").then((meshTexture) => {
            meshTexture.wrapS = THREE.RepeatWrapping;
            meshTexture.wrapT = THREE.RepeatWrapping;

            const material = new THREE.MeshBasicMaterial({
              color: bgColor,
              map: meshTexture,
              opacity: 0.3,
              transparent: true,
              combine: THREE.MixOperation,
            });
            const mesh = new THREE.Mesh(geometry, material);

            guangZhouMeshMap.add(mesh);
          });
        });
      });
    }
  });

  // guangZhouMap.material.map = meshTexture
  guangZhouMeshMap.position.z = setting.geoMapHeight + 0.01;
  camera.rotateZ(Math.PI / 2);
  guangZhouMeshMap.add(labelGroup);
  console.log(guangZhouMeshMap, "guangZhouMeshMap");
  css2dLabelObj[guangZhouMeshMap.uuid] = labelGroup.children;
  // console.log(labelGroup, "labelGroup", css2dLabelObj);
  // console.log(labelGroup.children)
  // scene.add(labelGroup);
  scene.add(guangZhouMeshMap);
};

const initCSS2DRender = () => {
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  administrativeRef.value.appendChild(labelRenderer.domElement);
};

const createCityNameLabel = (position, cityName) => {
  const cityDiv = document.createElement("div");
  cityDiv.className = "city-label";
  cityDiv.textContent = cityName;
  cityDiv.style = "font-size:12px;";
  const cityLabel = new CSS2DObject(cityDiv);
  const [x, y] = projection(position);
  if (cityName == "白云区") {
    cityLabel.position.set(x, -y + 0.3, 0);
  } else if (cityName == "海珠区") {
    cityLabel.position.set(x + 0.2, -y - 0.1, 0);
  } else if (cityName == "荔湾区") {
    cityLabel.position.set(x - 0.1, -y - 0.1, 0);
  } else if (cityName == "天河区") {
    cityLabel.position.set(x + 0.1, -y + 0.1, 0);
  } else {
    cityLabel.position.set(x, -y, 0);
  }
  labelGroup.add(cityLabel);

  return cityLabel;
};
const cacheOutlinePassArr = [];
const curveObjArr = new THREE.Object3D();

const showRegionCurve = () => {
  activeCompName.value = "population";

  hideAllObject([curveObjArr, gzPlane]);
  gzPlane.visible = true;
  curveObjArr.visible = true;
  if (!gzPlane) {
    createCityPlane();
  }

  // if (curveObjArr.children.length > 0 && curveObjArr.visible == false) {

  //   if (composer) {
  //     cacheOutlinePassArr.forEach((outlinePass) => {
  //       composer.addPass(outlinePass);
  //     });
  //   } else {
  //   }
  // }
  // if (composer.passes.length == 0 && curveObjArr.children.length > 0) {
  //   cacheOutlinePassArr.forEach((outlinePass) => {
  //     composer.addPass(outlinePass);
  //   });
  // }

  if (curveObjArr.children.length == 0) {
    createCityCurve();
  }
};

const createCityCurve = () => {
  const posArray = cloneDeep(regions);
  posArray.splice(1, 1);

  const aimPosition = regions[1];

  const blueBloomArr = [];
  const redBloomArr = [];
  posArray.forEach((pos, index) => {
    const startCityPosition = pos.position;

    const endCityPosition = aimPosition.position;
    const middleCityPosition = startCityPosition
      .clone()
      .lerp(endCityPosition, 0.5);
    middleCityPosition.z = 0.3;
    const pointArrays = [
      startCityPosition,
      middleCityPosition,
      endCityPosition,
    ];
    const curve = new THREE.CatmullRomCurve3(pointArrays);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const tubeGeometry = new THREE.TubeGeometry(curve, 640, 0.005, 80, false);
    const tubeMesh = new THREE.Mesh(tubeGeometry, material);
    // scene.add(tubeMesh);
    curveObjArr.add(tubeMesh);
    if (index % 2 == 0) {
      blueBloomArr.push(tubeMesh);
    } else {
      redBloomArr.push(tubeMesh);
    }
  });
  // console.log(curveObjArr.position, "position");
  curveObjArr.position.z = -0.1;

  const blueOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  blueOutlinePass.edgeStrength = 2;
  blueOutlinePass.edgeGlow = 2;
  // 设置轮廓边框的粗细
  blueOutlinePass.edgeThickness = 3;
  blueOutlinePass.pulsePeriod = 1;
  blueOutlinePass.visibleEdgeColor.set("#304FFE");
  blueOutlinePass.selectedObjects = blueBloomArr;

  composer?.addPass(blueOutlinePass);
  cacheOutlinePassArr.push(blueOutlinePass);
  const redOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  redOutlinePass.edgeStrength = 2;
  redOutlinePass.edgeGlow = 2;
  redOutlinePass.edgeThickness = 3;

  redOutlinePass.pulsePeriod = 1;
  // 设置轮廓边框的粗细
  redOutlinePass.visibleEdgeColor.set("#DD2C00");
  redOutlinePass.selectedObjects = redBloomArr;
  composer?.addPass(redOutlinePass);
  cacheOutlinePassArr.push(redOutlinePass);
  //

  const circleGeometry = new THREE.SphereGeometry(0.02, 32, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: "#fff" });
  const sphere = new THREE.Mesh(circleGeometry, circleMaterial);
  sphere.position.z = 0.04;
  sphere.position.y = -0.02;
  sphere.position.x = 0.01;
  const sphereOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  sphereOutlinePass.edgeStrength = 4;
  sphereOutlinePass.edgeGlow = 4;
  sphereOutlinePass.edgeThickness = 3;

  sphereOutlinePass.pulsePeriod = 0;
  // 设置轮廓边框的粗细
  sphereOutlinePass.visibleEdgeColor.set("#fff");
  sphereOutlinePass.selectedObjects = [sphere];
  composer?.addPass(sphereOutlinePass);
  cacheOutlinePassArr.push(sphereOutlinePass);
  curveObjArr.add(sphere);
  // scene.add(sphere);

  const labelGroup = createCurve2DLabel();
  curveObjArr.add(labelGroup);
  css2dLabelObj[curveObjArr.uuid] = labelGroup.children;
  scene.add(curveObjArr);

  // labelGroup.position.z = 0.1
  // scene.add(labelGroup);
};


const createRegionLine = (cityData) => {
  const jsonData = cloneDeep(cityData)
  const features = jsonData.features
  features.forEach(feature => {
    const province = new THREE.Object3D();
    province.properties = feature.properties.name
    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type == 'MultiPolygon') {
      coordinates.forEach(coordinate => {
        coordinate.forEach(rows => {

        })
      })
    }
  })
}

const createCurve2DLabel = () => {
  const labelGroup = new THREE.Group();
  regions.forEach((region) => {
    console.log(region, "region");
    const cityDiv = document.createElement("div");
    let number = Math.random() * 100;
    number = number.toFixed(1);
    cityDiv.className = "curve-mesh__label";
    cityDiv.innerHTML = `
      ${region.regionName}
    `;
    // cityDiv.textContent = ;
    const cityLabel = new CSS2DObject(cityDiv);
    cityLabel.position.copy(region.position);
    // cityLabel.position.set(region.position);

    labelGroup.add(cityLabel);
    // regionMesh.add(cityLabel)
  });

  return labelGroup;
};

const createEffectComposer = () => {
  composer = new EffectComposer(renderer);

  composer.setSize(window.innerWidth, window.innerHeight);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  const bloomPass = new BloomPass(
    1, // 亮度阈值
    25, // 泛光强度
    0.01, // 模糊半径
    256 // 分辨率
  );
  // composer.add(bloomPass)
  composer.addPass(unrealBloomPass);
  // scene.add(bloomPass);
};

const createCurveLine = () => {
  const startCityPosition = regions[0].position;
  const endCityPosition = regions[10].position;

  // const pointArrays = [
  //   new THREE.Vector3(startCityPosition[0], startCityPosition[1], 0),
  //   new THREE.Vector3(
  //     (startCityPosition[0] + endCityPosition[0]) / 2,
  //     (startCityPosition[1] + endCityPosition[1]) / 2,
  //     0.2
  //   ),
  //   new THREE.Vector3(endCityPosition[0], endCityPosition[1], 0),
  // ];

  const pointArrays = [
    startCityPosition,
    startCityPosition.clone().lerp(endCityPosition, 0.5),
    endCityPosition,
  ];
  const curve = new THREE.CatmullRomCurve3(pointArrays);

  // console.log(curve, "aa");
  const points = curve.getPoints(100);
  const geometry = new LineGeometry();

  geometry.setPositions(points.map((p) => p.toArray()).flat());
  const material = new LineMaterial({
    color: 0x304ffe,
    linewidth: 3,
  });
  material.resolution.set(window.innerWidth, window.innerHeight);
  const curveObject = new THREE.Line(geometry, material);
  curveObject.computeLineDistances();

  const outLinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outLinePass.selectedObjects = [curveObject];
  outLinePass.edgeStrength = 1;

  curveObject.scale.set(2, 2, 2);
  scene.add(curveObject);
};

const gdpObjection = {
  天河区: 6215.72,
  黄埔区: 4313.76,
  越秀区: 3650.18,
  番禺区: 2705.47,
  海珠区: 2502.52,
  白云区: 2476.2,
  南沙区: 2252.58,
  花都区: 1770.81,
  增城区: 1325.27,
  荔湾区: 1215.57,
  从化区: 410.92,
};

const region3DBoundary = new THREE.Object3D();

const showRegion3DBoundary = () => {
  activeCompName.value = "economics";
  hideAllObject(region3DBoundary);
  // composer.addPass(bloomPass);
  gzPlane.visible = true;
  region3DBoundary.visible = true;
  if (region3DBoundary.children.length == 0) {
    createRegion3DBoundary(GuangZhou);
  } else {
    window.addEventListener("mousemove", createGDPBar);
  }
};

const region3D = [];
let GDBBarCssObj = null;
let GDBDiv;
const createRegion3DBoundary = (cityJSON) => {
  const colors = ["#4966b6", "#127cac", "#ff8a8a"];
  // const guangZhouMap = new THREE.Object3D();
  const features = cityJSON.features;
  const labelArr = [];
  const highLine = [];
  features.forEach((feature, index) => {
    const properties = feature.properties;

    const gdp = gdpObjection[properties.name];
    const height = (gdpObjection[properties.name] / 1500) * 0.1;

    let color = gdp > 4000 ? colors[2] : gdp > 2000 ? colors[1] : colors[0];

    const cityLabel = createCityNameLabel(properties.center, properties.name);
    cityLabel.position.z = height;
    labelArr.push(cityLabel);
    const coordinates = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          const shape = new THREE.Shape();
          const pointsArray = new Array();
          rows.forEach((row, i) => {
            const [x, y] = projection(row);
            pointsArray.push(new THREE.Vector3(x, -y, 0.1));
            if (i == 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          });
          // 面
          const lineGeometry = new THREE.BufferGeometry();
          lineGeometry.setFromPoints(pointsArray);

          const lineMaterial = new THREE.LineBasicMaterial({
            // color: lineColor,
            color: new THREE.Color("#fff"),
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          line.position.z = height - 0.1;

          highLine.push(line);
          region3DBoundary.add(line);

          const extrudeSettings = {
            depth: height,
            bevelEnabled: false,
            bevelSegments: 1,
            bevelThickness: 0.2,
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new THREE.MeshBasicMaterial({
            // color: 0xff0000,
            opacity: 0.5,
            transparent: true,
            // color: lineColor,
            color: new THREE.Color(color),
            // wireframe: true,
            // side: THREE.DoubleSide,
            // color: bgColor,
            // color:color[bgColorIdx]
          });
          const material1 = new THREE.MeshBasicMaterial({
            // vertexColors: THREE.VertexColors,
            opacity: 0.8,
            transparent: true,
            // color: lineColor,
            color: new THREE.Color(color),
            // color: color,
          });
          const mesh = new THREE.Mesh(geometry, [material, material1]);
          region3D.push(mesh);
          mesh.add(cityLabel);
          region3DBoundary.add(mesh);
        });
      });
    }
  });

  // bloom
  const lineOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  lineOutlinePass.renderToScreen = true;
  lineOutlinePass.edgeStrength = 20;
  lineOutlinePass.edgeGlow = 20;
  // 设置轮廓边框的粗细
  lineOutlinePass.edgeThickness = 30;
  // lineOutlinePass.pulsePeriod = 1;
  lineOutlinePass.visibleEdgeColor.set("#FFf");
  lineOutlinePass.selectedObjects = highLine;
  composer?.addPass(lineOutlinePass);
  GDBDiv = document.createElement("div");
  // GDBDiv.id = "GDB-bar";
  GDBDiv.innerHTML =
    '<div id="GDB-bar-echart" class="GDB-bar-echart">GDB-Bar</div>';
  GDBDiv.style = "height:200px;width:280px;";
  GDBBarCssObj = new CSS2DObject(GDBDiv);
  GDBBarCssObj.visible = true;
  GDBBarCssObj.position.y = 100000;

  region3DBoundary.add(GDBBarCssObj);

  region3DBoundary.position.z = -0.1;
  scene.add(region3DBoundary);
  css2dLabelObj[region3DBoundary.uuid] = labelArr;
  nextTick(() => {
    window.addEventListener("mousemove", createGDPBar);

  })

  // createGDPBar();
  // nextTick(() => {
  //   createGDPBarEchart();
  // });
  // console.log(GDBDiv.getElementsByClassName("GDB-bar-echart")[0], "GDBDiv");
};
let GDBBar;
const createGDPBarEchart = () => {
  // const chartDom
  const chartDom = GDBDiv.getElementsByClassName("GDB-bar-echart")[0];
  console.log(chartDom, chartDom.clientWidth, 'createGDP');
  chartDom.style = "min-width:260px;min-height:200px;";
  // console.log(chartDom.clientWidth, "chartDom");
  // if (!chartDom) return;
  if (!GDBBar) {
    GDBBar = echarts.init(chartDom);
  }
  const options = {
    xAxis: {
      type: "category",
      data: ["2017", "2018", "2019", "2020", "2021", "2022", "2023"],
      axisLabel: {
        color: "#fff",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#fff",
      },
    },
    color: [
      "#64c9da",
      "#84dae5",
      "#c5f5fc",
      "#fafffe",
      "#66c5d2",
      "#82dae7",
      "#cbf6fe",
    ],
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        colorBy: "data",
        distance: 0,
        type: "bar",
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#83bff6" },
            { offset: 0.5, color: "#188df0" },
            { offset: 1, color: "#188df0" },
          ]),
        },
      },
    ],
    grid: {
      top: 40,
      bottom: 40,
      left: 40,
    },
  };
  GDBBar.setOption(options);
};

const raycaster = new THREE.Raycaster();
let cacheRegion3DObj, cacheRegion3DColor, cacheRegionGDBBar;

const createGDPBar = (event) => {
  const pointer = new THREE.Vector2();

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  // console.log(region3D, region3DBoundary, "region3D");
  const interects = raycaster.intersectObjects(region3D, false);
  if (interects.length > 0) {
    if (cacheRegion3DObj?.object.uuid == interects[0].object.uuid) return;
    if (cacheRegion3DObj) {
      cacheRegion3DObj.object.material[0].color = cacheRegion3DColor;
      cacheRegion3DObj.object.material[1].color = cacheRegion3DColor;
    }
    cacheRegion3DObj = interects[0];
    cacheRegion3DColor = interects[0].object.material[0].color;

    console.log(interects[0].object.material);
    interects[0].object.material[0].color = new THREE.Color("#69F0AE");
    interects[0].object.material[1].color = new THREE.Color("#69F0AE");
    GDBBarCssObj.position.copy(interects[0].point);
    GDBBarCssObj.visible = true;
    nextTick(() => {
      createGDPBarEchart();

    })
    console.log(interects, "interface");
  } else {
    GDBBarCssObj.visible = false;
    if (cacheRegion3DObj) {
      cacheRegion3DObj.object.material[0].color = cacheRegion3DColor;
      cacheRegion3DObj.object.material[1].color = cacheRegion3DColor;
      cacheRegion3DObj = null;
    }
  }
  // const chartDom = GDBDiv.getElementsByClassName("GDB-bar-echart")[0];

  // console.log(chartDom.clientWidth, "chartDom height");
};

const hideAllObject = (noHideObj, isDownComposer) => {
  let uuids = [];
  if (Array.isArray(noHideObj)) {
    uuids = noHideObj.map((ite) => ite.uuid);
  } else {
    uuids = [noHideObj.uuid];
  }

  if (isDownComposer) {
    isPausedComposer = true;
  } else {
    isPausedComposer = false;
  }

  const passes = composer.passes;
  if (passes.includes()) {
  }

  for (let prop in css2dLabelObj) {
    if (!uuids.includes(prop)) {
      const labels = css2dLabelObj[prop];
      console.log(labels, "labels");
      labels.forEach((label) => {
        // label.element.style.display = "none";
        label.visible = false;
      });
    } else {
      const labels = css2dLabelObj[prop];
      labels.forEach((label) => {
        label.visible = true;
      });
    }
  }
  window.removeEventListener("mousemove", createGDPBar);

  const AllObject = [
    guangZhouRegionMap,
    curveObjArr,
    gzPlane,
    guangZhouMeshMap,
    region3DBoundary,
  ];
  AllObject.forEach((ite) => {
    if (ite && !uuids.includes(ite.uuid)) {
      // console.log(ite,noHideObj,'ite')
      ite.visible = false;
    }
  });
  // guangZhouRegionMap.visible = false;
  // curveObjArr.visible = false;
  // if (gzPlane) gzPlane.visible = false;
  // guangZhouMeshMap.visible = false;
  // region3DBoundary.visible = false;
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
  labelRenderer?.render(scene, camera);

  if (!isPausedComposer) composer?.render();
};

onMounted(async () => {
  await initMap();
  await getRegionCenterData(GuangZhou);

  createEffectComposer();
  createLight();
  initCSS2DRender();
  initControls();
  animate();
  // console.log(composer, "composer");
  // drawCityBoundary(GuangZhouBoundary);

  createCityPlane();
  // createRegion3DBoundary(GuangZhou);
  // drawRegionGraph(GuangZhou);
  // drawRegionMeshGraph(GuangZhou);
  //   cubeTest();
  // initAxesHelper();
  // createCityCurve();
  showRegionGraph()
});
</script>
<style scoped lang="less">
:deep(.region-mesh__label) {
  background: rgba(80, 53, 78, 0.5);
  padding: 4px;
  font-size: 12px;
  display: flex;

  .left {
    margin-right: 8px;

    .label-title {
      margin-bottom: 5px;

      .circle {
        width: 10px;
        height: 10px;
        display: inline-block;
        background: #26a69a;
        border-radius: 50%;
      }
    }
  }

  .right {
    .circle {
      background-color: rgba(255, 255, 255, 0.3);
      height: 100%;
      width: 100%;
      border-radius: 50%;
      /* padding: 10px; */
      width: 44px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 700;
    }
  }

  .yellow {
    color: #fdd835;
  }

  p {
    margin: 4px 0;
  }
}

:deep(.curve-mesh__label) {
  background: #3f77c2;
  color: #60cdf1;
  font-size: 12px;
  padding: 2px 4px;
  border: 1px solid #fff;
}

:deep(#GDB-bar-echart) {
  width: 280px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
}
</style>
