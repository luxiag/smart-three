<template>
  <div class="left-echart--cityScene">
    <div class="first-echart">
      <div ref="alarmSituationRef"></div>
    </div>
    <div class="second-echart">
      <div ref="radarEChartRef"></div>
    </div>
    <div class="third-echart"></div>
  </div>
</template>
<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";

const alarmSituationRef = ref();
const createAlarmSituation = () => {
  const fanAlarmEchart = echarts.init(alarmSituationRef.value);
  let roseData = [
    { value: 40, name: "烟火" },
    { value: 33, name: "水雾" },
    { value: 28, name: "雨天" },
    { value: 22, name: "晴天" },
    { value: 20, name: "阴天" },
  ];
  const nameVal = ["烟火", "水雾", "雨天", "晴天", "阴天"];
  //   const colors = [
  //     "#64c9da",
  //     "#84dae5",
  //     "#c5f5fc",
  //     "#fafffe",
  //     "#66c5d2",
  //     "#82dae7",
  //     "#cbf6fe",
  //   ];
  const colors = ["#57a9db", "#386f9e", "#376586", "#275577", "#1a4468"];
  for (let index = 0; index < roseData.length; index++) {
    roseData[index].itemStyle = {
      color: colors[index],
    };
  }
  const originDataLen = roseData.length;
  const spanAngle = 90; // 需要显示的角度
  const repeatedMultiple = 360 / spanAngle;
  // 这里根据要显示的角度 计算了需要插入的数据量
  const addDataLen = parseInt((repeatedMultiple - 1) * originDataLen);
  for (let index = 0; index < addDataLen; index++) {
    roseData.push({
      name: null,
      // 这里给数据置零，即在视觉上不显示
      value: 0,
      // 这里保证了异常情况下(数据都为0时)作为占位的数据在视觉上仍为不可见状态。
      itemStyle: {
        color: "rgba(0,0,0,0)",
      },
      tooltip: {
        show: false,
        formatter: null,
      },
    });
  }
  const option = {
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "shadow",
        textStyle: {
          color: "rgba(255, 255, 255, 1)",
        },
      },
      textStyle:{
        color:'#fff'
      },
      backgroundColor:"rgba(0,0,0,0.6)"
    },
    legend: {
      data: nameVal,
      selectedMode: false, //图例禁止点击
      orient: "vertical",
      x: "80%",
      y: "45%",
      itemWidth: 18,
      itemHeight: 10,
      textStyle: {
        color: "#B3B5B7",
        fontStyle: "normal",
        fontWeight: "normal",
        fontFamily: "sans-serif",
        fontSize: 12,
      },
    },
    grid: {
      left: 10,
    },
    series: [
      {
        name: "报警占比分析",
        type: "pie",
        roseType: "area",
        radius: "120%",
        center: ["80%", "90%"],
        startAngle: 180,
        label: {
          show: false,
        },
        data: roseData,
      },
      {
        type: "gauge",
        radius: "150%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "100%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          fontSize: 0,
          offsetCenter: [0, "0%"],
          valueAnimation: true,
          formatter: function () {
            return "";
          },
          color: "auto",
        },
        data: [],
      },
      {
        type: "gauge",
        radius: "130%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "100%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        data: [],
      },
      {
        type: "gauge",
        radius: "110%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "80%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
          offsetCenter: [0, "-20%"],
          fontSize: 30,
        },
        detail: {
          fontSize: 0,
          offsetCenter: [0, "0%"],
          valueAnimation: true,
          formatter: function () {
            return "";
          },
          color: "auto",
        },
        data: [],
      },
      {
        type: "gauge",
        radius: "90%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "80%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        detail: {
          fontSize: 0,
          offsetCenter: [0, "0%"],
          valueAnimation: true,
          formatter: function () {
            return "";
          },
          color: "auto",
        },
        data: [],
      },
      {
        type: "gauge",
        radius: "70%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "80%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        detail: {
          show: false,
          fontSize: 0,
          offsetCenter: [0, "0%"],
          valueAnimation: true,
          formatter: function () {
            return "";
          },
          color: "auto",
        },
        data: [],
      },
      {
        type: "gauge",
        radius: "50%",
        center: ["80%", "90%"],
        startAngle: 180,
        endAngle: 90,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 1,
            color: [[1, "#343A40"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: "80%",
          lineStyle: {
            color: "#343A40",
            width: 1,
          },
        },
        axisLabel: {
          show: false,
        },
        detail: {
          fontSize: 0,
          offsetCenter: [0, "0%"],
          valueAnimation: true,
          formatter: function () {
            return "";
          },
          color: "auto",
        },
        data: [],
      },
    ],
  };
  fanAlarmEchart.setOption(option);
};

