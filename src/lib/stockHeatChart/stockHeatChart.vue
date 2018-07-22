<template>
  <div class="vue-chart-stockHeatChart" v-if="data||dataVol">
  </div>
</template>

<script>
export default {
  name: "stockHeatChart",
  props: {
    data: {
      type: Object,
      required: true
    },
    dataVol: {
      type: Object,
      required: true
    },
    maxVol: {
      type: Number,
      required: true
    },
    newTradeDays: {
      type: Array,
      required: true
    },
    changeType: {
      type: String,
      required: true
    },
    dataZQMC: {
      type: Object,
      required: true
    },
    searchZQMC: {
      type: Object,
      required: true
    },
    codeList: {
      type: Array,
      required: true
    },
    codeVolList: {
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
      maxVolValue: 0,
      themeStyle: {
        black: {
          fontColor: "#aaa",
          axisLineColor: "#1b1b1b",
          borderColor: "#1b1b1b",
          emptyBorderColor: "#7d7d7d",
          maskColor: "rgba(33, 33, 33, 0.8)",
          volInRange: ["#272323", "#864743", "#e56b63", "#ee5449", "#e13d37"],
          // zdfInRange:['#211f1f','#2a2828','#343434','#424343','#515454','#626666','#727778','#828888','#929697','#9fa2a2','#e89691','#e88e89','#e8857f','#e87a74','#e86e68','#e7625c','#e55650','#e34c46','#e2433d','#e13d37'],
          // zdfInRange:['#211f1f','#272626','#2f3030','#393d3d','#444b4b','#505959','#5d6667','#6a7273','#767c7c','#848282','#e7766e','#f6695f','#f66157','#f6574e','#f34d44','#ee423a','#e83830','#e22e26','#dd261f','#d91f18'],
          zdfInRange: [
            "#39cc7e",
            "#36ba75",
            "#32a167",
            "#2e8357",
            "#2b6f4c",
            "#296044",
            "#27523c",
            "#254636",
            "#233a30",
            "#222f2a",
            "#212726",
            "#372524",
            "#432624",
            "#522725",
            "#612825",
            "#722926",
            "#842b27",
            "#a32d28",
            "#c12f2a",
            "#d9312b"
          ],
          backgroundColor: "#1b1b1b"
        },
        white: {
          fontColor: "#7d7d7d",
          axisLineColor: "#fff",
          borderColor: "#fff",
          maskColor: "rgba(33, 33, 33, 0.5)",
          emptyBorderColor: "#929292",
          // zdfInRange:['#576c64','#60746b','#6c7f75','#7a8c82','#899a8f','#98a89c','#a9b8ab','#bac7b9','#cad5c6','#d8e1d0','#ffddc0','#fecfb1','#fcbe9d','#f9aa87','#f6946f','#f28059','#ef6a41','#eb562b','#e84619','#e6380a'],
          zdfInRange: [
            "#476e5f",
            "#507566",
            "#5d7f70",
            "#6c8c7d",
            "#7d9a8b",
            "#90a99a",
            "#a3b9a9",
            "#b5c8b7",
            "#c6d5c5",
            "#d6e1d0",
            "#efdec1",
            "#fed1b2",
            "#fcc09f",
            "#f9ac89",
            "#f69671",
            "#f28059",
            "#ef6a41",
            "#eb562b",
            "#e84619",
            "#e6380a"
          ],
          volInRange: [
            "#a5a5a5",
            "#b2afad",
            "#c5beb8",
            "#ddcfc6",
            "#f4ddcc",
            "#ffdcca",
            "#ffd3c0",
            "#ffc3af",
            "#feaf9a",
            "#fa9b86",
            "#f27960",
            "#ef6b51",
            "#ed6044",
            "#ec5838",
            "#eb522e",
            "#e94d25",
            "#e8491c",
            "#e84614",
            "#e7440d",
            "#e64108"
          ],
          // volInRange:['#c4c4c4','#cac7c6','#d3ceca','#ded5cc','#ebddcc','#f7ddcc','#ffddcc','#ffd4c2','#ffc6b2','#fdb49f','#faa18b','#f7907a','#f4816a','#f1735a','#ee674c','#ed5c3d','#eb522e','#e94c22','#e84717','#e64108'],
          backgroundColor: "#fff"
        }
      }
    };
  },
  mounted() {
    this.updateFromStyle();
  },
  watch: {
    maxVol: "resetMaxVolValue",
    chartStyle: {
      handler() {
        this.updateFromStyle();
      },
      deep: true
    },
    data: "updateFromData",
    // dataVol:'updateVolFromData',
    codeList: "updateFromData",
    // codeVolList:'updateVolFromData',
    dataVol: "updateVolFromData",
    // changeType:'changeTypeEvent',
    theme: "updateFromStyle"
  },
  methods: {
    resetMaxVolValue() {
      this.maxVolValue = 0;
    },
    changeTypeEvent() {
      if (this.changeType === "zdf") {
        this.updateFromData();
      } else if (this.changeType === "vol") {
        this.updateVolFromData();
      }
    },
    updateFromData() {
      this.cleanData();
    },
    updateVolFromData() {
      this.cleanVolData();
    },
    updateFromStyle() {
      this.cleanStyle();
      this.changeTypeEvent();
    },
    cleanStyle() {
      const s = this;
      let chartStyle = s.chartStyle;
      let themeStyle = s.themeStyle[s.theme];
      s.style = {
        fontColor: chartStyle.fontColor || themeStyle.fontColor,
        barWidth: chartStyle.barWidth || "100%",
        axisLineColor: chartStyle.axisLineColor || themeStyle.axisLineColor,
        zdfInRange: chartStyle.zdfInRange || themeStyle.zdfInRange,
        maskColor: chartStyle.maskColor || themeStyle.maskColor,
        volInRange: chartStyle.volInRange || themeStyle.volInRange,
        emptyBorderColor:
          chartStyle.emptyBorderColor || themeStyle.emptyBorderColor,
        borderColor: chartStyle.borderColor || themeStyle.borderColor,
        backgroundColor:
          chartStyle.backgroundColor || themeStyle.backgroundColor
      };
    },
    cleanVolData() {
      const s = this;
      let data = s.dataVol;
      let dataZQMC = s.dataZQMC;
      let codeList = s.codeVolList;
      let obj = {
        date: [],
        data: [],
        ZQMC: []
      };
      let a = 0,
        b = 0;
      var min, max;
      var dateObj = {};
      if (s.newTradeDays.length) {
        obj.date = s.newTradeDays;
        $.each(s.newTradeDays, function(key, val) {
          dateObj[val] = key;
        });
      } else {
        $.each(data[codeList[codeList.length - 1]], function(keys, value) {
          //建立日期索引
          obj.date.push(keys);
          dateObj[keys] = b;
          b++;
        });
      }
      let time = new Date();
      let closedNow = false;
      let reg = new RegExp(/\d{2}/g);
      if (
        (time.getHours() == 9 && time.getMinutes() < 25) ||
        time.getHours() < 9
      ) {
        if (
          time.getDate() == Number(obj.date[obj.date.length - 1].match(reg)[3])
        ) {
          //当天为交易日
          closedNow = true;
        }
      }
      $.each(codeList, function(key, val) {
        // let b=0;
        if (!data[val]) {
          data[val] = [];
        }
        let tingpaiDate = 0;
        let errorMsg = ["停", "牌", "停牌"];
        if (!data.checkData[val]) {
          errorMsg = ["新", "股", "新股"];
        }
        $.each(obj.date, function(keys, value) {
          //展示完全的日期，筛选停牌日期
          if (data[val][value]) {
            //有数据
            if (keys > 0 && tingpaiDate !== 0) {
              //在有数据之前有停牌
              let arr;
              if (tingpaiDate > 2) {
                arr = obj.data.slice(
                  -Math.floor(tingpaiDate / 2) - 1,
                  -Math.floor(tingpaiDate / 2)
                )[0];
                arr.label.formatter = errorMsg[0];
                obj.data.splice(-Math.floor(tingpaiDate / 2) - 1, 1, arr);
                if (tingpaiDate !== 3) {
                  arr = obj.data.slice(
                    -Math.floor(tingpaiDate / 2),
                    -Math.floor(tingpaiDate / 2) + 1
                  )[0];
                  arr.label.formatter = errorMsg[1];
                  obj.data.splice(-Math.floor(tingpaiDate / 2), 1, arr);
                }
              } else if (tingpaiDate === 2) {
                arr = obj.data.slice(-2, -1)[0];
                arr.label.formatter = errorMsg[0];
                obj.data.slice(-2, 1, arr);
                arr = obj.data.slice(-1)[0];
                arr.label.formatter = errorMsg[1];
                obj.data.splice(-1, 1, arr);
              } else if (tingpaiDate === 1) {
                arr = obj.data.slice(-1)[0];
                arr.label.formatter = errorMsg[0];
                obj.data.splice(-1, 1, arr);
              }
              tingpaiDate = 0;
            }
            if (key === 0 && dateObj[keys] === 0) {
              //初始化min，max值
              min = max = Number(data[val][value]["MONEY"]);
            } else if (!isNaN(data[val][value]["MONEY"])) {
              max =
                max > Number(data[val][value]["MONEY"])
                  ? max
                  : Number(data[val][value]["MONEY"]);
            }
            let VOL = data[val][value]["MONEY"];
            obj.data.push([dateObj[value], a, VOL]);
          } else {
            //停牌
            tingpaiDate++;
            obj.data.push({
              value: [dateObj[value], a, -9],
              itemStyle: {
                borderColor: s.style.backgroundColor,
                color: s.style.backgroundColor,
                backgroundColor: s.style.backgroundColor,
                opacity: 1
              },
              label: {
                show: true,
                color: "#7d7d7d",
                formatter: "—"
              },
              tooltip: {
                formatter: errorMsg[2]
              }
            });
          }

          if (keys == obj.date.length - 1 && closedNow) {
            //最后一格，且在9:25前，且为交易日
            obj.data[obj.data.length - 1] = {
              value: [dateObj[value], a, -9],
              itemStyle: {
                borderWidth: 1,
                borderColor: s.style.emptyBorderColor,
                color: s.style.backgroundColor,
                backgroundColor: s.style.backgroundColor,
                opacity: 1
              },
              label: {
                show: true,
                color: "#7d7d7d",
                formatter: ""
              },
              tooltip: {
                formatter: "未开盘"
              }
            };
          }
        });
        if (tingpaiDate > 2) {
          //直到结束一直停牌，继续替换。
          var arr = obj.data.slice(
            -Math.floor(tingpaiDate / 2) - 1,
            -Math.floor(tingpaiDate / 2)
          )[0];
          arr.label.formatter = "停";
          obj.data.splice(-Math.floor(tingpaiDate / 2) - 1, 1, arr);
          if (tingpaiDate !== 3) {
            arr = obj.data.slice(
              -Math.floor(tingpaiDate / 2),
              -Math.floor(tingpaiDate / 2) + 1
            )[0];
            arr.label.formatter = "牌";
            obj.data.splice(-Math.floor(tingpaiDate / 2), 1, arr);
          }
        }
        if (dataZQMC[val]) {
          obj.ZQMC.push(dataZQMC[val]["ZQMC"]);
        }
        a = a + 1;
      });
      s.maxVolValue = s.maxVolValue > max ? s.maxVolValue : max;
      s.renderVOLChart(obj);
    },
    cleanData() {
      const s = this;
      if (s.chart) {
        s.chart.showLoading({
          text: "热力图拼命加载中...",
          textColor: "#d6524d",
          maskColor: "rgba(33, 33, 33, 0.6)"
        });
      }
      let data = s.data;
      let dataZQMC = s.dataZQMC;
      let codeList = s.codeList;
      if (!data[codeList[codeList.length - 1]]) {
        return;
      }
      var obj = {
        date: [],
        data: [],
        ZQMC: []
      };
      let a = 0,
        b = 0;
      var dateObj = {};
      if (s.newTradeDays.length) {
        obj.date = s.newTradeDays;
        $.each(s.newTradeDays, function(key, val) {
          dateObj[val] = key;
        });
      }
      let time = new Date();
      let closedNow = false;
      let reg = new RegExp(/\d{2}/g);
      if (
        (time.getHours() == 9 && time.getMinutes() < 25) ||
        time.getHours() < 9
      ) {
        if (
          time.getDate() == Number(obj.date[obj.date.length - 1].match(reg)[3])
        ) {
          //当天为交易日
          closedNow = true;
        }
      }
      $.each(codeList, function(key, val) {
        // let b=0;
        if (!data[val]) {
          data[val] = [];
        }
        let tingpaiDate = 0;
        let errorMsg = ["停", "牌", "停牌"];
        if (!data.checkData[val]) {
          errorMsg = ["新", "股", "新股"];
        }
        $.each(obj.date, function(keys, value) {
          //展示完全的日期，筛选停牌日期
          if (data[val][value] && !isNaN(data[val][value]["CLOSE"])) {
            //有数据
            if (keys > 0 && tingpaiDate !== 0) {
              //在有数据之前有停牌
              let arr;
              if (tingpaiDate > 2) {
                arr = obj.data.slice(
                  -Math.floor(tingpaiDate / 2) - 1,
                  -Math.floor(tingpaiDate / 2)
                )[0];
                arr.label.formatter = errorMsg[0];
                obj.data.splice(-Math.floor(tingpaiDate / 2) - 1, 1, arr);
                if (tingpaiDate !== 3) {
                  arr = obj.data.slice(
                    -Math.floor(tingpaiDate / 2),
                    -Math.floor(tingpaiDate / 2) + 1
                  )[0];
                  arr.label.formatter = errorMsg[1];
                  obj.data.splice(-Math.floor(tingpaiDate / 2), 1, arr);
                }
              } else if (tingpaiDate === 2) {
                arr = obj.data.slice(-2, -1)[0];
                arr.label.formatter = errorMsg[0];
                obj.data.splice(-2, 1, arr);
                arr = obj.data.slice(-1)[0];
                arr.label.formatter = errorMsg[1];
                obj.data.splice(-1, 1, arr);
              } else if (tingpaiDate === 1) {
                arr = obj.data.slice(-1)[0];
                arr.label.formatter = errorMsg[0];
                obj.data.splice(-1, 1, arr);
              }
              tingpaiDate = 0;
            }
            let preValue = data[val][value]["PRE"]
              ? data[val][value]["PRE"]
              : data[val][obj.date[keys - 1]]["PRE"];
            let ZDF =
              (Number(data[val][value]["CLOSE"] || 0) - Number(preValue)) /
              preValue *
              100;
            obj.data.push([dateObj[value], a, ZDF]);
          } else {
            //无数据
            // var formatter = keys == 23?'停':keys == 24?'牌' :'—';
            tingpaiDate++;
            obj.data.push({
              value: [dateObj[value], a, -9999],
              label: {
                show: true,
                color: "#7d7d7d",
                formatter: "—"
              },
              itemStyle: {
                borderColor: s.style.backgroundColor,
                color: s.style.backgroundColor,
                backgroundColor: s.style.backgroundColor,
                opacity: 1
              },
              tooltip: {
                formatter:
                  keys == obj.date.length - 1
                    ? closedNow ? "未开盘" : errorMsg[2]
                    : errorMsg[2]
              }
            });
          }

          if (keys == obj.date.length - 1 && closedNow) {
            //最后一格，且在9:25前，且为交易日
            obj.data[obj.data.length - 1] = {
              value: [dateObj[value], a, -9999],
              label: {
                show: true,
                color: "#7d7d7d",
                formatter: ""
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: s.style.emptyBorderColor,
                color: s.style.backgroundColor,
                backgroundColor: s.style.backgroundColor,
                opacity: 1
              },
              tooltip: {
                formatter: "未开盘"
              }
            };
          }
        });
        if (tingpaiDate > 2) {
          //直到结束一直停牌，继续替换。
          var arr = obj.data.slice(
            -Math.floor(tingpaiDate / 2) - 1,
            -Math.floor(tingpaiDate / 2)
          )[0];
          arr.label.formatter = "停";
          obj.data.splice(-Math.floor(tingpaiDate / 2) - 1, 1, arr);
          if (tingpaiDate !== 3) {
            arr = obj.data.slice(
              -Math.floor(tingpaiDate / 2),
              -Math.floor(tingpaiDate / 2) + 1
            )[0];
            arr.label.formatter = "牌";
            obj.data.splice(-Math.floor(tingpaiDate / 2), 1, arr);
          }
        }
        // $.each(data[val],function(keys,value){
        //     let ZDF=(Number(value['CLOSE']||0)-Number(value['PRE']))/value['PRE']*100;
        //     obj.data.push([dateObj[keys],a,ZDF]);
        //     // b++;
        // });
        if (dataZQMC[val]) {
          obj.ZQMC.push(dataZQMC[val]["ZQMC"]);
        }
        a = a + 1;
      });
      s.renderChart(obj);
    },
    // 渲染
    renderChart(data) {
      const s = this;
      if (data.date.length < 5) {
        return;
      }
      if (s.chart) {
        s.chart.clear();
      }
      s.chart = s.chart || echarts.init(s.$el);
      s.chart.clear();
      let opt = {
        tooltip: {
          position: "top",
          confine: true,
          position: "bottom",
          formatter: function(value, ticket) {
            if (value.data[2] === -100) {
              return "停牌";
            }
            return (
              data.date[value.data[0]] +
              "<br/>名称：" +
              data.ZQMC[value.data[1]] +
              "<br/>涨幅：" +
              (value.data[2] < -20
                ? "-"
                : Number(value.data[2]).toFixed(2) + "%")
            );
          }
        },
        backgroundColor: s.style.backgroundColor,
        animation: false,
        grid: {
          height: "84%",
          right: "2%",
          y: "10%",
          left: 70,
          zIndex: 10
        },
        xAxis: {
          type: "category",
          data: data.date,
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: "#7d7d7d"
            }
          }
        },
        yAxis: {
          type: "category",
          data: data.ZQMC,
          splitArea: {
            show: true
          },
          triggerEvent: true,
          axisLine: {
            lineStyle: {
              color: "#7d7d7d"
            }
          }
        },
        large: true,
        largeThreshold: 40,
        // dataZoom: [{
        //     type:'inside',
        //     zoomLock:true,
        //     zoomOnMouseWheel:true,
        //     moveOnMouseMove:true
        // },{
        //     type: 'slider',
        //     show: (data.ZQMC.length>16?true:false),
        //     yAxisIndex: [0],
        //     left: '96%',
        //     right:'2%',
        //     zoomLock:true,
        //     handleSize:'120%',
        //     borderColor:'transparent',
        //     textStyle:{
        //         color:'transparent'
        //     },
        //     start: Math.floor(100-(15/data.ZQMC.length)*100),
        //     end: 100
        // }],
        visualMap: {
          min: -12,
          max: 12,
          calculable: false,
          itemGap: 5,
          itemWidth: 16,
          orient: "horizontal",
          right: "4%",
          top: "2%",
          range: [-11, 11],
          outOfRange: {
            color: [
              s.style.backgroundColor,
              s.style.zdfInRange[s.style.zdfInRange.length - 1]
            ]
          },
          seriesIndex: 0,
          itemWidth: 12,
          inRange: {
            color: s.style.zdfInRange
            // color:['#211f1f','#2a2828','#343434','#424343','#515454','#626666','#727778','#828888','#929697','#9fa2a2','#e89691','#e88e89','#e8857f','#e87a74','#e86e68','#e7625c','#e55650','#e34c46','#e2433d','#e13d37']
          },
          textStyle: {
            color: "#7d7d7d"
          },
          formatter: "",
          text: ["高", "低"]
        },
        series: [
          {
            name: "Punch Card",
            type: "heatmap",
            data: data.data,
            label: {
              normal: {
                show: false
              }
            },
            itemStyle: {
              borderColor: s.style.borderColor,
              borderWidth: 2,
              emphasis: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      };
      s.chart.hideLoading();
      s.chart.setOption(opt);
      s.chart.on("click", function(params) {
        Acme.go2TimeLine(s.searchZQMC[params.value]);
      });
    },
    translateNumber(num) {
      if (num > 99999999) {
        return (Number(num) / 100000000).toFixed(2) + "亿";
      } else if (num > 9999) {
        return (Number(num) / 10000).toFixed(2) + "万";
      } else {
        return Number(num).toFixed(0);
      }
    },
    renderVOLChart(data) {
      const s = this;
      if (s.chart) {
        s.chart.dispose();
      }
      s.chart = echarts.init(s.$el);
      let opt = {
        tooltip: {
          position: "bottom",
          confine: true,
          formatter: function(value, ticket) {
            return (
              data.date[value.data[0]] +
              "<br/>名称：" +
              data.ZQMC[value.data[1]] +
              "<br/>成交额：" +
              s.translateNumber(value.data[2])
            );
          }
        },
        backgroundColor: s.style.backgroundColor,
        grid: {
          height: "84%",
          right: "2%",
          y: "10%",
          left: 70,
          zIndex: 10
        },
        xAxis: {
          type: "category",
          data: data.date,
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: "#7d7d7d"
            }
          }
        },
        yAxis: {
          type: "category",
          data: data.ZQMC,
          triggerEvent: true,
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: "#7d7d7d"
            }
          }
        },
        // dataZoom: [{
        //     type: 'slider',
        //     show: (data.ZQMC.length>16?true:false),
        //     yAxisIndex: [0],
        //     left: '96%',
        //     right:'2%',
        //     zoomLock:true,
        //     handleSize:'120%',
        //     borderColor:'transparent',
        //     textStyle:{
        //         color:'transparent'
        //     },
        //     start: Math.floor(100-(15/data.ZQMC.length)*100),
        //     end: 100
        // }],
        visualMap: {
          min: -9,
          max: s.maxVolValue + 1,
          range: [0, s.maxVolValue],
          outOfRange: {
            color: s.style.backgroundColor
          },
          calculable: false,
          itemGap: 5,
          itemWidth: 16,
          orient: "horizontal",
          right: "4%",
          top: "2%",
          itemWidth: 12,
          inRange: {
            color: s.style.volInRange
          },
          outOfRange: {
            color: [
              s.style.backgroundColor,
              s.style.volInRange[s.style.volInRange.length - 1]
            ]
          },
          textStyle: {
            color: "#7d7d7d"
          },
          formatter: "",
          text: ["高", "低"]
        },
        series: [
          {
            name: "Punch Card",
            type: "heatmap",
            data: data.data,
            label: {
              normal: {
                show: false
              }
            },
            itemStyle: {
              borderColor: s.style.borderColor,
              borderWidth: 2,
              emphasis: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      };
      s.chart.hideLoading();
      window.timers = +new Date();
      s.chart.setOption(opt);
      s.chart.on("click", function(params) {
        Acme.go2TimeLine(s.searchZQMC[params.value]);
      });
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
.vue-chart-stockHeatChart {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: left;
}
</style>