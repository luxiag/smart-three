<template>
  <div class="regional-population">
    <div
      id="regionalPopulationContainer"
      ref="regionalPopulationContainer"
    ></div>
  </div>
</template>
<script setup>
import * as Cesium from "cesium";
import { onMounted } from "vue";
import CesiumNavigaion from "cesium-navigation-es6";

const regionalPopulationContainer = ref();
const initMap = () => {
  const viewer = new Cesium.Viewer(regionalPopulationContainer.value, {
    // 是否显示信息窗口
    // infoBox: false,
    // 是否显示查询按钮
    animation: true,
    geocoder: false,
    // 不显示home按钮
    homeButton: false,
    // 控制查看器的显示模式
    sceneModePicker: false,
    // 是否显示图层选择
    baseLayerPicker: false,
    // 是否显示帮助按钮
    navigationHelpButton: false,
    // 是否播放动画
    animation: false,
    // 是否显示时间轴
    timeline: false,
    // 是否显示全屏按钮
    fullscreenButton: false,
    shouldAnimate: true,

    // imageryProvider: new Cesium.UrlTemplateImageryProvider({
    //   url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
    // }),
    // terrainProvider: new Cesium.CesiumTerrainProvider({
    //   url: "http://data.marsgis.cn/terrain",
    // }),
    // skyAtmosphere: false,
    // orderIndependentTranslucency: false,
    // contextOptions: {
    //   webgl: {
    //     alpha: true,
    //   },
    // },
  });

  // 设置沙箱允许使用js
  var iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0];
  iframe.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-popups allow-forms"
  );
  iframe.setAttribute("src", "");


  viewer.terrainProvider = Cesium.createWorldTerrain();
  // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";
  viewer.scene.sun.show = false;
  viewer.scene.moon.show = true;
  viewer.scene.undergroundMode = true;

  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.show = true;
  // 取消天空盒显示
  viewer.scene.skyBox.show = false;
  // 设置背景为黑色
  viewer.scene.backgroundColor = Cesium.Color.BLACK;
  // 设置抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = true;

  // 广州塔
  var postion = Cesium.Cartesian3.fromDegrees(
    // 经度
    113.3301,
    // 纬度
    23.0991,
    // 高度
    1500
  );
  viewer.camera.flyTo({
    destination: postion,
    orientation: {
      heading: Cesium.Math.toRadians(-45),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 2,
  });

  return viewer;
};

