<template>
  <div class="vue-chart-zhangtingview" v-if="hardenNum && xAxis">
  </div>
</template>

<script>
export default {
  name: "zhangtingView",
  props: {
    hardenNum: {
      //涨停数
      type: Array,
      required: true
    },
    hardenStock: {
      //涨停个股
      type: Array,
      required: true
    },
    stockList: {
      //涨停股票列表
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
      zqmcList: {},
      themeStyle: {
        black: {
          fontColor: "#aaa",
          axisLineColor: "#000",
          borderColor: "#000",
          lineColor: "#d6524d",
          splitLineColor: "#000"
        },
        white: {
          fontColor: "#777",
          axisLineColor: "#777",
          borderColor: "#777",
          lineColor: "#f16a4d",
          splitLineColor: "#dedede"
        }
      }
    };
  },
  mounted() {
    this.cleanStyle();
  },
  watch: {
    chartStyle: {
      handler() {
        this.updateFromStyle();
      },
      deep: true
    },
    // hardenNum: 'updateFromData',
    stockList: "getZQMCData",
    green: "updateFromData",
    red: "updateFromData",
    colors: "updateFromData",
    xAxis: "updateFromData",
    theme: "updateFromStyle"
  },
  methods: {
    getZQMCData() {
      if (!this.stockList.length) {
        return;
      }
      this.getZQMC();
    },
    updateFromData() {
      if (this.hardenNum.length === 0) {
        return;
      }
      this.cleanData();
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
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        lineColor: chartStyle.lineColor || themeStyle.lineColor,
        borderColor: chartStyle.borderColor || themeStyle.borderColor
      };
    },
    //获取证券名称查询表
    getZQMC() {
      const s = this;
      if (s.stockList.length === 0) {
        return;
      }
      var zqmcList = {};
      API.use({
        method: "Quote.getData",
        data: {
          code: s.stockList,
          type: "55",
          period: "day"
        },
        success: function(sn) {
          sn = eval("(" + sn + ")");
          for (let key in sn) {
            zqmcList[key] = sn[key]["55"];
          }

          s.zqmcList = zqmcList;
          s.renderChart();
        }
      });
    },
    // 清洗数据data and xAxis, 柱状图数据包含了样式内容
    cleanData() {
      const s = this;
      let series = [];
      for (let i = 0; i < s.hardenNum.length; i++) {
        let format = [];
        if (isNaN(s.hardenNum[i]) || !s.hardenNum[i]) {
          //无值
          series.push({
            value: 0,
            tooltip: {
              show: false
            }
          });
          continue;
        }
        if (s.hardenNum[i] === -99) {
          //未上市
          series.push({
            value: 0,
            lineStyle: {
              color: "#5d5d5d"
            },
            itemStyle: {
              color: "#5d5d5d"
            },
            tooltip: {
              show: true,
              formatter: "未上市"
            }
          });
          continue;
        }
        //有一堆值
        for (let j in s.hardenStock[i]) {
          format.push(s.zqmcList[s.hardenStock[i][j]] + "<br/>");
        }
        series.push({
          value: s.hardenNum[i],
          tooltip: {
            show: true,
            formatter: format.join("")
          }
        });
      }
      // 补充空白
      let xAxis = [];
      for (let i = 0; i < s.xAxis.length; i++) {
        xAxis.push(s.xAxis[i]);
      }

      return {
        series: series,
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
          top: 20,
          bottom: 5
        },
        animation: false,
        background: "transparent",
        calculable: true,
        tooltip: {
          show: true,
          trigger: "item",
          position: "bottom"
        },
        xAxis: {
          show: false,
          type: "category",
          axisLine: {
            lineStyle: {
              color: s.style.axisLineColor
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
          axisLabel: {
            interval: 0,
            color: s.style.fontColor
          },
          data: data.xAxis
        },
        yAxis: {
          show: false,
          type: "value",
          axisLine: {
            show: false,
            lineStyle: {
              color: "#90979c"
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            interval: 0,
            color: s.style.fontColor
          },
          splitArea: {
            show: false
          }
        },
        series: [
          {
            type: "line",
            itemStyle: {
              normal: {
                color: s.style.lineColor,
                label: {
                  show: true,
                  position: "top"
                }
              }
            },
            data: data.series
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
.vue-chart-zhangtingview {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>