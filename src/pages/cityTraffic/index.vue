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

import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
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

let scene, camera, renderer, controls, labelRenderer, composer;
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

const animationList = [];
const clock = new THREE.Clock();

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
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(70, 24, 0);
    camera.rotation.set(-1.6, 1, 1);
    // camera.lookAt(60,0,0)
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    cityTrafficRef.value.appendChild(renderer.domElement);

    renderer.render(scene, camera);
    window.addEventListener("resize", debounce(onWindowResize));
    resolve();
    window.addEventListener("click", () => {
      // console.log(camera, "camera");
    });
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
  const light = new THREE.AmbientLight(0xfff5ee, 0.4); // soft white light
  scene.add(light);

  const pointLight = new THREE.DirectionalLight(0xfff5ee, 0.8);
  pointLight.position.set(50, 50, 0);
  scene.add(pointLight);

  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(50, 50, 0);
  scene.add(sphere);
};

const createComposer = () => {
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
  // composer.addPass(bloomPass)
  // composer.addPass(unrealBloomPass);
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
  const clock = new THREE.Clock();
  controls.update();
  renderer.render(scene, camera);
  labelRenderer?.render(scene, camera);
  composer?.render();
  animationList.forEach((animation) => animation());
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

const createRing = (options = {
  innerRadius:10,
  outRadius:15
}) => {
  // 创建一个圆环几何体
  const geometry = new THREE.RingGeometry(innerRadius, 11, 84);
  // 创建一个着色器材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color("#b4c2dd") }, // 圆环的颜色
      borderWidth: { value: 0.05 }, // 圆环的边框宽度
      opacity: { value: 0.6 }, // 圆环的透明度
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 color;
    uniform float borderWidth;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      float r = length(vUv - vec2(0.5)); // 计算像素点到圆心的距离
      float a = smoothstep(0.5 - borderWidth, 0.5, r); // 计算像素点的透明度，边缘平滑处理
      a *= opacity * (1.0 - r * 1.0); // 让透明度从外到内逐渐变化
      gl_FragColor = vec4(color, a); // 设置像素点的颜色和透明度
    }
  `,
    transparent: true, // 开启透明度
    side: THREE.DoubleSide,
  });

  // 创建一个圆环网格对象
  const ring = new THREE.Mesh(geometry, material);
  ring.rotateX(-Math.PI / 2);

  

  // 将圆环添加到场景中
  scene.add(ring);
};

const createDashCircle = () => {};

const createInnerCircle = () => {
  // const cylinderGeometry = new THREE.CylinderGeometry(10,84,1);
  // const cylinderMaterial = [
  //   new THREE.MeshBasicMaterial({
  //     side:THREE.DoubleSide,
  //     transparent:true
  //   }),

  // ]

  const circleGeometry = new THREE.CircleGeometry(10, 84);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.1,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const circle = new THREE.Mesh(circleGeometry, material);
  circle.rotateX(-Math.PI / 2);
  circle.position.y = 10;
  circle.position.x = 20;

  const ringGeometry = new THREE.RingGeometry(10, 11, 84);
  // const ringMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  //   side: THREE.DoubleSide,
  //   transparent: true,
  //   opacity: 0.4,
  // });
  var vertexShader = `
  varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

  // 定义片元着色器代码
  var fragmentShader = `
  uniform vec3 color;
    uniform float borderWidth;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      float r = length(vUv - vec2(0.5)); // 计算像素点到圆心的距离
      float a = smoothstep(0.5 - borderWidth, 0.5, r); // 计算像素点的透明度，边缘平滑处理
      console.log(a,'a');
      a *= opacity * (r * 1.0); // 让透明度从外到内逐渐变化
      gl_FragColor = vec4(color, 1.0); // 设置像素点的颜色和透明度
    }
`;
  const ringMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_radius: {
        value: 0.1,
      },
      u_opacity: {
        value: 0.5,
      },
      u_color: {
        value: new THREE.Color("#00ff00"),
      },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const outRingGeometry = new THREE.RingGeometry(11, 11.1, 84);
  const outRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    // opacity:0.4
  });

  const ringOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  ringOutlinePass.edgeStrength = 2;
  ringOutlinePass.edgeGlow = 6;
  // 设置轮廓边框的粗细
  ringOutlinePass.edgeThickness = 3;
  // ringOutlinePass.pulsePeriod = 1;
  ringOutlinePass.visibleEdgeColor.set("#ffffff");
  const outRingMesh = new THREE.Mesh(outRingGeometry, outRingMaterial);
  outRingMesh.position.set(20, 10, 0);
  outRingMesh.rotateX(-Math.PI / 2);

  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.position.set(20, 10, 0);
  ringMesh.rotateX(-Math.PI / 2);

  // ringOutlinePass.selectedObjects = [outRingMesh];

  composer.addPass(ringOutlinePass);

  scene.add(ringMesh);
  scene.add(circle);
  // scene.add(outRingMesh);
};

