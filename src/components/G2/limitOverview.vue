<template>
  <div class="limit-container">
    <div id="limit-chart" style="width: 100%; height: 180px;"></div>
    <span class="legend-line" id="legend-line">
      <span class="point">一</span>
      <span class="text" id="text">涨停均值线</span>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    allresults: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  name: "limitOverview",
  data: function() {
    return {
      chart: null
    };
  },
  created() {
    // console.log('a12d12d1')
  },
  mounted: function() {
    // console.log('ehh')
    if (Object.keys(this.allresults).length !== 0) {
      this.formatterDatas();
      this.reDrawChart();
      this.chart.resize();
    }
  },
  computed: {
    mytheme: function() {
      if (window.theme === "black") {
        return false;
      } else {
        return true;
      }
    }
  },
  watch: {
    allresults: function(newData) {
      // console.log('数据更改')
      // this.allresults = newData
      if (Object.keys(newData).length !== 0) {
        this.formatterDatas();
        this.reDrawChart();
        this.chart.resize();
      }
    }
  },
  methods: {
    formatterDatas: function() {
      let stock = [];
      let keys = Object.keys(this.allresults);
      for (let key of keys) {
        let obj = {
          time: key,
          涨幅数: Number(this.allresults[key].harden_num),
          跌幅数: Number(this.allresults[key].drop_num),
          ping: Number(this.allresults[key].flat_num),
          avgline: Number(this.allresults[key].average_line)
        };
        stock.push(obj);
      }
      this.stock = stock;
    },
    drawMarkLine: function(params) {
      // 这是markline的划线
      // console.log(params)
      this.chart.setOption({
        series: [
          {
            markLine: {
              data: [
                {
                  name: "均值线",
                  yAxis: params
                }
              ],
              lineStyle: {
                color: "#868686",
                type: "dashed",
                width: "1"
              },
              symbol: "none",
              label: {
                show: false
              },
              animation: false
            }
          }
        ]
      });
    },
    reDrawChart: function() {
      // 这里应该添加一个变量，来存储当前的横坐标的选中
      let seletedTime = "";
      let self = this;
      self.chart = echarts.init(document.getElementById("limit-chart"));

      let source = self.stock;
      // console.log(self.stock)
      let option = {
        animation: false,
        legend: {
          show: window.innerWidth > 1820,
          itemWidth: 10,
          itemHeight: 10,
          borderWidth: 0,
          right: "27%",
          textStyle: {
            color: "#868686"
          },
          data: ["涨幅数", "跌幅数"]
        },
        dataset: {
          dimensions: ["time", "涨幅数", "跌幅数", "avgline", "ping"],
          source: source
        },
        grid: {
          left: 40,
          top: 40,
          right: 10,
          bottom: 70,
          width: "auto",
          containLabel: false
        },
        xAxis: {
          type: "category",
          axisTick: {
            show: false
          },
          axisLabel: {
            color: "#868686",
            interval: 4,
            textStyle: {
              fontSize: 10, // 这个设置没有效果-暂时不知道原因
              fontFamily: "Microsoft YaHei"
            },
            showMaxLabel: true,
            formatter: function(name) {
              return name.slice(4, 6) + name.slice(6);
            }
          },
          axisLine: {
            lineStyle: {
              color: !self.mytheme ? "#393939" : "#ababab",
              width: 1
            }
          },
          axisPointer: {
            label: {
              show: false
            }
          }
        },
        yAxis: {
          type: "value",
          axisTick: {
            show: false
          },
          axisLabel: {
            color: "#868686",
            interval: "auto"
          },
          axisLine: {
            lineStyle: {
              color: !self.mytheme ? "#393939" : "#ababab",
              width: 1
            }
          },
          splitLine: {
            show: false
          },
          splitNumber: 2,
          min: 0,
          axisPointer: {
            label: {
              show: false,
              formatter: function(datas) {}
            }
          }
        },
        tooltip: {
          trigger: "axis",
          extraCssText: "height:100px",
          textStyle: {
            color: "white",
            fontFamily: "Microsoft YaHei",
            align: "left"
          },
          padding: [5, 15],
          position: function(p) {
            return [p[0] + 10, p[1] - 120];
          },
          formatter: function(datas) {
            setTimeout(() => {
              // 这里应该设置虚线mariline
              if (datas[0].axisValue !== seletedTime) {
                self.$emit("getTitle", datas[0].axisValue);
              }
              seletedTime = datas[0].axisValue;
            }, 300);

            let time = datas[0].data.time;
            let [date, zhang, die, ping] = [
              time.slice(0, 4) + "/" + time.slice(4, 6) + "/" + time.slice(6),
              datas[0].data["涨幅数"],
              datas[0].data["跌幅数"],
              datas[0].data.ping
            ];
            return `<div style="color:white; font-size: 12px;">
            <span style="align:left;">${date}</span><br>
            <span><span style="align: left;">涨停数: </span> &nbsp; &nbsp;<span style="color:  #d6524d;">${
              zhang === undefined || zhang === null ? "--" : zhang
            }</span></span><br>
            <span><span>跌停数: </span> &nbsp; &nbsp;<span style="color:#1cbf7b;">${
              die === undefined || die === null ? "--" : die
            }</span></span><br>
            <span><span>平盘数: </span> &nbsp; &nbsp;<span style="">${
              ping === undefined || ping === null ? "--" : ping
            }</span></span></div><br>
            `;
          }
        },
        series: [
          {
            type: "bar",
            barGap: 0,
            label: {
              fontWeight: 20
            },
            barMaxWidth: 10,
            // barColor: 'gray'
            itemStyle: {
              color: "#d6524d"
            }
          },
          {
            type: "bar",
            barGap: 0,
            label: {
              fontWeight: 20
            },
            barMaxWidth: 10,
            itemStyle: {
              color: "#1cbf7b"
            }
          },
          {
            name: "avgline",
            type: "line",
            symbol: "none",
            symbolSize: 0,
            showSymbol: false,
            lineStyle: {
              color: "#868686",
              width: "1"
            },
            legend: {
              show: false
            },
            legendHoverLink: false
          }
        ]
      };
      self.chart.setOption(option, true);
      // 这里设置今日的数据 prams = 数组最后的object
      if (window.innerWidth < 1820) {
        // self.chart.setOption({
        //   legend: {
        //     show: false
        //   }
        // })
        $("#legend-line").css("display", "none");
      } else {
        // self.chart.setOption({
        //   legend: {
        //     show: true
        //   }
        // })
        $("#legend-line").css("display", "block");
      }

      $(window).resize(function() {
        // console.log(window.innerWidth, window.clientWidth)
        if (window.innerWidth < 1820) {
          self.chart.setOption({
            legend: {
              show: false
            }
          });
          $("#legend-line").css("display", "none");
        } else {
          self.chart.setOption({
            legend: {
              show: true
            }
          });
          $("#legend-line").css("display", "block");
        }
        if (self.chart) {
          self.chart.resize();
        }
      });

      // 最后一个划线
    }
  }
};
</script>

<style scoped>
.limit-container {
  position: relative;
}
.legend-line {
  cursor: pointer;
  position: absolute;
  top: 3px;
  right: 5px;
  display: block;
  font-size: 10px !important;
  color: #868686;
  font-family: "Microsoft YaHei";
}

.point {
  display: inline-block;
  padding-bottom: 10px;
  vertical-align: top;
}
</style>
