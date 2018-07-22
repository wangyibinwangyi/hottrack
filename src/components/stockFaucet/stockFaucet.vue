<template>
   <div>
      <card-title cardtitle='个股龙头'></card-title>
      <div v-if="waitTime" class="wait-time-text">
        <span>还未开盘，稍等片刻</span>
      </div>
      <ul class="stock-head-list" v-else>
          <li class="stock-head-item" v-for="(item,key) in stockData">
              <div class="stock-head-name" v-on:click="openTimeLine(item,key)">{{item.ZQMC}}</div>
              <div class="stock-head-value">
                  <span class="stock-head-vol" v-bind:class="{ red: item.isRed, green :item.isGreen}">量{{item.vol}}</span>
                  <span class="stock-head-zdf" v-bind:class="{ red: item.isRed, green :item.isGreen}">{{item.zdf}}</span>
              </div>
          </li>
      </ul>
   </div>
  
  
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
export default {
  name: "stockFaucet",
  components: {
    "card-title": cardTitle
  },
  created() {
    var self = this;
    eventBus.$on("blockCode", self.getEventBusData);
  },
  beforeDestroy() {
    var self = this;
    eventBus.$off("blockCode", self.getEventBusData);
    clearInterval(self.timer);
  },
  mounted() {
    const self = this;
    self.checkoutServerTime();
    self.timer = setInterval(function() {
      if (self.code != "") {
        self.getStockData(self.code);
      }
    }, 120000);
  },
  data() {
    return {
      waitTime: false,
      code: "",
      url: "http://l2.10jqka.com.cn",
      stockData: [],
      quoteSessionId: window.API.createSessionId("Quote"),
      pushTime: +new Date()
    };
  },
  methods: {
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
    getEventBusData: function(val) {
      var self = this;
      self.getStockData(val);
      self.code = val;
    },
    updateByPush: function(stockList, stockData) {
      //推送数据
      let self = this;

      API.use({
        method: "Quote.registerPush",
        data: { code: stockList },
        sessionId: self.quoteSessionId,
        persistent: true,
        callbackName: "onready",
        success: function(data) {
          var newDate = +new Date();
          if (newDate - self.pushTime < 2000) {
            return;
          } else {
            Acme.getHqData(
              {
                code: stockList,
                type: ["ZHANGDIEFU", "VOL"],
                period: "now",
                mode: "after"
              },
              function(data) {
                // console.log(data)
                $.each(stockList, function(key, val) {
                  stockData[val]["vol"] = self.translateVOL(data[val]["VOL"]);
                  stockData[val]["zdf"] = self.translateZDF(
                    data[val]["ZHANGDIEFU"]
                  );
                  stockData[val]["isRed"] =
                    Number(data[val]["ZHANGDIEFU"]) > 0 ? true : false;
                  stockData[val]["isGreen"] =
                    Number(data[val]["ZHANGDIEFU"]) < 0 ? true : false;
                });
                var arrayStockData = [];
                $.each(stockList, function(key, val) {
                  arrayStockData.push(stockData[val]);
                });
                self.stockData = arrayStockData;
                self.pushTime = new Date();
              }
            );
          }
        }
      });
    },
    getStockData: function(code) {
      var self = this;
      self
        .$http({
          method: "get",
          url: self.url + "/hottrack/service/stocklead",
          params: {
            platecode: code
          }
        })
        .then(function(response) {
          if (response.data.errorcode == 0) {
            var result = response.data;
            var stockList = [];
            var stockData = {};
            $.each(result.result, function(key, val) {
              stockData[val.stockcode] = {};
              stockData[val.stockcode]["ZQMC"] = val.stockname;
              stockData[val.stockcode]["code"] = val.stockcode;
              stockList.push(val.stockcode);
            });

            var newStock = [].concat(stockList);
            eventBus.$emit("faucetAndBlock", {
              codeList: newStock,
              platecode: code
            });

            //推送
            self.updateByPush(stockList, stockData);
            Acme.getHqData(
              {
                code: stockList,
                type: ["ZHANGDIEFU", "VOL"],
                period: "now",
                mode: "after"
              },
              function(data) {
                $.each(stockList, function(key, val) {
                  stockData[val]["vol"] = self.translateVOL(data[val]["VOL"]);
                  stockData[val]["zdf"] = self.translateZDF(
                    data[val]["ZHANGDIEFU"]
                  );
                  stockData[val]["isRed"] =
                    Number(data[val]["ZHANGDIEFU"]) > 0 ? true : false;
                  stockData[val]["isGreen"] =
                    Number(data[val]["ZHANGDIEFU"]) < 0 ? true : false;
                });
                var arrayStockData = [];
                $.each(stockList, function(key, val) {
                  arrayStockData.push(stockData[val]);
                });
                self.stockData = arrayStockData;
                self.pushTime = new Date();
              }
            );
          }
        })
        .catch(function(err) {
          console.log(err);
        });

      // var quoteSessionId = window.API.createSessionId('Quote');
      // API.use({
      //   method:'Quote.registerPush',
      //   data:{code:stockList},
      //   sessionId:quoteSessionId,
      //   persistent:true,
      //   callbackName:'onReady',
      //   success:function(data){
      //     if(self.pushTime<500){
      //       pushTime+=100
      //     }else{
      //       Acme.getHqData({
      //         code:stockList,
      //         type:['ZHANGDIEFU','VOL'],
      //         period:'now',
      //         mode:'after'
      //       },function(data){
      //           $.each(stockList,function(key,val){
      //             stockData[val]['vol'] = self.translateVOL(data[val]['VOL']);
      //             stockData[val]['zdf'] = self.translateZDF(data[val]['ZHANGDIEFU']);
      //             stockData[val]['isRed'] = Number(data[val]['ZHANGDIEFU'])>0?true:false;
      //             stockData[val]['isGreen'] = Number(data[val]['ZHANGDIEFU'])<0?true:false;
      //           })
      //       });
      //     }
      //   }
      // });
    },
    translateZDF: function(num) {
      if (isNaN(num)) {
        return "-";
      }
      if (Number(num) > 0) {
        return "+" + Number(num).toFixed(1) + "%";
      } else {
        return Number(num).toFixed(1) + "%";
      }
    },
    translateVOL: function(num) {
      if (isNaN(num)) {
        return "-";
      }
      num = Number(num);
      if (num > 999 && num < 10000000) {
        num = (num / 10000).toFixed(1);
        return num + "万";
      } else if (num > 9999999) {
        num = (num / 100000000).toFixed(1);
        return num + "亿";
      } else {
        return num.toFixed(0);
      }
    },
    openTimeLine: function(item) {
      TA.log({ id: "L2rdzz_5a77f7cc_384" });
      Acme.go2TimeLine(item.code);
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
.stock-head-box {
  width: 407px;
  height: 120px;
  background: #1b1b1b;
  overflow: hidden;
}
.stock-head-title {
  font-size: 14px;
  color: #fff;
  padding-left: 7px;
  margin: 10px 0;
  border-left: 3px solid #d6524d;
  clear: both;
}
.stock-head-list {
  font-size: 12px;
  list-style: none;
  width: 100%;
  margin: 0;
  margin-top: 10px;
  padding: 0;
  float: left;
  display: flex;
  justify-content: space-around;
}
.wait-time-text {
  color: #7d7d7d;
  height: 100%;
  font-size: 12px;
  width: 100%;
  line-height: 60px;
  text-align: center;
}
.stock-head-item {
  width: 120px;
  height: 67px;
  border: 1px solid #3c3c3c;
}
.white .stock-head-item {
  border: 1px solid #eee;
}
.stock-head-name {
  cursor: pointer;
  background: #d6524d;
  color: #fff;
  text-align: center;
  line-height: 30px;
}
.white .stock-head-name {
  background: #f16a4d;
}
.stock-head-value {
  line-height: 34px;
  padding: 0 5px;
  cursor: default;
  color: #7d7d7d;
  white-space: nowrap;
}
.stock-head-zdf {
  float: left;
}
.stock-head-vol {
  float: right;
}
</style>
