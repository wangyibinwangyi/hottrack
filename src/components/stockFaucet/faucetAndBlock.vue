<template>
   <div style="position:relative;height:100%;" v-on:mouseover="throwTalog()" v-on:mouseleave="clearTalog()">
      <card-title cardtitle='龙头与板块（四十天）' class="card-title-faucet"></card-title>
      <div v-if="waitTime" class="wait-time-text">
        <span>还未开盘，稍等片刻</span>
      </div>
      <div class="faucet-chart" v-else>
        <faucet-block
          ref="faucetBlock"
          :theme="theme"
          :series="series"
          :date="date"
          :stockList="stockList"
          :tipData="tipData"
          :ZQMCForZDF="ZQMCForZDF"
        >
        </faucet-block>
      </div>
   </div>
  
  
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import faucetBlock from "@/lib/faucetBlock/faucetBlock";
export default {
  name: "faucetAndBlock",
  components: {
    "card-title": cardTitle,
    "faucet-block": faucetBlock
  },
  created() {
    var self = this;
    eventBus.$on("faucetAndBlock", self.getEventBusData);
  },
  beforeDestroy() {
    var self = this;
    eventBus.$off("faucetAndBlock", self.getEventBusData);
  },
  mounted() {
    // window.onresize = function(){
    //   // self.$refs.faucetBlock.resize()
    // }
    var self = this;
    self.checkoutServerTime();
    $(window).resize(function() {
      if (self.$refs.faucetBlock) {
        setTimeout(function() {
          self.$refs.faucetBlock.resize();
        }, 30);
      }
    });
    if ($(".white").length) {
      //黑白皮肤切换
      self.theme = "white";
    }
  },
  data() {
    return {
      waitTime: false,
      date: [],
      series: [],
      stockList: {},
      tipData: [],
      ZQMCForZDF: {},
      url: "http://l2.10jqka.com.cn",
      theme: "black"
    };
  },
  props: {
    tradeDays: {
      type: Array,
      required: true
    }
  },
  methods: {
    throwTalog: function() {
      var self = this;
      let type = "faucetTaLog";
      if (self[type]) {
        return;
      }
      self[type] = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77f8a3_306" });
      }, 2000);
    },
    clearTalog: function() {
      var self = this;
      let type = "faucetTaLog";
      if (self[type]) {
        clearInterval(self[type]);
        delete self[type];
      }
    },
    checkoutServerTime: function() {
      var self = this;
      API.use({
        method: "Quote.getServerTime",
        success: function(result) {
          var now = new Date(result * 1000);
          // now=new Date(1517534694*1000);
          var month =
            now.getMonth() >= 9
              ? now.getMonth() + 1
              : "0" + (now.getMonth() + 1);
          var day = now.getDate() >= 10 ? now.getDate() : "0" + now.getDate();
          var date = "" + now.getFullYear() + month + day;
          cefClient.judgeTradingDay({
            date: date,
            success: function(tradingDay) {
              if (tradingDay) {
                if (
                  now.getHours() == 9 &&
                  now.getMinutes() >= 0 &&
                  now.getMinutes() < 25
                ) {
                  var delayTime =
                    (24 - now.getMinutes()) * 60 * 1000 +
                    (60 - now.getSeconds()) * 1000;
                  self.waitTime = true;
                  setTimeout(function() {
                    self.waitTime = false;
                  }, delayTime);
                } else {
                  self.waitTime = false;
                }
              } else {
                //如果是交易日9点到9点25之间
                self.waitTime = false;
              }
            }
          });
        }
      });
    },
    getEventBusData: function(codeObj) {
      var self = this;
      let codeList = codeObj.codeList;
      let platecode = codeObj.platecode;
      self.getData(codeList, platecode);
    },
    getData: function(codeList, blockCode) {
      var self = this;
      let beginData = self.tradeDays[45];
      let endData = self.tradeDays[0];
      codeList.unshift(blockCode);
      console.log(codeList);
      Acme.getClientData(
        {
          code: codeList,
          type: "55",
          period: "now",
          mode: "after"
        },
        function(nameData) {
          console.log(nameData);
          Acme.getHqData(
            {
              code: codeList,
              type: ["PRE", "CLOSE"],
              period: "day",
              mode: "after",
              time: {
                begin: beginData,
                end: endData,
                timeFmt: 1
              }
            },
            function(data) {
              console.log(data);
              data = self.renderData(
                data,
                codeList,
                nameData,
                self.tradeDays.slice(0, 40).reverse()
              );
              self.date = data.date;
              self.ZQMCForZDF = data.ZQMCForZDF;
              self.series = data.series;
              self.stockList = data.stockList;
              self.tipData = data.tipData;
              // console.log(data['881153']['20171207']['MONEY']/data['881153']['20171207']['DPLTSZ']*100)
              // console.log(JSON.stringify(data));
            }
          );
        }
      );
    },
    renderData: function(data, codeList, nameData, tradeDays) {
      var blockName = codeList.shift();
      var dataObj = {
        stockList: {},
        date: tradeDays,
        series: [],
        ZQMCForZDF: {},
        tipData: []
      };
      var colorList = [
        "214, 82, 77",
        "27, 107, 165",
        "0, 182, 237",
        "184, 222, 241"
      ];
      if (this.theme == "white") {
        colorList = [
          "214, 82, 77",
          "0, 88, 155",
          "36, 138, 216",
          "149, 212, 255"
        ];
      }
      var nameList = [];
      $.each(codeList, function(key, val) {
        nameList.push(val);
      });
      nameList.unshift(blockName);
      $.each(nameList, function(key, val) {
        key = val;
        val = data[val] || [];
        dataObj.stockList[key] = [];
        var color = colorList.shift();
        var startZDF = 0;
        dataObj.ZQMCForZDF[nameData[key]["55"]] = [];
        $.each(tradeDays, function(keys, value) {
          value = val[value];
          if (!value) {
            dataObj.ZQMCForZDF[nameData[key]["55"]].push("-");
            dataObj.stockList[key].push(0);
            return true;
          } else {
            //非停牌，传给之前所有值为-999的最新的值
            var ZDF =
              (Number(value["CLOSE"]) - Number(value["PRE"])) /
              value["PRE"] *
              100;
            if (isNaN(ZDF)) {
              ZDF = 0;
            }
            startZDF = startZDF + ZDF;
            // if(dataObj.stockList[key][keys-1]===-999){
            //   $.each(dataObj.stockList[key],function(kay,vals){
            //     if(Number(vals) === -999){
            //       dataObj.stockList[key][kay] = ZDF;
            //     }else{
            //       return true;
            //     }
            //   });
            // }
            dataObj.ZQMCForZDF[nameData[key]["55"]].push(ZDF.toFixed(2));
            dataObj.stockList[key].push("" + startZDF.toFixed(2));
          }
          // if(keys===tradeDays.length){//最新一天依然停牌。
          //   if(dataObj.stockList[key][keys-1]===-999){
          //     $.each(dataObj.stockList[key],function(kay,vals){
          //       if(Number(vals) === -999){
          //         dataObj.stockList[key][kay] = ZDF;
          //       }else{
          //         return true;
          //       }
          //     });
          //   }
          // }
        });
        //设置tip
        dataObj.tipData.push({
          icon: "circle",
          name: nameData[key]["55"]
        });
        let areaStyle;
        if (key === blockName) {
          areaStyle = {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "rgba(" + color + ",0.5)"
                  },
                  {
                    offset: 1,
                    color: "rgba(" + color + ",0.2)"
                  }
                ],
                false
              ),
              origin: "start"
            }
          };
        }
        //设置画线数据
        dataObj.series.push({
          name: nameData[key]["55"],
          type: "line",
          // smooth: true,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 2,
          data: dataObj.stockList[key],
          // markLine: {
          //   symbol: "none",
          //   client: true,
          //   label: {
          //     show: true,
          //     position: "start",
          //     symbol: "circle",
          //     formatter: function() {
          //       return (
          //         dataObj.stockList[key][dataObj.stockList[key].length - 1] +
          //         "%"
          //       );
          //     }
          //   },
          //   data: [
          //     {
          //       yAxis: dataObj.stockList[key][dataObj.stockList[key].length - 1]
          //     }
          //   ]
          // },
          areaStyle: areaStyle,
          itemStyle: {
            normal: {
              color: "rgba(" + color + ",1)"
            }
          },
          lineStyle: {
            normal: {
              width: 2
            }
          }
        });
      });
      return dataObj;
    },
    openTimeLine: function(event) {
      Acme.go2TimeLine(event);
    }
  }
};
</script>
<style scoped>
.red {
  color: #f3564d;
}
.green {
  color: #1cbf7b;
}
.card-title-faucet {
  position: absolute;
  z-index: 20;
}
.faucet-chart {
  min-height: 248px;
  height: 100%;
  width: 100%;
}
.wait-time-text {
  color: #7d7d7d;
  height: 100%;
  font-size: 12px;
  width: 100%;
  line-height: 285px;
  text-align: center;
}
</style>
