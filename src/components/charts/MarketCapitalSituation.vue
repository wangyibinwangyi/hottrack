<template>
    <div>
        <!-- <card-title cardtitle='各市场资金情况'></card-title> -->
        <div id="capital-wrap" class="capital-wrap"></div>
        <div class="capital-footer">
            <span>个股资金流入：</span>
            <span v-show="index <2 || ( index ===2 &&  showLast)" class="gotoTimeLine" v-for="(item,index) in stock" :key="item.stockcode" @click="gotoTimeLine(item.stockcode)">{{item.stockname}}
                <span :class="{cr:item.ddemoney>0 , cg:item.ddemoney<0}">{{item.ddemoney}}亿</span>
            </span>
            <span class="gotoDDE" @click="gotoDDE">&nbsp;</span>
        </div>
    </div>
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
export default {
  name: "MarketCapitalSituation",
  components: {
    "card-title": cardTitle
  },
  created() {
    eventBus.$on("timeType", this.handle);
  },
  mounted() {
    var self = this;
    self.myChart = echarts.init(document.getElementById("capital-wrap"));
    if (window.theme == "black") {
      self.colorObj = self.blackTheme;
    } else {
      self.colorObj = self.whiteTheme;
    }
    self.getStock();
    self.update();
    self.stockInterval = setInterval(function() {
      self.getStock();
    }, 30000);
    self.chartInterval = setInterval(function() {
      self.update();
    }, 60000);

    $("#capital-wrap").on("mouseover", function() {
      clearInterval(self.maidianInterval);
      self.maidianInterval = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77fbce_583" });
      }, 2000);
    });
    $("#capital-wrap").on("mouseout", function() {
      clearInterval(self.maidianInterval);
    });

    // self.draw();
    $(window).resize(function() {
      if (self.myChart) {
        setTimeout(function() {
          self.myChart.resize();
        }, 30);
      }
      self.showLast = window.innerWidth > 1500;
    });
    // $util.resize(function(){
    //     self.myChart.resize()
    // });
  },
  beforeDestroy() {
    eventBus.$off("timeType", this.handle);
    clearInterval(this.stockInterval);
    clearInterval(this.chartInterval);
    clearInterval(this.ddemoneyInterval);
    clearInterval(this.maidianInterval);
  },
  data() {
    return {
      quanzhong: [],
      showLast: window.innerWidth > 1500,
      zhongxiao: [
        15,
        14,
        14,
        15,
        15,
        15,
        16,
        18,
        15,
        16,
        16,
        16,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        20,
        20,
        19,
        19,
        19,
        18,
        19,
        18,
        19,
        18,
        19,
        18,
        20,
        19,
        19,
        20,
        20,
        18,
        17,
        18,
        18,
        19,
        18,
        18,
        18,
        17,
        19,
        18,
        20,
        18,
        18,
        18,
        18,
        17,
        19,
        19,
        18,
        18,
        18,
        17,
        17,
        17,
        17,
        17,
        16,
        16,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19
      ],
      chuangye: [
        15,
        14,
        14,
        15,
        15,
        15,
        16,
        18,
        15,
        16,
        16,
        16,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        20,
        20,
        19,
        19,
        19,
        18,
        19,
        18,
        19,
        18,
        19,
        18,
        20,
        19,
        19,
        20,
        20,
        18,
        17,
        18,
        18,
        19,
        18,
        18,
        18,
        17,
        19,
        18,
        20,
        18,
        18,
        18,
        18,
        17,
        19,
        19,
        18,
        18,
        18,
        17,
        17,
        17,
        17,
        17,
        16,
        16,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19
      ],
      shangzheng: [],
      shenzheng: [],
      tradeDay: "",
      myChart: {},
      stock: [],
      stockInterval: null,
      chartInterval: null,
      ddemoneyInterval: null,
      mouseInChart: false,
      blackTheme: {
        backgroundColor: "#1b1b1b",
        legendText: "#fff",
        axisLineColor: "#52525A",
        axisLabelColor: "#52525A",
        axisTickColor: "#52525A"
      },
      whiteTheme: {
        backgroundColor: "#fff",
        legendText: "#7d7d7d",
        axisLineColor: "#eeeeee",
        axisLabelColor: "#868686",
        axisTickColor: "#5f5f5f"
      },
      colorObj: {},
      maidianInterval: null,
      //   waitTime:false,
      timeType: "tradingTime"
      //   chartMsg:{
      //       xIndex:void 0,
      //       sIndex:void 0
      //   }
    };
  },
  methods: {
    handle(val) {
      this.timeType = val;
    },
    update: function() {
      var self = this;
      Acme.getTime("yyyyMMdd", function(data) {
        Acme.getTradeDate(data, function(data) {
          self.tradeDay = data;
          window.API.use({
            method: "Quote.request",
            data: {
              code: "1a0001,399001,399005,399006",
              type: [
                "BIGBUYMONEY1",
                "WAITBUYMONEY1",
                "BIGSELLMONEY1",
                "WAITSELLMONEY1"
              ],
              period: "min",
              begin: self.tradeDay,
              end: self.tradeDay,
              timeFmt: 1
            },
            callbackName: "onready",
            success: function(data) {
              window.API.use({
                method: "Quote.getData2",
                data: {
                  code: "1a0001,399001,399005,399006",
                  type: [
                    "BIGBUYMONEY1",
                    "WAITBUYMONEY1",
                    "BIGSELLMONEY1",
                    "WAITSELLMONEY1"
                  ],
                  period: "min",
                  mode: "after",
                  time: {
                    begin: self.tradeDay,
                    end: self.tradeDay,
                    timeFmt: 1
                  },
                  timeStamp: 1,
                  updateMode: 1
                },
                success: function(data) {
                  var obj = JSON.parse(data);
                  self.shangzheng = [];
                  self.shenzheng = [];
                  self.zhongxiao = [];
                  self.chuangye = [];
                  for (var i in obj["1a0001"]) {
                    let num =
                      Number(obj["1a0001"][i].BIGBUYMONEY1) +
                      Number(obj["1a0001"][i].WAITBUYMONEY1) -
                      Number(obj["1a0001"][i].BIGSELLMONEY1) -
                      Number(obj["1a0001"][i].WAITSELLMONEY1);
                    self.shangzheng.push(Acme.toFixed(num / 100000000, 2));
                  }
                  for (var i in obj["399001"]) {
                    let num =
                      Number(obj["399001"][i].BIGBUYMONEY1) +
                      Number(obj["399001"][i].WAITBUYMONEY1) -
                      Number(obj["399001"][i].BIGSELLMONEY1) -
                      Number(obj["399001"][i].WAITSELLMONEY1);
                    self.shenzheng.push(Acme.toFixed(num / 100000000, 2));
                  }
                  for (var i in obj["399005"]) {
                    let num =
                      Number(obj["399005"][i].BIGBUYMONEY1) +
                      Number(obj["399005"][i].WAITBUYMONEY1) -
                      Number(obj["399005"][i].BIGSELLMONEY1) -
                      Number(obj["399005"][i].WAITSELLMONEY1);
                    self.zhongxiao.push(Acme.toFixed(num / 100000000, 2));
                  }
                  for (var i in obj["399006"]) {
                    let num =
                      Number(obj["399006"][i].BIGBUYMONEY1) +
                      Number(obj["399006"][i].WAITBUYMONEY1) -
                      Number(obj["399006"][i].BIGSELLMONEY1) -
                      Number(obj["399006"][i].WAITSELLMONEY1);
                    self.chuangye.push(Acme.toFixed(num / 100000000, 2));
                  }
                  self.draw(self.colorObj);
                }
              });
            }
          });
        });
      });

      //推送
      // var quoteSessionId = window.API.createSessionId('Quote');
      // window.API.use({
      //   method:'Quote.registerPush',
      //   data:{code:"1A0001,000016,399005,399006"},
      //   sessionId:quoteSessionId,
      //   persistent:true,
      //   callbackName:'onready',
      //   success:function(data){
      //     window.API.use({
      //      method:'Quote.getData2',
      //      data:{
      //        code:'1A0001,000016,399005,399006',
      //        type:['zhangdiefu','new','pre'],
      //        period:'min',
      //        mode:'maexact',
      //        time:{
      //             begin:20180124,
      //             end:20180124,
      //             timeFmt :1
      //         },
      //         timeStamp: 1,
      //         updateMode: 1
      //      },
      //      success:function(data){
      //       console.log(JSON.parse(data));
      //      }
      //    });
      //   }
      // });
      //解除推送
      // window.API.use({
      //   method:'Quote.unregisterPush',
      //   sessionId:quoteSessionId    //这里要传个sessionId，表明是解绑哪个对象的推送事件
      // });
    },
    draw: function(colorObj) {
      var self = this;
      // var myChart = echarts.init(document.getElementsByClassName('preformance-wrap')[0]);

      // 指定图表的配置项和数据
      var option = {
        backgroundColor: colorObj.backgroundColor, //图表背景颜色
        animation: false,
        title: {
          text: ""
        },
        tooltip: {
          trigger: "axis",
          // axisPointer: {
          //     show:false,
          //     snap: false
          // },
          textStyle: {
            align: "left"
          }
          // formatter (p) {
          //     console.log(p);
          //     if(p[0]!==undefined && p[0]['dataIndex']!==undefined) {
          //         self.chartMsg.xIndex = p[0]['dataIndex']
          //         // self.chartMsg.sIndex = p[0]['dataIndex']
          //         // console.log(p);s
          //         console.log(p[0]['dataIndex']);
          //         // self.outputData(p[0]['dataIndex'])
          //     }else{
          //         console.log('移出了');
          //         // return false;
          //     }
          // }
        },

        legend: {
          data: ["上证", "深证", "中小", "创业板"],
          right: 20,
          textStyle: {
            color: colorObj.legendText
          }
          // align:'right'
        },
        grid: {
          top: 25,
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            axisLabel: {
              interval: function(index) {
                if (index == 0 || index == 240 || index == 120) {
                  return true;
                }
              },
              color: colorObj.axisLabelColor
            },
            axisLine: {
              lineStyle: {
                color: colorObj.axisLineColor,
                width: 1,
                type: "dashed"
              }
            },
            axisTick: {
              show: false,
              lineStyle: {
                color: colorObj.axisTickColor
              }
            },
            boundaryGap: false,
            data: [
              "09:30",
              "09:31",
              "09:32",
              "09:33",
              "09:34",
              "09:35",
              "09:36",
              "09:37",
              "09:38",
              "09:39",
              "09:40",
              "09:41",
              "09:42",
              "09:43",
              "09:44",
              "09:45",
              "09:46",
              "09:47",
              "09:48",
              "09:49",
              "09:50",
              "09:51",
              "09:52",
              "09:53",
              "09:54",
              "09:55",
              "09:56",
              "09:57",
              "09:58",
              "09:59",
              "10:00",
              "10:01",
              "10:02",
              "10:03",
              "10:04",
              "10:05",
              "10:06",
              "10:07",
              "10:08",
              "10:09",
              "10:10",
              "10:11",
              "10:12",
              "10:13",
              "10:14",
              "10:15",
              "10:16",
              "10:17",
              "10:18",
              "10:19",
              "10:20",
              "10:21",
              "10:22",
              "10:23",
              "10:24",
              "10:25",
              "10:26",
              "10:27",
              "10:28",
              "10:29",
              "10:30",
              "10:31",
              "10:32",
              "10:33",
              "10:34",
              "10:35",
              "10:36",
              "10:37",
              "10:38",
              "10:39",
              "10:40",
              "10:41",
              "10:42",
              "10:43",
              "10:44",
              "10:45",
              "10:46",
              "10:47",
              "10:48",
              "10:49",
              "10:50",
              "10:51",
              "10:52",
              "10:53",
              "10:54",
              "10:55",
              "10:56",
              "10:57",
              "10:58",
              "10:59",
              "11:00",
              "11:01",
              "11:02",
              "11:03",
              "11:04",
              "11:05",
              "11:06",
              "11:07",
              "11:08",
              "11:09",
              "11:10",
              "11:11",
              "11:12",
              "11:13",
              "11:14",
              "11:15",
              "11:16",
              "11:17",
              "11:18",
              "11:19",
              "11:20",
              "11:21",
              "11:22",
              "11:23",
              "11:24",
              "11:25",
              "11:26",
              "11:27",
              "11:28",
              "11:29",
              "11:30",
              "13:01",
              "13:02",
              "13:03",
              "13:04",
              "13:05",
              "13:06",
              "13:07",
              "13:08",
              "13:09",
              "13:10",
              "13:11",
              "13:12",
              "13:13",
              "13:14",
              "13:15",
              "13:16",
              "13:17",
              "13:18",
              "13:19",
              "13:20",
              "13:21",
              "13:22",
              "13:23",
              "13:24",
              "13:25",
              "13:26",
              "13:27",
              "13:28",
              "13:29",
              "13:30",
              "13:31",
              "13:32",
              "13:33",
              "13:34",
              "13:35",
              "13:36",
              "13:37",
              "13:38",
              "13:39",
              "13:40",
              "13:41",
              "13:42",
              "13:43",
              "13:44",
              "13:45",
              "13:46",
              "13:47",
              "13:48",
              "13:49",
              "13:50",
              "13:51",
              "13:52",
              "13:53",
              "13:54",
              "13:55",
              "13:56",
              "13:57",
              "13:58",
              "13:59",
              "14:00",
              "14:01",
              "14:02",
              "14:03",
              "14:04",
              "14:05",
              "14:06",
              "14:07",
              "14:08",
              "14:09",
              "14:10",
              "14:11",
              "14:12",
              "14:13",
              "14:14",
              "14:15",
              "14:16",
              "14:17",
              "14:18",
              "14:19",
              "14:20",
              "14:21",
              "14:22",
              "14:23",
              "14:24",
              "14:25",
              "14:26",
              "14:27",
              "14:28",
              "14:29",
              "14:30",
              "14:31",
              "14:32",
              "14:33",
              "14:34",
              "14:35",
              "14:36",
              "14:37",
              "14:38",
              "14:39",
              "14:40",
              "14:41",
              "14:42",
              "14:43",
              "14:44",
              "14:45",
              "14:46",
              "14:47",
              "14:48",
              "14:49",
              "14:50",
              "14:51",
              "14:52",
              "14:53",
              "14:54",
              "14:55",
              "14:56",
              "14:57",
              "14:58",
              "14:59",
              "15:00"
            ]
          },
          {
            type: "category",
            // boundaryGap : false,
            axisLine: {
              onZero: false,
              lineStyle: { color: colorObj.axisLineColor }
            },
            axisLabel: { color: colorObj.axisLineColor },
            axisTick: { show: false },
            position: "bottom"
          }
        ],
        yAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: colorObj.axisLineColor
            }
          },
          axisLabel: {
            color: colorObj.axisLabelColor
          },
          axisTick: {
            show: false,
            lineStyle: {
              color: colorObj.axisTickColor
            }
          },
          splitLine: {
            show: false
          },
          name: "单位：亿",
          nameTextStyle: {
            color: "#999"
          },
          type: "value"
        },
        series: [
          {
            name: "上证",
            type: "line",
            symbol: "none",
            data: self.shangzheng,
            lineStyle: {
              width: 1
            }
          },
          {
            name: "深证",
            type: "line",
            symbol: "none",
            data: self.shenzheng,
            lineStyle: {
              width: 1
            }
          },
          {
            name: "中小",
            type: "line",
            symbol: "none",
            data: self.zhongxiao,
            lineStyle: {
              width: 1
            }
          },
          {
            name: "创业板",
            type: "line",

            symbol: "none",
            data: self.chuangye,
            lineStyle: {
              width: 1
            }
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      // console.log(typeof self.myChart.setOption)

      self.myChart.setOption(option);
    },
    gotoDDE: function() {
      window.API.use({
        method: "Quote.switchPage",
        data: 5422,
        success: function(data) {}
      });
      TA.log({ id: "L2rdzz_5a77fc65_567" });
    },
    gotoTimeLine: function(code) {
      Acme.gotoTimeLine(code);
      TA.log({ id: "L2rdzz_5a77fc29_967" });
    },
    getStock: function() {
      var self = this;
      self
        .$http({
          method: "get",
          url: "http://l2.10jqka.com.cn/hottrack/api/getDDEMoney"
        })
        .then(function(response) {
          var arr = response.data.result;
          var stocks = [];

          for (var i = 0; i < arr.length; i++) {
            let obj = {};
            obj.stockcode = arr[i].stockcode;
            stocks.push(obj.stockcode);
          }
          clearInterval(self.ddemoneyInterval);
          Acme.getHqData(
            {
              code: stocks,
              type: ["ZQMC", "592890"], //DDE大单金额
              period: "now",
              mode: "after"
            },
            function(data) {
              let stockList = [];
              for (var key in data) {
                let obj = {};
                obj.stockcode = key;
                obj.stockname = data[key]["ZQMC"] + ":";
                obj.ddemoney = Acme.toFixed(data[key]["592890"] / 100000000, 2);
                if (self.timeType == "waitTime" || isNaN(obj.ddemoney)) {
                  obj.ddemoney = "--";
                }
                stockList.push(obj);
              }
              var newArr = Acme.sort(stockList, false, "ddemoney");
              self.stock = newArr;
            }
          );
          self.ddemoneyInterval = setInterval(function() {
            Acme.getHqData(
              {
                code: stocks,
                type: ["ZQMC", "592890"], //DDE大单金额
                period: "now",
                mode: "after"
              },
              function(data) {
                let stockList = [];
                for (var key in data) {
                  let obj = {};
                  obj.stockcode = key;
                  obj.stockname = data[key]["ZQMC"] + ":";
                  obj.ddemoney = Acme.toFixed(
                    data[key]["592890"] / 100000000,
                    2
                  );
                  if (self.timeType == "waitTime" || isNaN(obj.ddemoney)) {
                    obj.ddemoney = "--";
                  }
                  stockList.push(obj);
                }
                var newArr = Acme.sort(stockList, false, "ddemoney");
                self.stock = newArr;
              }
            );
          }, 3000);
        })
        .catch(function(err) {
          console.log(err);
        });
    }
    //   outputData:function(x){
    //       var self=this;
    //       self.myChart.dispatchAction({
    //           type: 'updateAxisPointer',
    //           seriesIndex:0,
    //           dataIndex: x
    //       });
    //   }
  }
};
</script>
<style scoped>
.capital-wrap {
  height: 150px;
}

.capital-footer {
  line-height: 29px;
  height: 29px;
  font-size: 12px;
  color: #7d7d7d;
  background-color: #1b1b1b;
  text-align: left;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  justify-content: space-between;
}

.white .capital-footer {
  background-color: #fff;
}

.capital-footer span {
  /* margin-right: 10px; */
}

.gotoDDE {
  cursor: pointer;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180208/more-black.svg");
  background-position: center center;
  background-repeat: no-repeat;
  padding-right: 5px;
}

.gotoTimeLine {
  cursor: pointer;
}

.cr {
  color: #d6524d;
}

.cg {
  color: #1cbf7b;
}
</style>