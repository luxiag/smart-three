<template>
  <div class="right-echart--cityScene">
    <div class="first-echart">
      <div ref="barEchartRef"></div>
    </div>
    <div class="second-echart">
      <div ref="radarEChartRef"></div>
    </div>
    <div class="third-echart">
        <div ref="scatterEchartRef"></div>
    </div>
  </div>
</template>
<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";

const barEchartRef = ref();
const createBarEchart = () => {
  const barEchart = echarts.init(barEchartRef.value);
  const option = {
    color: ["#375c74"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "Direct",
        type: "bar",
        barWidth: "100%",
        barCategoryGap: "0%",
        itemStyle: {
          borderColor: "transparent",
        },
        data: [10, 52, 200, 334, 390, 330, 220],
      },
      {
        name: "顶部圆1",
        type: "pictorialBar",
        tooltip: { show: false },
        z: 20,
        zlevel: 3,
        symbolPosition: "end",
        barWidth: "100%",
        barCategoryGap: "0%",
        symbolSize: ["100%", 5],
        symbol: "rect",
        symbolOffset: [0, 0],
        itemStyle: {
          normal: {
            color: "#5c7986",
          },
        },
        data: [10, 52, 200, 334, 390, 330, 220],
      },
    ],
  };
  barEchart.setOption(option);
};


const scatterEchartRef = ref()
const createScatterEchart = () => {
    const scatterEchart = echarts.init(scatterEchartRef.value);
    const option = {
    color: ["#315C94", "#497FB6", "#6F8FCF", "#7AA0BB", "#9FBEDD", "#BCD4E1"],
    backgroundColor: '#211b6a',
    textStyle: {
        color: '#fff',

    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            lineStyle: {
                type: 'dashed',
                width: 2,
                color: '#4B941A'
            },
            animation: true
        }
    },
    legend: {
        show: false,
        data: ['a', 'b', 'c', 'd', 'e', 'f'],
        left: 'right',
    },
    grid: {
        show: false
    },
    yAxis: {
        data: ['2011', '2012', '2013', '2014', '2015', '2016'],
        splitLine: {
            show: true,
            lineStyle: {
                color: ['#555'],
            }
        },
        axisLine: {
            show: false
        },
    },
    xAxis: {
        data: ['俄罗', '宝钢', '宣钢', '梅钢', '涟钢', '福建'],
        axisLine: {
            show: true,
            lineStyle: {
                color: '#555',
            },
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: ['#555'],
            }
        },
    },
    series: [{
            name: 'a',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: 'red'
                }
            },
            data: [
                ['俄罗', '2011', 200],
                ['宝钢', '2011', 1500],
                ['宣钢', '2011', 2000],
                ['梅钢', '2011', 2500],
                ['涟钢', '2011', 3000],
                ['福建', '2011', 3500],
            ]
        },
        {
            name: 'b',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: '#C94C15'
                }
            },
            data: [
                ['俄罗', '2012', 1400],
                ['宝钢', '2012', 1500],
                ['宣钢', '2012', 5500],
                ['梅钢', '2012', 500],
            ]
        },
        {
            name: 'c',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: '#A18F1D'
                }
            },
            data: [
                ['宣钢', '2013', 200],
                ['福建', '2013', 1000],
            ]
        },
        {
            name: 'd',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: '#17885C'
                }
            },
            data: [
                ['梅钢', '2014', 4500],
                ['宝钢', '2014', 500],
            ]
        },
        {
            name: 'e',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: '#2769CF'
                }
            },
            data: [
                ['俄罗', '2015', 1050],

            ]
        },
        {
            name: 'f',
            type: 'scatter',
            symbol: 'circle', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
            symbolSize: function(data) {
                return Math.sqrt(data[2]) * 1;
            },
            label: {
                emphasis: {
                    show: true,
                    formatter: function(param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                normal: {
                    color: '#509820'
                }
            },
            data: [
                ['俄罗', '2016', 500],
                ['宝钢', '2016', 1700],
                ['福建', '2016', 500],
            ]
        },
    ]
};
}

onMounted(()=>{
    createBarEchart()
})
</script>
<style lang="less" scoped>
.right-echart--cityScene {
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