const create3DCircle = () => {
  const vertexShader = `
#define PI 3.14
#define TWO_PI 6.28

#define TIMESCALE 0.5

#define BLUR_STRENGTH 2.0
#define BLUR_RANGE 2.7

#define UI_COLOR vec4(0.5, 0.8, 1.0, 1.0)

float hash12(vec2 x)
{
 	return fract(sin(dot(x, vec2(43.5287, 41.12871))) * 523.582);
}

vec2 hash21(float x)
{
 	return fract(sin(x * vec2(24.0181, 52.1984)) * 5081.4972);
}

float hash11(float x)
{
 	return fract(sin(x * 42.146291) * 4215.4827);
}

vec2 hash22(vec2 x)
{
 	return fract(sin(x * mat2x2(24.4372, 12.47864, 32.3874, 29.4873)) * 4762.832);
}

mat2x2 rotationMatrix(in float angle)
{
 	return mat2x2(-cos(angle), sin(angle), -sin(angle), -cos(angle));
}

//Blur function
vec4 blur(in sampler2D sampler, in vec2 fragCoord, in vec2 resolution)
{
    vec2 uv = fragCoord / resolution;
    float blurStrength = distance(uv, vec2(0.5));
    blurStrength = pow(blurStrength, BLUR_RANGE) * (resolution.x / 100.0) * BLUR_STRENGTH;
    vec4 sum = vec4(0.0);
    vec2 pixelSize = vec2(1.0) / resolution;
	for (float x = -1.0; x <= 1.0; x += 1.0)
    {
     	for (float y = -1.0; y <= 1.0; y += 1.0)
        {
            sum += texture(sampler, uv + vec2(x, y) * pixelSize * blurStrength);
        }
    }

    return sum / 9.0;
}

void main(out vec4 fragColor, in vec2 fragCoord) {


}

    `;
};

const createOutCircle = () => {
  const circleGeometry = new THREE.CircleGeometry(15, 84);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.2,
    transparent: true,
  });

  const circle = new THREE.Mesh(circleGeometry, material);
  circle.rotateX(-Math.PI / 2);
  circle.position.y = 10;
  circle.position.x = 20;

  const ringGeometry = new THREE.RingGeometry(15, 15.1, 84);
  const ringMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: 3,
    gapSize: 1,
  });

  const ringOutlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  ringOutlinePass.edgeStrength = 3;
  ringOutlinePass.edgeGlow = 3;
  // 设置轮廓边框的粗细
  ringOutlinePass.edgeThickness = 3;
  // ringOutlinePass.pulsePeriod = 1;
  ringOutlinePass.visibleEdgeColor.set("#304FFE");

  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.position.set(20, 10, 0);
  ringMesh.rotateX(-Math.PI / 2);

  ringOutlinePass.selectedObjects = [ringMesh];

  composer.addPass(ringOutlinePass);

  scene.add(ringMesh);
  scene.add(circle);
};

const createVisitorsFlowrate = () => {
  createWall();
};

