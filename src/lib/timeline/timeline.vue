<template>
  <div class="vue-chart-timeline" v-if="code">
    <div v-if="!isClient" style="text-align:center;color:#666;padding-top:15%">
      ohoo, 请在客户端内查看
    </div>
    <div :id="chartId" v-if="isClient" style="width:100%;height:100%;"></div>
    <slot
      :v-if="isClient"
      :date="date"
      :time="time"
      :now="now"
      :junjia="junjia"
      :zhangfu="zhangfu"
      :zhangdie="zhangdie"
      :vol="vol"
      :codeName="codeName"></slot>
  </div>
</template>

<script>
import Client from "./client.js";

export default {
  name: "timeline",
  props: {
    code: {
      required: true,
      type: [String, Number]
    },
    theme: {
      type: String,
      default() {
        return "white";
      }
    },
    freq: {
      type: Number,
      default() {
        return 60000;
      }
    },
    showJUNJIA: {
      type: Boolean,
      default() {
        return true;
      }
    },
    on: {
      type: Boolean,
      default() {
        return true;
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
      isClient: true,
      chart: void 0,
      chartId: "vue-chart-timeline-aim_" + Client.count(),
      isTradeDate: true,
      data: void 0,
      dataBase: void 0,
      IntervalFlag: void 0,
      style: void 0, //  合并props.chartStyle
      lastIndex: 0,
      mouseInChart: false, // 鼠标是否在图表内
      chartMsg: {},

      // props data -----------
      date: void 0,
      time: void 0,
      now: void 0,
      junjia: void 0,
      zhangfu: void 0,
      zhangdie: "",
      vol: "",
      codeName: void 0,
      // ----------------------
      // themeStyle ----------
      themeStyle: {
        black: {
          fontColor: "#aaa",
          splitLineColor: "#222"
        },
        white: {
          fontColor: "#555",
          splitLineColor: "#dedede"
        }
      }
      // ---------------------
    };
  },
  computed: {
    categoryData() {
      let rst = [];
      for (let h = 9; h < 12; h++) {
        let m = h === 9 ? 30 : 0;
        let mMax = h === 11 ? 30 : 59; // @todo 29
        for (; m <= mMax; m++) {
          rst.push((h < 10 ? "0" + h : h) + "" + (m < 10 ? "0" + m : m));
        }
      }
      for (let h = 13; h < 15; h++) {
        let m = h === 13 ? 1 : 0;
        for (; m <= 59; m++) {
          rst.push(h + "" + (m < 10 ? "0" + m : m));
        }
      }
      rst.push("1500");
      return rst;
    }
  },
  mounted() {
    const s = this;

    // this.isClient = Client.getClientEnv() @tip  8.70.34版本从l2首页点击进入会返回false.
    // if(!this.isClient) return

    let then1 = function(tradeDay) {
      s.date = tradeDay + "";
      s.restartCode();
      s.setTiming();
    };

    s.updateFromStyle();
    Client.getTime("yyyyMMdd", function(today) {
      // today = '20180203'
      Client.isTradeDate(today, function(flag) {
        if (!flag) {
          s.isTradeDate = false;
          Client.getTradeDate(today, function(tradeDay) {
            then1(tradeDay);
          });
        } else {
          then1(today);
        }
      });
    });

    document.onkeydown = Client.debounce(
      function(e) {
        if (!e || !e.keyCode || !s.mouseInChart) return;
        switch (e.keyCode) {
          case 37:
            s.keyupLeft();
            break;
          case 39:
            s.keyupRight();
            break;
        }
      },
      100,
      true
    );
  },
  watch: {
    chartStyle: {
      handler() {
        this.updateFromStyle();
      },
      deep: true
    },
    theme: "updateFromStyle",
    on: "setTiming",
    code: "restartCode"
  },
  methods: {
    keyupLeft() {
      const s = this;
      if (!s.chart) return;
      let dataIndex = s.chartMsg.xIndex - 1;
      dataIndex = dataIndex < 0 ? 0 : dataIndex;
      dataIndex = dataIndex <= s.lastIndex ? dataIndex : s.lastIndex;

      s.chart.dispatchAction({
        type: "updateAxisPointer",
        seriesIndex: s.chartMsg.sIndex, // here have BUG
        dataIndex: dataIndex
      });
    },
    keyupRight() {
      const s = this;
      if (!s.chart) return;
      let dataIndex = s.chartMsg.xIndex + 1;
      dataIndex = dataIndex > s.lastIndex ? s.lastIndex : dataIndex;

      s.chart.dispatchAction({
        type: "updateAxisPointer",
        seriesIndex: s.chartMsg.sIndex, // here have BUG
        dataIndex: dataIndex
      });
    },
    updateFromStyle() {
      const s = this;
      let chartStyle = s.chartStyle;
      let themeStyle = s.themeStyle[s.theme];
      s.style = {
        upColor: chartStyle.upColor || "#d74931",
        downColor: chartStyle.downColor || "#29983a",
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        fontColor: chartStyle.fontColor || themeStyle.fontColor
      };
      if (s.chart) {
        s.renderChart();
      }
    },
    // 新的股票代码
    restartCode() {
      const s = this;

      if (!s.isClient) return;

      Client.getCodeName(s.code, function(name) {
        s.codeName = name;
      });

      Client.getPre(s.code, function(dataBase) {
        s.dataBase = dataBase;
        s.getData(function() {
          s.outputData();
        });
      });
    },
    cleanData(data) {
      const s = this;
      data = data[s.code];

      let now = [];
      let vol = [];
      let junjia = [];
      let index = 0;
      let tmp;
      let maxDiff = 0;
      let difftmp;
      for (let i in data) {
        if (index === 0) {
          tmp = {
            VOL: 0,
            NEW: s.dataBase
          };
        }

        let flag = 0;
        if (Number(data[i]["NEW"]) > Number(tmp["NEW"])) {
          flag = 1;
        } else if (Number(data[i]["NEW"]) < Number(tmp["NEW"])) {
          flag = -1;
        }

        vol.push([index, data[i]["VOL"] - tmp["VOL"], flag]);
        now.push(Number(data[i]["NEW"]));
        junjia.push(Number(data[i]["JUNJIA"]));

        difftmp = Math.abs(s.dataBase - data[i]["NEW"]);
        maxDiff = difftmp > maxDiff ? difftmp : maxDiff;

        tmp = data[i];
        index++;
      }

      s.lastIndex = index - 1;

      s.data = {
        max: s.dataBase + maxDiff + maxDiff * 0.1,
        min: s.dataBase - maxDiff - maxDiff * 0.1,
        now: now,
        vol: vol,
        junjia: junjia
      };
    },
    getData(cb) {
      const s = this;
      // console.log('getData::::::::::::::::')
      Client.getNowData(s.code, s.date, function(d) {
        s.cleanData(d);
        s.renderChart();
        cb && cb();
      });
    },
    setTiming(v, oldv) {
      const s = this;
      if (!s.isTradeDate) return;

      if (s.IntervalFlag) {
        clearInterval(s.IntervalFlag);
      }
      if (s.on) {
        s.IntervalFlag = setInterval(function() {
          Client.getTime("hhmm", function(time) {
            if (
              time < "0930" ||
              time > "1500" ||
              (time > "1130" && time < "1300")
            )
              return;
            s.getData(function() {
              if (s.mouseInChart) return;
              s.outputData();
            });
          });
        }, s.freq);
        // watch 的立刻获取最新
        if (v) {
          s.getData(function() {
            if (s.mouseInChart) return;
            s.outputData();
          });
        }
      }
    },
    outputData(index) {
      const s = this;
      index = index !== undefined ? index : s.lastIndex;
      index = index > s.lastIndex ? s.lastIndex : index;

      s.time = s.categoryData[index];
      s.now = s.data.now[index];
      s.junjia = s.data.junjia[index];
      s.zhangdie = s.data.now[index] - s.dataBase;
      s.zhangfu = (s.data.now[index] - s.dataBase) / s.dataBase;
      s.vol = s.data.vol[index];
    },
    renderChart() {
      const s = this;

      let isInit = false;
      if (!s.chart) {
        isInit = true;
        s.chart = echarts.init(document.getElementById(this.chartId));
      }

      let opt = {
        animation: false,
        grid: [
          {
            left: "55px",
            right: "55px",
            top: "3%",
            height: "65%"
          },
          {
            left: "55px",
            right: "55px",
            top: "68%",
            height: "23%"
          }
        ],
        axisPointer: {
          type: "cross",
          snap: true,
          label: {
            margin: 0,
            shadowBlur: 0,
            backgroundColor: "#555",
            padding: [3, 5, 3, 5]
          },
          link: {
            xAxisIndex: "all"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            snap: true,
            type: "cross"
          },
          formatter(p) {
            if (p[0] !== undefined && p[0]["dataIndex"] !== undefined) {
              s.chartMsg.xIndex = p[0]["dataIndex"];
              s.outputData(p[0]["dataIndex"]);
            }
          }
        },
        xAxis: [
          {
            type: "category",
            //boundaryGap: false,
            data: s.categoryData,
            axisTick: { show: false },
            axisLabel: { show: false },
            axisLine: { show: false },
            splitLine: {
              show: true,
              lineStyle: {
                color: s.style.splitLineColor
              },
              interval: function(index, value) {
                if (
                  index === 0 ||
                  index === 60 ||
                  index === 120 ||
                  index === 180 ||
                  index === 240
                ) {
                  return true;
                }
                return false;
              }
            },
            axisPointer: {
              label: { show: false }
            }
          },
          {
            gridIndex: 1,
            type: "category",
            data: s.categoryData,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
              show: true,
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisPointer: {
              label: {
                formatter(p) {
                  s.mouseInChart = true;
                  let v = p.value;
                  if (v === "1130") {
                    return "11:30/13:00";
                  }
                  return v.substring(0, 2) + ":" + v.substring(2, 4);
                }
              }
            },
            axisLabel: {
              color: s.style.fontColor,
              interval: function(index, value) {
                if (
                  index === 0 ||
                  index === 60 ||
                  index === 120 ||
                  index === 180 ||
                  index === 240
                ) {
                  return true;
                }
                return false;
              },
              formatter(v) {
                if (v === "1130") {
                  return "11:30/13:00";
                }
                return v.substring(0, 2) + ":" + v.substring(2, 4);
              }
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            max: s.data.max,
            min: s.data.min,
            interval: (s.data.max - s.data.min) / 4,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisPointer: {
              label: {
                formatter(p) {
                  s.chartMsg.sIndex = 0;
                  let v = p.value;
                  return v.toFixed(2);
                }
              }
            },
            axisLabel: {
              color: s.style.fontColor,
              formatter(v) {
                return v.toFixed(2);
              }
            }
          },
          {
            type: "value",
            interval: (s.data.max - s.data.min) / 4,
            max: s.data.max,
            min: s.data.min,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisPointer: {
              label: {
                formatter(p) {
                  let v = p.value;
                  v = (v - s.dataBase) * 100 / s.dataBase;
                  return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
                  // if ( v > 0) {
                  //   return '{up|'+ Math.abs(v).toFixed(2) +'%}'
                  // } else if( v < 0 ) {
                  //   return '{down|'+ Math.abs(v).toFixed(2) +'%}'
                  // } else {
                  //   return '{equal|0.00%}'
                  // }
                }
              }
            },
            axisLabel: {
              formatter(v) {
                v = (v - s.dataBase) * 100 / s.dataBase;
                if (v > -0.01 && v < 0.01) {
                  return "{equal|0.00%}";
                } else if (v > 0) {
                  return "{up|" + Math.abs(v).toFixed(2) + "%}";
                } else if (v < 0) {
                  return "{down|" + Math.abs(v).toFixed(2) + "%}";
                }
              },
              rich: {
                up: {
                  color: s.style.upColor
                },
                down: {
                  color: s.style.downColor
                },
                equal: {
                  color: s.style.fontColor
                }
              }
            }
          },
          {
            gridIndex: 1,
            scale: true,
            position: "right",
            type: "value",
            axisTick: { show: false },
            axisLine: { show: false },
            splitNumber: 2,
            splitLine: {
              lineStyle: {
                color: s.style.splitLineColor
              }
            },
            axisPointer: {
              label: {
                formatter(p) {
                  s.chartMsg.sIndex = 2;
                  let v = p.value;
                  return Client.getUnit(v, 1);
                }
              }
            },
            axisLabel: {
              color: s.style.fontColor,
              showMaxLabel: false,
              formatter(v) {
                return Client.getUnit(v, 0);
              }
            }
          }
        ],
        visualMap: {
          show: false,
          seriesIndex: 2,
          dimension: 2,
          pieces: [
            {
              value: 1,
              color: s.style.upColor
            },
            {
              value: -1,
              color: s.style.downColor
            },
            {
              value: 0,
              color: s.style.fontColor
            }
          ]
        },
        series: [
          {
            type: "line",
            smooth: true,
            symbol: "none",
            lineStyle: {
              color: "#0270c9",
              width: 1
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(2,112,201,0.5)"
                  },
                  {
                    offset: 1,
                    color: "rgba(2,112,201,0)"
                  }
                ])
              }
            },
            data: s.data.now
          },
          {
            type: "line",
            data: s.data.junjia,
            symbol: "none",
            lineStyle: {
              color: "#FFBA1A",
              width: 1.2,
              opacity: s.showJUNJIA ? 1 : 0
            },
            yAxisIndex: 1
          },
          {
            tooltip: { show: false },
            xAxisIndex: 1,
            yAxisIndex: 2,
            type: "bar",
            data: s.data.vol
          }
        ]
      };
      s.chart.setOption(opt);

      if (isInit) {
        s.chart.on("globalout", function() {
          s.mouseInChart = false;
          s.outputData();
        });
      }
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
.vue-chart-timeline {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>