<template>
  <div class="vue-chart-faucetBlock" v-if="date && stockList && series && tipData">
  </div>
</template>

<script>
export default {
  name: "faucetBlock",
  props: {
    date: {
      type: Array,
      required: true
    },
    stockList: {
      type: Object,
      required: true
    },
    series: {
      type: Array,
      required: true
    },
    tipData: {
      type: Array,
      required: true
    },
    ZQMCForZDF: {
      type: Object,
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
      clickTime: +new Date(),
      themeStyle: {
        black: {
          fontColor: "#aaa",
          axisLineColor: "#000",
          borderColor: "#000",
          splitLineColor: "#000"
        },
        white: {
          fontColor: "#7d7d7d",
          axisLineColor: "#777",
          borderColor: "#777",
          splitLineColor: "#eee"
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
    date: "updateFromData",
    series: "updateFromData",
    stockList: "updateFromData",
    tipData: "updateFromData",
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
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        borderColor: chartStyle.borderColor || themeStyle.borderColor
      };
    },
    // 渲染
    renderChart() {
      const s = this;
      s.chart = s.chart || echarts.init(s.$el);
      let opt = {
        animation: false,
        grid: {
          left: 48,
          right: 18,
          top: 50,
          bottom: 25
        },
        legend: {
          textStyle: {
            color: s.style.fontColor,
            fontFamily: "sans-serif"
          },
          top: 25,
          right: 2,
          itemGap: 8,
          itemWidth: 10,
          data: s.tipData
        },
        axisPointer: {
          show: true,
          type: "line",
          label: {
            margin: 0,
            shadowBlur: 0,
            backgroundColor: "#555",
            padding: [3, 5, 3, 5]
          },
          triggerTooltip: false
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            lineStyle: {
              color: "#ddd"
            }
          },
          backgroundColor: "rgba(33,33,33,.8)",
          padding: [2, 6],
          textStyle: {
            color: "#fff"
          },
          formatter: function(value) {
            var html = "";
            $.each(value, function(key, val) {
              html +=
                '<br/><span class="circle-icon" style="background:' +
                val["color"] +
                '"></span>' +
                val["seriesName"] +
                "：" +
                (s.ZQMCForZDF[val["seriesName"]][val["dataIndex"]] == "-"
                  ? key === 0 ? "未上市" : "停牌"
                  : s.ZQMCForZDF[val["seriesName"]][val["dataIndex"]] + "%");
            });
            return value[0].name + html;
          }
        },
        xAxis: {
          type: "category",
          data: s.date,
          boundaryGap: false,
          splitLine: {
            show: false,
            interval: "auto",
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisTick: {
            show: false
          },
          showMaxLabel: false,
          showMinLabel: false,
          axisLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisLabel: {
            interval: 8,
            showMaxLabel: true,
            margin: 6,
            textStyle: {
              fontSize: 14
            },
            formatter: function(value) {
              value = value.match(/\d{2}/g);
              return value[2] + "/" + value[3];
            },
            color: s.style.fontColor
          }
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisLabel: {
            show: true,
            margin: 10,
            textStyle: {
              fontSize: 14
            },
            color: s.style.fontColor,
            formatter: function(val) {
              return val + "%";
            }
          }
        },
        series: s.series
      };
      s.chart.setOption(opt);
      s.chart.on("legendselected", function(params) {
        console.log("asdfasdfasdf");
        // var newTime = +new Date();
        // console.log(newTime,s.clickTime);
        // if(newTime-s.clickTime>1000){
        //   TA.log({id:'L2rdzz_5a77f800_425'});
        //   s.clickTime = +new Date();
        // }
      });
      s.resize();
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
.vue-chart-faucetBlock {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
.circle-icon {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 3px;
}
</style>