const createMousePosition = () => {
  const divDom = document.createElement("div");
  divDom.style.cssText = `
      position: fixed;
      bottom:0;
      right:0;
      width:200px;
      height:40px;
      background-color: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 14px;
      line-height: 40px;
      text-align: center;
      z-index: 100;
    `;
  document.body.appendChild(divDom);

  //   监听鼠标的移动事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((movement) => {
    //   获取鼠标的坐标
    const cartesian = viewer.camera.pickEllipsoid(
      movement.endPosition,
      viewer.scene.globe.ellipsoid
    );
    if (cartesian) {
      //   转换成经纬度
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitudeString = Cesium.Math.toDegrees(
        cartographic.longitude
      ).toFixed(2);
      const latitudeString = Cesium.Math.toDegrees(
        cartographic.latitude
      ).toFixed(2);
      const heightString = cartographic.height;
      //   显示经纬度
      // console.log(
      //   `经度：${longitudeString} 纬度：${latitudeString} 高度：${heightString}`
      // );
      divDom.innerHTML = `经度：${longitudeString} 纬度：${latitudeString} `;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

// 修改地图的底色
const modifyMap = (viewer) => {
  // 获取地图影像图层
  let baseLayer = viewer.imageryLayers.get(0);
  //设置2个变量，用来判断是否进行颜色的翻转和过滤
  baseLayer.invertColor = true;

  baseLayer.filterRGB = [0, 50, 100]; //[255,255,255] = > [0,50,100]
  //   更改底图着色器的代码
  const baseFragmentShader =
    viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
  // console.log(baseFragmentShader);

  // 循环修改着色器
  for (let i = 0; i < baseFragmentShader.length; i++) {
    // console.log(baseFragmentShader[i]);
    const strS = "color = czm_saturation(color, textureSaturation);\n#endif\n";
    let strT = "color = czm_saturation(color, textureSaturation);\n#endif\n";
    if (baseLayer.invertColor) {
      strT += `
        color.r = 1.0 - color.r;
        color.g = 1.0 - color.g;
        color.b = 1.0 - color.b;
      `;
    }
    if (baseLayer.filterRGB) {
      strT += `
        color.r = color.r*${baseLayer.filterRGB[0]}.0/255.0;
        color.g = color.g*${baseLayer.filterRGB[1]}.0/255.0;
        color.b = color.b*${baseLayer.filterRGB[2]}.0/255.0;
      `;
    }

    baseFragmentShader[i] = baseFragmentShader[i].replace(strS, strT);
  }
};

const modifyBuild = (viewer) => {
  // 添加3D建筑
  let tiles3d = new Cesium.createOsmBuildings();
  const osmBuildings = viewer.scene.primitives.add(tiles3d);

  tiles3d.style = new Cesium.Cesium3DTileStyle({
    show: "${feature['name']} !== '广州塔'",
  });

  //监听当瓦片加载时候执行事件
  tiles3d.tileVisible.addEventListener(function (tile) {
    // console.log(tile);
    const cesium3DTileCon = tile.content;
    const featuresLength = cesium3DTileCon.featuresLength;
    // console.log(cesium3DTileCon);
    for (let i = 0; i < featuresLength; i++) {
      const model = cesium3DTileCon.getFeature(i).content._model;

      // 修改模型的片元着色器
      const fragmentShaderSource =
        (model._rendererResources.sourceShaders[1] = `
              varying vec3 v_positionEC;

              void main()
              {
                  czm_materialInput materialInput;
                  // 获取模型position信息
                  vec4 position = czm_inverseModelView * vec4(v_positionEC, 1.0);
                  //   根据高度来设置渐变颜色
                  float  strength = position.z/200.0;
                  gl_FragColor = vec4(strength,0.3*strength,strength, 1.0);

                  //   动态光环
                  //   czm_frameNumber获取当前帧数
                  //   fract(x),返回x的小数部分
                  float time  = fract(czm_frameNumber/(60.0*10.0));
                //   float time  = fract(czm_frameNumber/60.0)*6.28 ;
                //   实现往返的操作
                   time = abs(time-0.5)*2.0;
                // time = sin(time);
                // clamp(x, min, max)，返回x在min和max之间的最小值
                float diff = abs(clamp(position.z/500.0, 0.0, 1.0) - time) ;
                // step(edge, x)，如果x大于等于edge，返回1，否则返回0
                diff = step(0.01, diff);
                gl_FragColor.rgb += vec3(0.5)*(1.0-diff);



              }

          `);

      // 片元着色器已经修改，需要更新
      model._shouldRegenerateShaders = true;
    }
  });
};

onMounted(async () => {
  const viewer = initMap();
  createMousePosition(viewer);

  new CesiumNavigaion(viewer, {
    // 启用罗盘
    enableCompass: true,
    // 是否启用缩放
    enableZoomControls: false,
    // 是否启用指南针外环
    enableCompassOuterRing: true,
    // 是否启用距离的图例
    // enableDistanceLegend: false,
  });
  modifyMap(viewer);
  // modifyBuild(viewer);
});
</script>

<style lang="less" scoped>
.regional-population {
  width: 100%;
  height: 100%;
}
#regionalPopulationContainer {
  width: 100%;
  height: 100%;
  :deep(canvas) {
    width: 100%;
    height: 100%;
  }
}
</style>
