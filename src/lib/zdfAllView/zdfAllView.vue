/*
*   riseMix.js
*/
<template>
  <div class="vue-chart-zdfallview" v-if="data && xAxis">
  </div>
</template>

<script>
export default {
  name: "zdfAllView",
  props: {
    data: {
      type: Object,
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
          axisLineColor: "#000",
          noDataColor: "#5d5d5d",
          borderColor: "#000",
          barColor: [
            "#862a2b",
            "#9e423e",
            "#ba5953",
            "#bb655e",
            "#bb7b73",
            "#086545",
            "#398b68",
            "#58a884",
            "#6bba95",
            "#7bbba5"
          ],
          splitLineColor: "#000"
        },
        white: {
          fontColor: "#777",
          axisLineColor: "#777",
          noDataColor: "#c7c7c7",
          borderColor: "#fff",
          barColor: [
            "#f6411c",
            "#f85d41",
            "#fa7663",
            "#fd8d83",
            "#ffb7af",
            "#037246",
            "#199261",
            "#30b47f",
            "#48d79c",
            "#5bf3b4"
          ],
          splitLineColor: "#dedede"
        }
      }
    };
  },
  mounted() {
    var self = this;
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
    theme: "updateFromStyle"
  },
  methods: {
    updateFromData() {
      this.cleanStyle();
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
        noDataColor: chartStyle.noDataColor || themeStyle.noDataColor,
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        borderColor: chartStyle.borderColor || themeStyle.borderColor,
        barColor: chartStyle.barColor || themeStyle.barColor
      };
    },
    //设置数据项
    renderSeries() {
      const s = this;
      let data = s.data;
      let nameList = [
        "8%~10%",
        "6%~8%",
        "4%~6%",
        "2%~4%",
        "0~2%",
        "-10%~-8%",
        "-8%~-6%",
        "-6%~-4%",
        "-4%~-2%",
        "-2%~0"
      ];
      let barColor = s.style.barColor;
      let series = [];
      $.each(nameList, function(key, val) {
        $.each(data[val], function(keys, value) {
          if (value === 0 || (value < -90 && val !== "-2%~0")) {
            data[val][keys] = {
              value: null,
              tooltip: {
                show: false,
                formatter: "未上市"
              },
              itemStyle: {
                opacity: 0
              }
            };
          } else if (value < -90 && val === "-2%~0") {
            data[val][keys] = {
              value: 0.001,
              barMinHeight: 2,
              tooltip: {
                show: true,
                formatter: "未上市"
              },
              itemStyle: {
                color: s.style.noDataColor,
                borderWidth: 0
              }
            };
          }
        });
        let obj = {
          name: val,
          type: "bar",
          stack: "总量",
          barMaxWidth: 15,
          barGap: "30%",
          barMinHeight: 6,
          tooltip: {
            formatter: function(value) {
              let date = value["name"].split("/");
              if (value["value"] < 0) {
                return (
                  date[0] +
                  "月" +
                  date[1] +
                  "日" +
                  ":<br/>" +
                  value["seriesName"] +
                  "：" +
                  (0 - value["value"])
                );
              }
              return (
                date[0] +
                "月" +
                date[1] +
                "日" +
                ":<br/>" +
                value["seriesName"] +
                "：" +
                value["value"]
              );
            }
          },
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: s.style.borderColor,
              color: barColor[key],
              label: {
                show: false,
                textStyle: {
                  color: "#fff"
                },
                position: "insideTop",
                formatter: function(p) {
                  return p;
                }
              }
            }
          },
          data: data[val]
        };
        series.push(obj);
      });
      return series.reverse();
    },
    // 渲染
    renderChart() {
      const s = this;
      s.chart = s.chart || echarts.init(s.$el);
      if (!s.data["0~2%"]) {
        return;
      }
      let series = s.renderSeries();
      let opt = {
        animation: false,
        grid: {
          left: 30,
          right: 10,
          top: 60,
          bottom: 25
        },
        calculable: true,
        tooltip: {
          trigger: "item",
          axisPointer: {
            type: "shadow",
            textStyle: {
              color: "#fff"
            }
          }
        },
        xAxis: {
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
            showMaxLabel: true,
            interval: 2,
            color: s.style.fontColor
          },
          data: s.xAxis
        },
        yAxis: {
          type: "value",
          name: "个数",
          nameTextStyle: {
            align: "left",
            padding: [0, 30, 0, 0]
          },
          splitLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
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
            formatter: function(value) {
              return value < 0 ? -value : value;
            },
            color: s.style.fontColor
          },
          splitArea: {
            show: false
          }
        },
        series: series
      };
      s.chart.setOption(opt);
      s.chart.resize();
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
.vue-chart-zdfallview {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>