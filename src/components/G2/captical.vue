<template>
  <div>
    <div class="chart" id="captical-chart">
      <span :class="{changeWhite:mytheme}">资金流入前十</span>
      <div class="nodata" v-show="indataNull" :class="{changeWhite:mytheme}">暂无资金流入板块...</div>
      <div id="chart-increase" style="width: 100%; height: 180px;"></div>
    </div>
    <div class="chart" id="captical-out">
      <span :class="{changeWhite:mytheme}">资金流出前十</span>
      <div class="nodata" v-show="dedataNull" :class="{changeWhite:mytheme}">暂无资金流出板块...</div>
      <div id="chart-decrease" style="width: 100%; height: 180px;"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["tradedays"],
  data: function() {
    return {
      capticalin: [],
      capticalout: [],
      chart1: null,
      chart2: null,
      timers: null,
      indataNull: false,
      dedataNull: false,
      xAxisShow: window.innerWidth < 1820 ? false : true
    };
  },
  created() {
    let self = this;
    eventBus.$on("toggleSelectItem", function() {
      // console.log($('#captical-chart'))
      if ($("#captical-chart") !== undefined) {
        self.getInfo();
      }
    });
  },
  beforeDestroy() {
    let self = this;
    eventBus.$off("toggleSelectItem", function() {
      self.getInfo();
    });
    clearInterval(self.timers);
  },
  mounted: function() {
    let self = this;
    self.chart1 = echarts.init(document.getElementById("chart-increase"));
    self.chart2 = echarts.init(document.getElementById("chart-decrease"));
    self.getInfo();
    $(window).resize(function() {
      if (self.chart1 && self.chart2) {
        self.xAxisShow = window.innerWidth < 1820 ? false : true;
        self.getInfo();
        self.chart1.resize();
        self.chart2.resize();
      }
    });
    // 添加自动触发tooltip隐藏事件
    $("#captical-chart").on("mouseleave", function() {
      $("#inTooltip")
        .parent()
        .css({ display: "none" });
      if (self.chart1) {
        self.chart1.dispatchAction({
          type: "hideTip"
        });
      }
    });
    $("#captical-out").on("mouseleave", function() {
      $("#outTooltip")
        .parent()
        .css({ display: "none" });
      if (self.chart2) {
        self.chart2.dispatchAction({
          type: "hideTip"
        });
      }
    });
    self.timers = setInterval(self.getInfo, 60000); // 这里设置的时间是一分钟，
  },
  computed: {
    mytheme: function() {
      if (window.theme === "black") {
        return false;
      } else {
        return true;
      }
    },
    day: function() {
      if (this.tradedays === 1) {
        return 1;
      } else if (this.tradedays === 2) {
        return 3;
      } else if (this.tradedays === 3) {
        return 5;
      } else if (this.tradedays === 4) {
        return 10;
      }
    }
  },
  methods: {
    getInfo: function() {
      let self = this;
      $.ajax({
        // headers: { cookie: document.cookie },
        url:
          "http://l2.10jqka.com.cn/hottrack/plate/queryfundinoutflow?tradedays=" +
          self.day,
        type: "GET",
        dataType: "jsonp",
        xhrFields: {
          withCredentials: true
        },
        data: {
          "client-type": window.clientType
        },
        success: function(data) {
          let [ins, outs] = [data.result.in, data.result.out];
          self.capticalin = [];
          self.capticalout = [];
          if (ins) {
            for (let i of ins) {
              self.capticalin.push({
                code: i.code,
                name: i.codename,
                number: i.fundflow,
                closeprice: i.closeprice,
                priceincr: i.priceincr,
                funddeal: i.funddeal
              });
            }
            self.drawChart(self.chart1, "#d6524d", self.capticalin, "in");
          }
          if (outs) {
            for (let o of outs) {
              self.capticalout.push({
                code: o.code,
                name: o.codename,
                number: Math.abs(o.fundflow),
                closeprice: o.closeprice,
                priceincr: o.priceincr,
                funddeal: o.funddeal
              });
            }
            self.drawChart(self.chart2, "#1cbf7b", self.capticalout, "out");
          }
        },
        error: function(err) {
          console.log("err");
        }
      });
    },
    drawChart: function(chart, color, source, inout) {
      let self = this;

      if (source.length === 0) {
        if (chart !== null) {
          chart.clear();
          if (inout === "in") {
            self.indataNull = true;
          } else if (inout === "out") {
            self.dedataNull = true;
          }
        }
        return;
      }
      if (inout === "in") {
        self.indataNull = false;
      }
      if (inout === "out") {
        self.dedataNull = false;
      }
      // 这里要获取y周的最大值
      let maxNm = 0,
        name = "";

      for (let obj of source) {
        if (obj.number > maxNm) {
          maxNm = obj.number;
        }
      }
      maxNm = String(maxNm).length;
      if (maxNm >= 10) {
        name = "单位:亿";
      } else if (maxNm >= 9) {
        name = "单位:千万";
      } else if (maxNm >= 8) {
        name = "单位:百万";
      }

      if (inout === "in") {
        self.indataNull = false;
      } else if (inout === "out") {
        self.dedataNull = false;
      }
      let option = {
        animation: false,
        legend: {
          show: false
        },
        dataset: {
          dimensions: ["name", "number", "funddeal", "priceincr"],
          source: source
        },
        grid: {
          left: 30,
          top: 50,
          right: 10,
          bottom: !self.xAxisShow ? 20 : 60,
          containerLabel: false
        },
        tooltip: {
          trigger: "axis",
          extraCssText: "height:100px",
          confine: true,
          padding: [5, 15, 0, 15],
          position: function(p) {
            return [p[0] + 10, p[1] - 130];
          },
          textStyle: {
            fontFamily: "Microsoft YaHei",
            align: "left",
            color: "white"
          },
          formatter: function(datas) {
            // 这里也需要获取名称
            datas = datas[0].data;
            let formate = function(num) {
              if (num === undefined || num === null) {
                return "--";
              }
              if (num > 100000000) {
                return (num / 100000000).toFixed(2) + "亿";
              } else if (num > 10000) {
                return (num / 10000).toFixed(2) + "万";
              } else {
                return num;
              }
            };
            // console.log(Number(datas.priceincr.slice(0, datas.priceincr.length-1)))
            let color =
              Number(datas.priceincr.slice(0, datas.priceincr.length - 1)) >= 0
                ? "#d6524d"
                : "#1cbf7b";
            let color1 = inout === "in" ? "#d6524d" : "#1cbf7b";

            return `<div style="color:white; font-size: 12px;" id="${inout}Tooltip">
            <span style="align:left; ">${datas.name}</span><br>
            <span><span style="align: left;;">涨 幅: &nbsp; &nbsp;</span><span style="color: ${color}" >${
              datas.priceincr
            }</span></span><br>
            <span><span style="">资金流${
              inout === "in" ? "入" : "出"
            }: </span> &nbsp; &nbsp;<span style="color:${color1}">${formate(
              datas.number
            )}元</span></span><br>
            <span><span style="">成交额: </span> &nbsp; &nbsp;<span style="">${formate(
              datas.funddeal
            )}元</span></span></div>
            `;
          }
        },
        xAxis: {
          type: "category",
          axisTick: {
            show: false
          },
          triggerEvent: true,
          axisLabel: {
            clickable: true,
            showMaxLabel: true,
            color: "#868686",
            interval: 0,
            rotate: 50,
            textStyle: {
              fontSize: 10, // 这个设置没有效果-暂时不知道原因
              fontFamily: "Microsoft YaHei"
            },
            formatter: function(name) {
              if (self.xAxisShow) {
                if (name.length <= 5) {
                  return name;
                } else {
                  return name.slice(0, 4) + "..";
                }
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: !self.mytheme ? "#393939" : "#ababab",
              width: 1
            }
          },
          min: 0
        },
        yAxis: {
          type: "value",
          axisTick: {
            show: false
          },
          name: name,
          nameTextStyle: {
            color: "#868686"
          },
          splitNumber: 2,
          axisLabel: {
            show: true,
            color: "#868686",
            textStyle: {
              fontSize: 10, // 这个设置没有效果-暂时不知道原因
              fontFamily: "Microsoft YaHei"
            },
            formatter: function(number) {
              if (maxNm >= 10) {
                return Math.floor(number / 100000000);
              } else if (maxNm >= 9) {
                return Math.floor(number / 10000000);
              } else if (maxNm >= 8) {
                return Math.floor(number / 1000000);
              }
            }
          },
          minInterval: 1,
          axisLine: {
            lineStyle: {
              color: !self.mytheme ? "#393939" : "#ababab",
              width: 1
            }
          },
          splitLine: {
            show: false
          },
          min: 0
        },
        series: [
          {
            type: "bar",
            barGap: 0,
            label: {
              fontWeight: 20
            },
            barMaxWidth: 10,
            itemStyle: {
              color: color
            }
          }
        ]
      };

      chart.on("click", function(params) {
        let fitCode = function(name) {
          for (let item of source) {
            if (item.name === name) {
              return item.code;
            }
          }
        };

        if (params.componentType === "xAxis") {
          fitCode(params.value);
          Acme.go2TimeLine(fitCode(params.value));
        }
      });

      chart.hideLoading();
      chart.setOption(option);
    },
    watchCaptical: function() {
      let self = this;
      // console.log('数据改变-图形重绘')
      self.drawChart(self.chart1, "#d6524d", self.capticalin, "in");
      self.drawChart(self.chart2, "#1cbf7b", self.capticalout, "out");
    }
  },
  watch: {
    tradedays: function(val) {
      // console.log(val)
      // 因为上面的定时器是一分钟以为，这里更改的是全局下面的props，所以不用担心数据不会变化，这里也是经过测试过，全局改变，定时器引用的数据也会改变，所以不需要传递参数，
      // 这里还有一个情况就是，全部变量下的内容会定时更新，那自己没有清除上一个定时器，所以可能在极致情况下，短时间内数据可能发生两次改变---这里用户体验不太好，但是也是为了偷懒，懒得写一个全部去存储上一个定时器，并清楚，同时再次写一个新的定时器
      this.getInfo();
    }
  }
};
</script>
    
<style scoped>
.chart {
  display: inline-block;
  width: 48%;
  height: 180px;
  overflow: hidden;
  position: relative;
}

.chart span:first-child {
  position: absolute;
  font-size: 12px;
  color: white;
  left: 0;
}

/*新添加的信息*/
.changeWhite {
  color: #2c3e50 !important;
}

.nodata {
  position: absolute;
  font-size: 12px;
  color: white;
  top: 80px;
  left: 40%;
}
</style>
