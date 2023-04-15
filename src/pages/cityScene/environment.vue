<template>
  <div class="environment-page page">
    environment
    <div class="echarts-map" ref="mapRef"></div>
  </div>
</template>
<script setup>
import * as echarts from "echarts";
import "echarts-gl";
import { onMounted } from "vue";
const mapRef = ref();
const mapGeoJSON = async () => await import("@/assets/json/GuangZhou.json");

let mapChart;
const init3DMap = async () => {
  mapChart = echarts.init(mapRef.value);
  mapChart.showLoading();
  const data = await mapGeoJSON();
  echarts.registerMap("GuangZhou", data);
  const option = {
    series: [
      {
        type: "map3D",
        map: "GuangZhou",
        // 图形上的文本标签
        label: {
          show: true,
          color: "#000a3c",
        },
        // 地图样式
        itemStyle: {
          // 区域样式
          areaColor: {
            type: "radial",
            x: 0.5,
            y: 0.5,
            r: 3,
            colorStops: [
              {
                offset: 0,
                color: "rgba(223, 231, 242, 1)", // 0% 处的颜色
              },
              {
                offset: 1,
                color: "rgba(2, 99, 206, 1)", // 100% 处的颜色
              },
            ],
            globalCoord: false, // 缺省为 false
          },
          borderWidth: 1, // 边框大小
          borderColor: "rgba(104, 152, 190, 1)", // 边框样式
          shadowColor: "rgba(128, 217, 248, 1)", // 阴影颜色
          shadowOffsetX: -2, // 阴影水平方向上的偏移距离
          shadowOffsetY: 2, // 阴影垂直方向上的偏移距离
          shadowBlur: 10, // 文字块的背景阴影长度
        },

        data: [
          {
            name: "从化区",
            value: 10,
            regionHeight: 2,
          },
        ],
      },
    ],
  };
  mapChart.setOption(option);
  mapChart.hideLoading();
  // mapChart.setOption({
  //   series: [
  //     {
  //       type: "map3D",
  //       map: "广州",
  //       label: {
  //         show: true,
  //       },
  //     },
  //   ],
  // });
};
const initMap = async () => {
  mapChart = echarts.init(mapRef.value);
  mapChart.showLoading();
  const data = await mapGeoJSON();
  echarts.registerMap("GuangZhou", data);

  mapChart.on("georoam", (params) => {
    let option = mapChart.getOption(); //获得option对象
    if (params.zoom != null && params.zoom != undefined) {
      //捕捉到缩放时
      option.geo[0].zoom = option.series[0].zoom; //下层geo的缩放等级跟着上层的geo一起改变
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    } else {
      //捕捉到拖曳时
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    }
    mapChart.setOption(option); //设置option
  });
  mapChart.on("click", (params) => {
    console.log(params, "params");
  });
  const option = {
    geo: {
      map: "GuangZhou", //地图类型。
      zoom: 1,
      roam: true,
      animation: false,
      itemStyle: {
        // 区域样式
        areaColor: {
          type: "radial",
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [
            {
              offset: 0,
              color: "rgba(147, 235, 248, 1)", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(2, 99, 206, 1)", // 100% 处的颜色
            },
          ],
          globalCoord: false, // 缺省为 false
        },
        shadowColor: "#105781", //地图区域的阴影颜色。
        shadowOffsetX: 0,
        shadowOffsetY: 10,
      },
    },
    tooltip: {
      show: false,
      trigger: "item",
      alwaysShowContent: true,
      formatter: "{b}<br/>{c} (p / km2)",
    },
    visualMap: {
      min: 0,
      max: 100,
      text: ["High", "Low"],
      realtime: false,
      calculable: true,
      inRange: {
        color: [
          "#E0FFFF",
          "#FFA07A",
          "#B0C4DE",
          "#b8d200",
          "#87CEFA",
          "#ADD8E6",
          "#FFE4E1",
          "#8BC34A",
          "#0097A7",
        ],
      },
    },
    series: [
      {
        type: "map",
        map: "GuangZhou",
        // 图形上的文本标签
        label: {
          show: true,
          color: "#000a3c",
        },
        // 地图样式
        itemStyle: {
          // 区域样式
          areaColor: {
            type: "radial",
            x: 0.5,
            y: 0.5,
            r: 3,
            colorStops: [
              {
                offset: 0,
                color: "rgba(223, 231, 242, 1)", // 0% 处的颜色
              },
              {
                offset: 1,
                color: "rgba(2, 99, 206, 1)", // 100% 处的颜色
              },
            ],
            globalCoord: false, // 缺省为 false
          },
          borderWidth: 1, // 边框大小
          borderColor: "rgba(104, 152, 190, 1)", // 边框样式
          shadowColor: "rgba(128, 217, 248, 1)", // 阴影颜色
          shadowOffsetX: -2, // 阴影水平方向上的偏移距离
          shadowOffsetY: 2, // 阴影垂直方向上的偏移距离
          shadowBlur: 10, // 文字块的背景阴影长度
        },

        data: [
          {
            name: "从化区",
            value: 10,
            regionHeight: 2,
          },
          {
            name: "花都区",
            value: 20,
            regionHeight: 2,
          },
          {
            name: "白云区",
            value: 30,
            regionHeight: 2,
          },
          {
            name: "黄埔区",
            value: 40,
            regionHeight: 2,
          },
          {
            name: "增城区",
            value: 50,
            regionHeight: 2,
          },
          {
            name: "荔湾区",
            value: 60,
            regionHeight: 2,
          },
          {
            name: "越秀区",
            value: 70,
            regionHeight: 2,
          },
          {
            name: "天河区",
            value: 80,
            regionHeight: 2,
          },
          {
            name: "海珠区",
            value: 90,
            regionHeight: 2,
          },
          {
            name: "番禺区",
            value: 100,
            regionHeight: 2,
          },
        ],
      },
    ],
  };
  mapChart.setOption(option);
  mapChart.hideLoading();

  // mapChart.setOption({
  //   series: [
  //     {
  //       type: "map3D",
  //       map: "广州",
  //       label: {
  //         show: true,
  //       },
  //     },
  //   ],
  // });
};

onMounted(() => {
  initMap();
});
</script>
<style lang="less" scoped>
.environment-page {
  background: url("@/assets/img/background.png");
  .echarts-map {
    width: 100%;
    height: 100%;
  }
}
</style>