const createWallByPath = ({
  height = 10,
  path = [],
  material,
  expand = true,
}) => {
  let verticesByTwo = null;
  // 1.处理路径数据  每两个顶点为为一组
  if (expand) {
    // 1.1向y方向拉伸顶点
    verticesByTwo = path.reduce((arr, [x, y, z]) => {
      return arr.concat([
        [
          [x, y, z],
          [x, y + height, z],
        ],
      ]);
    }, []);
  } else {
    // 1.2 已经处理好路径数据
    verticesByTwo = path;
  }
  // 2.解析需要渲染的四边形 每4个顶点为一组
  const verticesByFour = verticesByTwo.reduce((arr, item, i) => {
    if (i === verticesByTwo.length - 1) return arr;
    return arr.concat([[item, verticesByTwo[i + 1]]]);
  }, []);
  // 3.将四边形面转换为需要渲染的三顶点面
  const verticesByThree = verticesByFour.reduce((arr, item) => {
    const [[point1, point2], [point3, point4]] = item;
    return arr.concat(
      ...point2,
      ...point1,
      ...point4,
      ...point1,
      ...point3,
      ...point4
    );
  }, []);
  const geometry = new THREE.BufferGeometry();
  // 4. 设置position
  const vertices = new Float32Array(verticesByThree);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]

  // 5.1 以18个顶点为单位分组
  const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
    .fill(0)
    .map((item, i) => {
      return verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6);
    });
  // 5.2 按uv周期分组
  const pointsGroupBy63 = pointsGroupBy18.map((item, i) => {
    return new Array(item.length / 3)
      .fill(0)
      .map((it, i) => item.slice(i * 3, (i + 1) * 3));
  });
  // 5.3根据BoundingBox确定uv平铺范围
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const rangeX = max.x - min.x;
  const uvs = [].concat(
    ...pointsGroupBy63.map((item) => {
      const point0 = item[0];
      const point5 = item[5];
      const distance =
        new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) /
        (rangeX / 10);
      return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
    })
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
  );
  // 更新法线
  // geometry.computeVertexNormals();
  const meshMat =
    material ||
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide,
    });
  return new THREE.Mesh(geometry, meshMat);
};

const createOpacityWallMat = ({
  height = 10,
  color = "#00ffff",
  opacity = 0.5,
  speed = 1,
}) => {
  // 顶点着色器
  const vertexShader = `
          uniform vec3 u_color;

          uniform float time;
          uniform float u_height;
          varying float v_opacity;

          void main() {
              vec3 vPosition = position;
              v_opacity = mix(1.0, 0.0, position.y / u_height * 1.0) * (1.0 + sin(time) * 0.5);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1);
          }
       `;
  // 片元着色器
  const fragmentShader = `
          uniform vec3 u_color;
          uniform float u_opacity;
          varying float v_opacity;
          void main() {
              gl_FragColor = vec4(u_color, v_opacity * u_opacity);
          }
        `;

  return new THREE.ShaderMaterial({
    uniforms: {
      u_height: {
        value: height,
      },
      u_opacity: {
        value: opacity,
      },
      u_color: {
        value: new THREE.Color(color),
      },
      time: {
        value: 0,
      },
      speed: {
        value: speed,
      },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};

const createWall = () => {
  // 路径;
  const path = [
    [80, 0, -40],
    [10, 0, 0],
    [60, 0, 50],
    [0, 0, 0],
    [-60, 0, 50],
    [-50, 0, -30],
    [80, 0, -40],
  ];
  const material = createOpacityWallMat({ height: 15, speed: 5 });
  const wallMesh = createWallByPath({
    path,
    material,
    height: 15,
  });
  // 动画
  animationList.push(() => {
    wallMesh.material.uniforms.time.value +=
      clock.getDelta() * wallMesh.material.uniforms.speed.value;
  });
  scene.add(wallMesh);
};

onMounted(async () => {
  await initMap();
  await initCSS2DRender();
  createComposer();

  initControls();
  createLight();
  initAxesHelper();

  // createCity();
  // createInnerCircle();
  // createOutCircle();

  // createSkyAndSun();
  // createVisitorsFlowrate();
  createRing();
  animate();
});
</script>
<style scoped lang="less"></style>