// intelligent manufacturing

const radarEChartRef = ref();
const createRadarEchart = () => {
  const radarEchart = echarts.init(radarEChartRef.value);
  const randomData = [
    { name: "智能制造", max: 88 },
    { name: "工业4.0", max: 88 },
    { name: "车间自动化", max: 88 },
    { name: "生产线自动化", max: 88 },
    { name: "人工智能", max: 88 },
    { name: "机器学习", max: 88 },
    { name: "物联网", max: 88 },
    { name: "云计算", max: 88 },
    { name: "大数据", max: 88 },
    { name: "数据分析", max: 88 },
    { name: "数据可视化", max: 88 },
    { name: "供应链管理", max: 88 },
    { name: "产品生命周期管理", max: 88 },
    { name: "产品设计", max: 88 },
    { name: "数字化工厂", max: 88 },
    { name: "传感器技术", max: 88 },
    { name: "嵌入式系统", max: 88 },
    { name: "自主控制技术", max: 88 },
    { name: "国际标准", max: 88 },
    { name: "设备互联网络", max: 88 },
  ];
  const firstData = [];
  const secondData = [];
  for (let i = 0; i < 20; i++) {
    const d = Math.random() * 100;
    firstData.push(d);
    const m = Math.random() * 100;
    secondData.push(m);
  }
  const option = {
    // backgroundColor: "#0A2E5D",
    normal: {
      top: 200,
      left: 300,
      width: 500,
      height: 400,
      zIndex: 6,
      backgroundColor: "",
    },
    // color: ["rgba(245, 166, 35, 1)", "rgba(19, 173, 255, 1)"],
    tooltip: {
      show: false,
      trigger: "item",
    },
    legend: {
      show: true,
      icon: "circle",
      left: "35%",
      top: "90%",
      orient: "horizontal",
      textStyle: {
        fontSize: 14,
        color: "#eee",
      },
      //   data: ["高一(1)班", "高一(2)班"],
    },
    radar: {
      center: ["50%", "50%"],
      radius: "50%",
      startAngle: 90,
      splitNumber: 4,
      shape: "circle",
      splitArea: {
        areaStyle: {
          color: ["#283036", "#333e49"],
          opacity: 0.5,
        },
      },
      axisLabel: {
        show: false,
        fontSize: 18,
        color: "#9E9E9E",
        fontStyle: "normal",
        fontWeight: "normal",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#9E9E9E", //
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#9E9E9E", //
        },
      },
      indicator: randomData,
    },
    series: [
      {
        name: "预期",
        type: "radar",
        symbol: "circle",
        symbolSize: 10,
        areaStyle: {
          normal: {
            color: "rgba(52, 68, 186, 0.4)",
          },
        },
        itemStyle: {
          color: "rgba(52, 68, 186, 1)",
          borderColor: "rgba(52, 68, 186, 0.3)",
          borderWidth: 10,
        },
        lineStyle: {
          normal: {
            type: "solid",

            color: "rgba(52, 68, 186, 1)",
            width: 2,
          },
        },
        data: [firstData],
      },
      {
        name: "实际",
        type: "radar",
        symbol: "circle",
        symbolSize: 10,
        itemStyle: {
          normal: {
            color: "rgba(19, 173, 255, 1)",
            borderColor: "rgba(19, 173, 255, 0.4)",
            borderWidth: 10,
          },
        },
        areaStyle: {
          normal: {
            color: "rgba(19, 173, 255, 0.5)",
          },
        },
        lineStyle: {
          normal: {
            color: "rgba(19, 173, 255, 1)",
            width: 2,
            type: "solid",
          },
        },
        data: [secondData],
      },
    ],
  };
  radarEchart.setOption(option);
};
onMounted(() => {
  createAlarmSituation();
  createRadarEchart();
});
</script>
<style lang="less" scoped>
.left-echart--cityScene {
  min-width: 280px;
  height: 100%;

  display: flex;
  flex-direction: column;
  > div {
    flex: 1;
    > div {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
