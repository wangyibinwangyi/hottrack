<template>
  <div class="vue-chart-risebar" v-if="data && xAxis">
  </div>
</template>

<script>
export default {
  name: "risebar",
  props: {
    data: {
      type: Array,
      required: true
    },
    xAxis: {
      type: Array,
      required: true
    },
    green: {
      type: String,
      default() {
        return "#219d72";
      }
    },
    red: {
      type: String,
      default() {
        return "#d6524d";
      }
    },
    colors: Array,
    theme: {
      type: String,
      default() {
        return "black";
      }
    },
    chartStyle: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      chart: void 0,
      style: void 0, //  合并props.chartStyle
      themeStyle: {
        black: {
          fontColor: "#aaa",
          axisLineColor: "#aaa",
          splitLineColor: "#444"
        },
        white: {
          fontColor: "#777",
          axisLineColor: "#777",
          splitLineColor: "#dedede"
        }
      }
    };
  },
  mounted() {
    this.updateFromStyle();
  },
  watch: {
    chartStyle: {
      handler() {
        this.updateFromStyle();
      },
      deep: true
    },
    data: "updateFromData",
    green: "updateFromData",
    red: "updateFromData",
    colors: "updateFromData",
    xAxis: "updateFromData",
    theme: "updateFromStyle"
  },
  methods: {
    updateFromData() {
      this.renderChart();
    },
    updateFromStyle() {
      this.cleanStyle();
      this.renderChart();
    },
    cleanStyle() {
      const s = this;
      let chartStyle = s.chartStyle;
      let themeStyle = s.themeStyle[s.theme];
      s.style = {
        fontColor: chartStyle.fontColor || themeStyle.fontColor,
        barWidth: chartStyle.barWidth || "100%",
        axisLineColor: chartStyle.axisLineColor || themeStyle.axisLineColor,
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor
      };
    },
    // 清洗数据data and xAxis, 柱状图数据包含了样式内容
    cleanData() {
      const s = this;
      var rst = [];
      let barColors =
        s.colors ||
        (function() {
          let arr = [];
          for (let i = 0; i < s.xAxis.length; i++) {
            let v = parseFloat(s.xAxis[i]);
            arr.push(v < 0 ? s.green : s.red);
          }
          return arr;
        })();
      for (let i = 0; i < s.data.length; i++) {
        rst.push(null);
        rst.push({
          value: s.data[i],
          itemStyle: {
            color: barColors[i]
          }
        });
      }

      // 补充空白
      let xAxis = [];
      for (let i = 0; i < s.xAxis.length; i++) {
        xAxis.push(s.xAxis[i]);
        xAxis.push(s.xAxis[i] + 0.5);
      }

      return {
        data: rst,
        xAxis: xAxis
      };
    },
    // 渲染
    renderChart() {
      const s = this;
      s.chart = s.chart || echarts.init(s.$el);

      let data = s.cleanData();
      let opt = {
        grid: {
          left: 30,
          right: 10,
          top: 30,
          bottom: 30
        },
        xAxis: {
          type: "category",
          data: data.xAxis,
          axisLine: {
            lineStyle: {
              color: s.style.axisLineColor
            }
          },
          axisLabel: {
            interval: 1
          },
          axisTick: { show: false }
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisLabel: {
            color: s.style.fontColor
          }
        },
        series: [
          {
            barWidth: s.style.barWidth,
            label: {
              show: true,
              position: "top",
              color: s.style.fontColor
            },
            data: data.data,
            type: "bar"
          }
        ]
      };
      s.chart.setOption(opt);
    },
    resize() {
      const s = this;
      if (s.chart) {
        s.chart.resize();
      }
    }
  }
};
</script>

<style>
.vue-chart-risebar {
  /* background: #aaa; */
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>