<template>
  <div class="vue-chart-blockDealChart" v-if="data">
  </div>
</template>

<script>
export default {
  name: "blockDealChart",
  props: {
    data: {
      type: Object,
      required: true
    },
    code: {
      type: String,
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
    },
    tradeDays: {
      type: Array,
      required: true
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
          noDataColor: "#5d5d5d",
          barDealColor: "#1b6ba5",
          barBigColor: "#d6524d",
          barHuanshouColor: "#d59600",
          splitLineColor: "#000"
        },
        white: {
          fontColor: "#777",
          axisLineColor: "#777",
          borderColor: "#777",
          noDataColor: "#c7c7c7",
          barDealColor: "#abd9f9",
          barBigColor: "#d6524d",
          barHuanshouColor: "#f8b551",
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
    code: "updateFromData",
    theme: "updateFromStyle"
  },
  methods: {
    updateFromData() {
      this.cleanData();
    },
    updateFromStyle() {
      this.cleanStyle();
      this.cleanData();
    },
    cleanStyle() {
      const s = this;
      let chartStyle = s.chartStyle;
      let themeStyle = s.themeStyle[s.theme];
      s.style = {
        fontColor: chartStyle.fontColor || themeStyle.fontColor,
        barDealColor: chartStyle.barDealColor || themeStyle.barDealColor,
        barBigColor: chartStyle.barBigColor || themeStyle.barBigColor,
        barHuanshouColor:
          chartStyle.barHuanshouColor || themeStyle.barHuanshouColor,
        barWidth: chartStyle.barWidth || "100%",
        axisLineColor: chartStyle.axisLineColor || themeStyle.axisLineColor,
        noDataColor: chartStyle.noDataColor || themeStyle.noDataColor,
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        borderColor: chartStyle.borderColor || themeStyle.borderColor
      };
    },
    cleanData() {
      const s = this;
      let data = s.data;
      let code = s.code;
      if (data == {} || code == "") {
        return;
      }
      let obj = {
        date: [],
        deal: [],
        ddlr: [],
        huanshou: []
      };
      let reg = new RegExp(/\d{2}/g);
      $.each(data[code], function(key, val) {
        let dateArr = ("" + key).match(reg);
        obj.date.push(dateArr[2] + "/" + dateArr[3]);
        obj.deal.push(isNaN(val["MONEY"]) ? "-" : val["MONEY"]);
        obj.ddlr.push(
          Number(val["BIGBUYMONEY2"]) +
            Number(val["BIGBUYMONEY1"]) +
            Number(val["WAITBUYMONEY1"]) +
            Number(val["WAITBUYMONEY2"])
        );
        obj.huanshou.push(val["MONEY"] / val["DPLTSZ"] * 100);
      });
      if (obj.date.length < 26) {
        let len = obj.date.length;
        for (; len < 26; len++) {
          let dateArr = s.tradeDays[len];
          dateArr = ("" + dateArr).match(reg);
          obj.date.unshift(dateArr[2] + "/" + dateArr[3]);
          obj.deal.unshift(null);
          obj.ddlr.unshift({
            value: 500000000,
            itemStyle: { color: s.style.noDataColor }
          });
          obj.huanshou.unshift(null);
        }
      }
      s.renderChart(obj);
    },
    // 渲染
    renderChart(obj) {
      const s = this;
      let data = obj;
      s.chart = s.chart || echarts.init(s.$el);
      let opt = {
        animation: false,
        grid: {
          containLabel: true,
          left: "2%",
          right: "4%",
          bottom: "4%"
        },
        legend: {
          textStyle: {
            color: s.style.fontColor
          },
          data: ["成交额", "大单流入金额", "换手率"],
          right: "4%",
          top: 3
        },
        tooltip: {
          trigger: "axis",
          textStyle: {
            color: "#fff"
          },
          formatter: function(params, ticket, callback) {
            var res = params[0].name;
            if (!params[0].data && !params[2].data) {
              return "未上市";
            }
            for (var i = 0, l = params.length; i < l; i++) {
              if (isNaN(params[i].value)) {
                res += "<br/>" + params[i].seriesName + " : " + "-";
              } else {
                if (params[i].seriesType === "line") {
                  res +=
                    "<br/>" +
                    params[i].seriesName +
                    " : " +
                    (params[i].value ? params[i].value.toFixed(2) : "-") +
                    "%";
                } else {
                  res +=
                    "<br/>" +
                    params[i].seriesName +
                    " : " +
                    (params[i].value
                      ? (params[i].value / 100000000).toFixed(2)
                      : "-") +
                    "亿元";
                }
              }
            }
            return res;
          }
        },
        xAxis: [
          {
            type: "category",
            axisTick: {
              alignWithLabel: true
            },
            splitLine: {
              show: false,
              interval: "auto",
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisLine: {
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisLabel: {
              interval: 4,
              showMaxLabel: true,
              color: s.style.fontColor,
              formatter: function(value, index) {
                return value.split("/")[0] + "/" + value.split("/")[1];
              }
            },
            data: data.date
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "亿元",
            nameTextStyle: {
              align: "left",
              padding: [0, 30, 0, 0],
              color: s.style.fontColor
            },
            min: 0,
            position: "left",
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
              color: s.style.fontColor,
              formatter: function(value, index) {
                return value / 100000000;
              }
            }
          },
          {
            type: "value",
            name: "",
            min: 0,
            position: "right",
            splitLine: {
              show: false,
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisLine: {
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisLabel: {
              color: s.style.fontColor,
              formatter: "{value} %"
            }
          }
        ],
        series: [
          {
            name: "成交额",
            type: "bar",
            label: {
              normal: {
                show: false
              }
            },
            barGap: "0%",
            barCategoryGap: "45%",
            itemStyle: {
              color: s.style.barDealColor
            },
            data: data.deal
          },
          {
            name: "大单流入金额",
            type: "bar",
            label: {
              normal: {
                show: false
              }
            },
            barGap: "0%",
            barCategoryGap: "45%",
            itemStyle: {
              color: s.style.barBigColor
            },
            data: data.ddlr
          },
          {
            name: "换手率",
            type: "line",
            yAxisIndex: 1,
            label: {
              normal: {
                show: false
              }
            },
            symbolSize: 1,
            symbol: "circle",
            itemStyle: {
              color: s.style.barHuanshouColor
            },
            data: data.huanshou
          }
        ]
      };
      s.chart.setOption(opt);
      s.chart.on("legendselectchanged", function(params) {
        var newTime = +new Date();
        if (newTime - s.clickTime > 1000) {
          TA.log({ id: "L2rdzz_5a77f68a_939" });
          s.clickTime = +new Date();
        }
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
.vue-chart-blockDealChart {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>