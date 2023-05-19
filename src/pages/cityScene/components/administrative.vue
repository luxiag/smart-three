<template>
  <div class="administrative-page">
    <div ref="administrativeRef"></div>
  </div>
</template>
<script setup>
import GuangZhou from "@/assets/json/GuangZhou.json";
import GuangZhouBoundary from "@/assets/json/GuangZhouBoundary.json";
import * as THREE from "three";
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

let map, scene, camera, renderer, labelRenderer, controls;
const regions = [];
const labelGroup = new THREE.Group();

const administrativeRef = ref();
const loader = new THREE.TextureLoader();

const setting = {
  geoMapHeight: -0.1,
};

const initMap = () => {
  return new Promise((resolve) => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f12);
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

const createCityPlaneLabel = () => {};

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
  const gzPlane = new THREE.Mesh(planGeometry, material);
  gzPlane.position.z = -0.1;
  gzPlane.position.y = 0.28;
  gzPlane.position.x = 0.65;
  scene.add(gzPlane);
};

const drawRegionGraph = (geoJson) => {
  const features = geoJson.features;
  const guangZhouMap = new THREE.Object3D();
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
          const bgColorIdx =
            index > color.length ? index % color.length : index;

          const meshTexture = loader.load("/imgs/mesh.jpg");
          const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: bgColor,
            // map: meshTexture,

            // color:color[bgColorIdx]
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.add(cityLabel);
          guangZhouMap.add(mesh);
        });
      });
    }
  });
  console.log(guangZhouMap);
  // 获取物体边界框
  var bbox = new THREE.Box3().setFromObject(guangZhouMap);
  var size = new THREE.Vector3();
  bbox.getSize(size);

  console.log(size.x, size.y, size.z);
  //   guangZhouMap.position.z = 0.2;
  scene.add(guangZhouMap);
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

const drawRegionMeshGraph = (geoJson) => {
  const features = geoJson.features;
  const guangZhouMap = new THREE.Object3D();
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
          const bgColorIdx =
            index > color.length ? index % color.length : index;

          const gzMap = loader.load("/imgs/guangzhouMap.png");
          const meshTexture = loader.load("/imgs/mesh.jpeg");
          meshTexture.wrapS = THREE.RepeatWrapping;
          meshTexture.wrapT = THREE.RepeatWrapping;
          // meshTexture.repeat.set(1, 2);
          const material = new THREE.MeshBasicMaterial({
            // side: THREE.DoubleSide,
            color: bgColor,
            map: meshTexture,
            opacity: 0.5,
            transparent: true,
            combine: THREE.MixOperation,

            // color:color[bgColorIdx]
          });
          const mesh = new THREE.Mesh(geometry, material);
          // mesh.add(labelGroup.children[index])
          // console.log(labelGroup.children[index])
          // mesh.add(cityLabel);
          guangZhouMap.add(mesh);
        });
      });
    }
  });

  // guangZhouMap.material.map = meshTexture
  guangZhouMap.position.z = setting.geoMapHeight + 0.01;
  camera.rotateZ(Math.PI / 2);
  // console.log(labelGroup.children)
  scene.add(labelGroup);
  scene.add(guangZhouMap);
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

const createCityCurve = () => {
  console.log(regions, "regions");
  const startCityPosition = regions[0].position;
  const endCityPosition = regions[1].position;

  const pointArrays = [
    new THREE.Vector3(startCityPosition[0], startCityPosition[1], 0),
    new THREE.Vector3(
      (startCityPosition[0] + endCityPosition[0]) / 2,
      (startCityPosition[1] + endCityPosition[1]) / 2,
      0.2
    ),
    new THREE.Vector3(endCityPosition[0], endCityPosition[1], 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pointArrays);

  console.log(curve, "aa");
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

  //   curveObject.scale.set(2, 2, 2);
  scene.add(curveObject);
};

const createRegion3DBoundary = (cityJSON) => {
  const guangZhouMap = new THREE.Object3D();
  const features = cityJSON.features;
  features.forEach((feature, index) => {
    const properties = feature.properties;
    const cityLabel = createCityNameLabel(properties.center, properties.name);
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
          const lineColor = new THREE.Color(
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5
          );
          const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          guangZhouMap.add(line);

          const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: false,
            bevelSegments: 1,
            bevelThickness: 0.2,
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            opacity: 0.1,
            transparent: true,
            // wireframe: true,
            // side: THREE.DoubleSide,
            // color: bgColor,
            // color:color[bgColorIdx]
          });
          const material1 = new THREE.MeshStandardMaterial({
            vertexColors: THREE.VertexColors,
            opacity: 0.5,
            transparent: true,

            // color: color,
          });
          const mesh = new THREE.Mesh(geometry, [material, material1]);
          mesh.add(cityLabel);
          guangZhouMap.add(mesh);
        });
      });
    }
  });
  scene.add(guangZhouMap);
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
  labelRenderer?.render(scene, camera);
};

onMounted(async () => {
  await initMap();
  await getRegionCenterData(GuangZhou);
  createLight();
  initCSS2DRender();
  initControls();
  animate();
  // drawCityBoundary(GuangZhouBoundary);
  createCityPlane();
  // createRegion3DBoundary(GuangZhou);
  // drawRegionGraph(GuangZhou);
  // drawRegionMeshGraph(GuangZhou);
  //   cubeTest();
  initAxesHelper();
  createCityCurve();
});
</script>
<style lang="less" scoped>
.administrative-page {
  width: 100%;
  height: 100%;
}
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
</style>
